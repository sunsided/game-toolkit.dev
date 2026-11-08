// Checks out every pinned crate, copies the images the registry names into static/media/,
// and builds the demos for the browser into static/demos/<slug>/.
//
//   node scripts/demos.ts                 sources and demos (what `task build` and CI run)
//   node scripts/demos.ts --sources-only  checkouts and images only (fast; `task dev`)
//
// Everything slow is cached under .cache/, keyed by commit: src/ (checkouts), target/ (cargo,
// one per repository, so demos from one repo share a build), demos/ (finished builds). A pin
// change rebuilds that repository's demos; nothing else is touched.
//
// A demo is `cargo build --release --target wasm32-unknown-unknown` of one binary or
// example, `wasm-bindgen --target web`, its asset folder, and a page of our own that gives
// it a canvas. Not trunk: trunk cannot build cargo examples, and most demos are examples.
// wasm-bindgen must match the version in the checkout's Cargo.lock; see wasmBindgen().
//
// A release demo (a game's own web build, `release` in the registry) is instead the zip
// attached to a GitHub release: pinned by SHA-256, checked against the repository's
// build-provenance attestation, refused if any entry could escape the folder, unpacked,
// and given the same page of ours. Its poster is read from the repository at the tag,
// pinned by SHA-256 as well.

import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
	cpSync,
	existsSync,
	lstatSync,
	mkdirSync,
	readFileSync,
	readdirSync,
	rmSync,
	writeFileSync
} from 'node:fs';
import { homedir } from 'node:os';
import { basename, join } from 'node:path';
import {
	DEMOS,
	PROJECTS,
	checkoutName,
	demoFiles,
	mediaPath,
	posterPath,
	problems,
	project,
	type Demo,
	type Pin,
	type Project
} from '../src/lib/registry.ts';

const ROOT = join(import.meta.dirname, '..');
const CACHE = join(ROOT, '.cache');
const STATIC = join(ROOT, 'static');
const TARGET = 'wasm32-unknown-unknown';
// Bump when buildDemo() changes what it writes, so cached builds are redone.
const LAYOUT = 3;

function run(cmd: string, args: string[], opts: { cwd?: string; env?: NodeJS.ProcessEnv } = {}) {
	execFileSync(cmd, args, {
		stdio: 'inherit',
		cwd: opts.cwd,
		env: { ...process.env, ...opts.env }
	});
}

function capture(cmd: string, args: string[], cwd?: string) {
	return execFileSync(cmd, args, {
		cwd,
		encoding: 'utf8',
		stdio: ['ignore', 'pipe', 'pipe']
	}).trim();
}

/** The pinned commit, checked out once into .cache/src/ and verified to be that commit. */
function checkout(p: Project & { pin: Pin }): string {
	const dir = join(CACHE, 'src', checkoutName(p));
	if (!existsSync(join(dir, '.git'))) {
		console.log(`checkout ${p.repo} ${p.pin.tag} (${p.pin.commit.slice(0, 12)})`);
		rmSync(dir, { recursive: true, force: true });
		mkdirSync(dir, { recursive: true });
		run('git', ['init', '--quiet'], { cwd: dir });
		run('git', ['fetch', '--quiet', '--depth', '1', `https://github.com/${p.repo}`, p.pin.commit], {
			cwd: dir
		});
		run('git', ['-c', 'advice.detachedHead=false', 'checkout', '--quiet', 'FETCH_HEAD'], {
			cwd: dir
		});
	}
	const head = capture('git', ['rev-parse', 'HEAD'], dir);
	if (head !== p.pin.commit) throw new Error(`${dir}: HEAD is ${head}, pinned ${p.pin.commit}`);
	return dir;
}

function copyMedia(p: Project, src: string) {
	const paths = [
		...(p.gallery ?? []).map((m) => m.path),
		// Release demos' posters come from their own repository; see releasePoster().
		...DEMOS.filter((d) => d.project === p.slug && d.build && d.poster).map((d) => d.poster!.path)
	];
	const served = new Map<string, string>();
	for (const path of paths) {
		const to = mediaPath(p.slug, path);
		if (served.has(to) && served.get(to) !== path)
			throw new Error(`${p.slug}: ${path} and ${served.get(to)} would both be served as ${to}`);
		served.set(to, path);
		const from = join(src, path);
		if (!existsSync(from)) throw new Error(`${p.slug}: ${path} is not in ${p.pin!.tag}`);
		mkdirSync(join(STATIC, to, '..'), { recursive: true });
		cpSync(from, join(STATIC, to));
	}
}

/** The `version = ` of a package in a Cargo.lock. */
function lockedVersion(lock: string, name: string): string {
	const m = lock.match(new RegExp(`\\[\\[package\\]\\]\\nname = "${name}"\\nversion = "([^"]+)"`));
	if (!m) throw new Error(`${name} is not in Cargo.lock`);
	return m[1];
}

/**
 * A wasm-bindgen CLI of exactly `version` (it must match the crate the wasm was built with):
 * the one on PATH if it is that version, trunk's download, or our own install. Without any,
 * it is installed from crates.io into .cache/tools/ (cached in CI; once per version).
 */
function wasmBindgen(version: string): string {
	const ours = join(CACHE, 'tools', `wasm-bindgen-${version}`);
	const candidates = [
		'wasm-bindgen',
		join(homedir(), '.cache', 'trunk', `wasm-bindgen-${version}`, 'wasm-bindgen'),
		join(ours, 'bin', 'wasm-bindgen')
	];
	const matches = (bin: string) => {
		try {
			return capture(bin, ['--version']) === `wasm-bindgen ${version}`;
		} catch {
			return false;
		}
	};
	const found = candidates.find(matches);
	if (found) return found;
	console.log(`install wasm-bindgen-cli ${version}`);
	const args = ['install', 'wasm-bindgen-cli', '--version', version, '--locked', '--root', ours];
	run('cargo', args);
	return join(ours, 'bin', 'wasm-bindgen');
}

/** The page a demo runs in, inside the site's iframe. */
function page(d: Demo, p: Project) {
	// Registry values, held to plain shapes by problems(); booleans as "true" / "false".
	const data = Object.entries(d.options ?? {})
		.map(([k, v]) => ` data-${k}="${v}"`)
		.join('');
	const canvas = d.canvas ? `<canvas id="${d.canvas}" tabindex="0"${data}></canvas>` : '';
	return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="robots" content="noindex" />
<title>${d.title} · ${p.name}</title>
<style>
	html, body { margin: 0; height: 100%; background: #07080c; overflow: hidden; }
	body { display: grid; place-items: center; font: 14px/1.5 system-ui, sans-serif; color: #c9cbd6; }
	/* Fill the frame; the program sees the size through winit and fits itself into it. Fixed,
	   because in body's grid a 100% height falls back to the canvas's own (square) pixel size. */
	canvas { position: fixed; inset: 0; display: block; width: 100% !important; height: 100% !important; outline: none; touch-action: none; }
	.error { max-width: 36ch; padding: 1.5rem; text-align: center; }
</style>
</head>
<body>
${canvas}
<script type="module">
	import init from './${demoFiles(d).module}';
	const fail = (message) => {
		document.body.innerHTML = '';
		const p = document.createElement('p');
		p.className = 'error';
		p.textContent = message;
		document.body.append(p);
		parent.postMessage({ demo: ${JSON.stringify(d.slug)}, state: 'error', message }, '*');
	};
	// A panic after start surfaces as an uncaught error (the Rust message is in the console).
	// Not failures: winit throws one on purpose to leave its setup code, and the browser
	// reports a ResizeObserver loop when the canvas resizes (fullscreen); the demo runs on.
	const stopped = (e) => {
		const message = String(e?.message ?? e?.reason?.message ?? e?.reason ?? 'unknown error');
		if (message.includes('control flow') || message.includes('ResizeObserver loop')) return;
		fail('This demo stopped: ' + message);
	};
	addEventListener('error', stopped);
	addEventListener('unhandledrejection', stopped);
	init()
		.then(() => {
			document.querySelector('canvas')?.focus();
			parent.postMessage({ demo: ${JSON.stringify(d.slug)}, state: 'running' }, '*');
		})
		.catch((e) => fail('This demo could not start: ' + (e?.message ?? e)));
</script>
</body>
</html>
`;
}

function buildDemo(d: Demo, p: Project & { pin: Pin }, src: string): string {
	// Keyed by everything that shapes the output, so editing a demo's build rebuilds it.
	const key = createHash('sha256')
		.update(
			JSON.stringify([LAYOUT, p.pin.commit, d.build, d.assets, d.canvas, d.title, page.toString()])
		)
		.digest('hex')
		.slice(0, 16);
	const out = join(CACHE, 'demos', `${d.slug}-${key}`);
	if (existsSync(join(out, '.done'))) return out;

	console.log(`build ${d.slug} (${p.repo} ${p.pin.tag})`);
	rmSync(out, { recursive: true, force: true });
	const { package: pkg, bin, example, features = [] } = d.build!;
	const targetDir = join(CACHE, 'target', p.slug);
	const args = ['build', '--release', '--locked', '--target', TARGET, '-p', pkg];
	if (bin) args.push('--bin', bin);
	if (example) args.push('--example', example);
	if (features.length) args.push('--features', features.join(','));
	run('cargo', args, { cwd: src, env: { CARGO_TARGET_DIR: targetDir } });

	const name = example ?? bin ?? pkg;
	const wasm = join(targetDir, TARGET, 'release', example ? 'examples' : '', `${name}.wasm`);
	if (!existsSync(wasm)) throw new Error(`${d.slug}: cargo built no ${wasm}`);

	const version = lockedVersion(readFileSync(join(src, 'Cargo.lock'), 'utf8'), 'wasm-bindgen');
	run(wasmBindgen(version), [
		'--target',
		'web',
		'--no-typescript',
		'--out-dir',
		out,
		'--out-name',
		'demo',
		wasm
	]);

	if (d.assets) cpSync(join(src, d.assets), join(out, 'assets'), { recursive: true });
	writeManifest(out);
	writeFileSync(join(out, 'index.html'), page(d, p));
	writeFileSync(join(out, '.done'), `${p.repo} ${p.pin.commit}\n`);
	return out;
}

// --- Release demos ---------------------------------------------------------------------------

function sha256(file: string) {
	return createHash('sha256').update(readFileSync(file)).digest('hex');
}

async function download(url: string, dest: string) {
	const res = await fetch(url, { redirect: 'follow' });
	if (!res.ok) throw new Error(`GET ${url}: ${res.status} ${res.statusText}`);
	mkdirSync(join(dest, '..'), { recursive: true });
	writeFileSync(dest, Buffer.from(await res.arrayBuffer()));
}

/** `file` fetched once into .cache/releases/ and held to its pinned SHA-256. */
async function pinned(url: string, file: string, hash: string): Promise<string> {
	const dest = join(CACHE, 'releases', file);
	if (!existsSync(dest) || sha256(dest) !== hash) await download(url, dest);
	const actual = sha256(dest);
	if (actual !== hash) {
		rmSync(dest);
		throw new Error(`${url}: SHA-256 ${actual}, registry pins ${hash}`);
	}
	return dest;
}

/**
 * GitHub build provenance of `file` from `repo`. CI must check it (GH_TOKEN set); locally a
 * missing `gh` login skips it with a note, the SHA-256 pin still holds.
 */
function verifyProvenance(file: string, repo: string) {
	try {
		capture('gh', ['auth', 'status']);
	} catch {
		if (process.env.CI)
			throw new Error('gh is not logged in: CI must verify provenance (GH_TOKEN)');
		console.warn(`  note: gh not logged in, provenance of ${basename(file)} not verified`);
		return;
	}
	capture('gh', ['attestation', 'verify', file, '--repo', repo]);
	console.log(`  provenance verified: ${basename(file)}`);
}

/**
 * Refuses a zip whose contents could escape or leak once unpacked and published: anything
 * but regular files and folders (a symlink to a runner file would be published), absolute
 * paths, `..` segments, backslashes. `entry` must be a regular file at its root.
 */
function checkZip(zip: string, entry: string) {
	const names = capture('zipinfo', ['-1', zip]).split('\n').filter(Boolean);
	// Long listing, same order as -1: the first column is the Unix mode, `l` for a link.
	const modes = capture('zipinfo', [zip])
		.split('\n')
		.filter((l) => /^[-a-z?]{10}\s/.test(l))
		.map((l) => l[0]);
	if (modes.length !== names.length)
		throw new Error(`${zip}: could not read every entry's type (${modes.length}/${names.length})`);
	const bad = names.filter(
		(name, i) =>
			(modes[i] !== '-' && modes[i] !== 'd') ||
			name.startsWith('/') ||
			name.includes('\\') ||
			name.split('/').includes('..')
	);
	if (bad.length) throw new Error(`${zip}: refusing unsafe entries: ${bad.join(', ')}`);
	const at = names.indexOf(entry);
	if (at < 0 || modes[at] !== '-') throw new Error(`${zip}: no ${entry} file at its root`);
}

/** After unpacking: nothing but regular files and folders, as checkZip promised. */
function assertPlainTree(dir: string) {
	for (const name of readdirSync(dir, { recursive: true }) as string[]) {
		const stat = lstatSync(join(dir, name));
		if (!stat.isFile() && !stat.isDirectory())
			throw new Error(`${dir}: ${name} is not a regular file or folder`);
	}
}

/** The file is the raster image its name says (magic bytes), not HTML or SVG in disguise. */
function checkImage(file: string) {
	const head = readFileSync(file).subarray(0, 12);
	const is = (bytes: number[], at = 0) => bytes.every((b, i) => head[at + i] === b);
	const ext = file.slice(file.lastIndexOf('.') + 1).toLowerCase();
	const ok: Record<string, boolean> = {
		png: is([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
		jpg: is([0xff, 0xd8, 0xff]),
		jpeg: is([0xff, 0xd8, 0xff]),
		webp: is([0x52, 0x49, 0x46, 0x46]) && is([0x57, 0x45, 0x42, 0x50], 8)
	};
	if (!ok[ext]) throw new Error(`${file}: not a ${ext.toUpperCase()} image`);
}

async function releasePoster(d: Demo) {
	const r = d.release!;
	const poster = d.poster!;
	const url = `https://raw.githubusercontent.com/${r.repo}/${r.tag}/${poster.path}`;
	const file = await pinned(url, `${d.slug}-poster-${basename(poster.path)}`, poster.sha256!);
	checkImage(file);
	const to = join(STATIC, posterPath(d)!);
	mkdirSync(join(to, '..'), { recursive: true });
	cpSync(file, to);
}

async function releaseDemo(d: Demo, p: Project): Promise<string> {
	const r = d.release!;
	const key = createHash('sha256')
		.update(JSON.stringify([LAYOUT, r, d.canvas, d.options, d.title, page.toString()]))
		.digest('hex')
		.slice(0, 16);
	const out = join(CACHE, 'demos', `${d.slug}-${key}`);
	if (existsSync(join(out, '.done'))) return out;

	console.log(`fetch ${d.slug} (${r.repo} ${r.tag})`);
	const url = `https://github.com/${r.repo}/releases/download/${r.tag}/${r.asset}`;
	const zip = await pinned(url, r.asset, r.sha256);
	verifyProvenance(zip, r.repo);
	checkZip(zip, r.module);
	rmSync(out, { recursive: true, force: true });
	mkdirSync(out, { recursive: true });
	run('unzip', ['-q', '-o', zip, '-x', '.trunk-lock', '-d', out]);
	assertPlainTree(out);
	writeManifest(out);
	// Ours replaces the game's own page: it fills the frame and reports back to the player.
	writeFileSync(join(out, 'index.html'), page(d, p));
	writeFileSync(join(out, '.done'), `${r.repo} ${r.tag} ${r.sha256}\n`);
	return out;
}

/**
 * The toolkit preloads what assets/manifest.txt lists, and asks for it even when there are
 * no assets; an empty one saves a 404 in the console.
 */
function writeManifest(out: string) {
	const manifest = join(out, 'assets', 'manifest.txt');
	if (existsSync(manifest)) return;
	mkdirSync(join(out, 'assets'), { recursive: true });
	writeFileSync(manifest, '');
}

async function main() {
	const sourcesOnly = process.argv.includes('--sources-only');
	const bad = problems();
	if (bad.length) throw new Error(`registry:\n  ${bad.join('\n  ')}`);

	rmSync(join(STATIC, 'media'), { recursive: true, force: true });
	const sources = new Map<string, string>();
	for (const p of PROJECTS) {
		if (!p.pin) continue;
		const src = checkout(p as Project & { pin: Pin });
		sources.set(p.slug, src);
		copyMedia(p, src);
	}
	for (const d of DEMOS) if (d.release && d.poster) await releasePoster(d);
	if (sourcesOnly) return;

	rmSync(join(STATIC, 'demos'), { recursive: true, force: true });
	for (const d of DEMOS) {
		const p = project(d.project);
		const src = sources.get(p.slug);
		let out: string;
		if (d.release) out = await releaseDemo(d, p);
		else if (src) out = buildDemo(d, p as Project & { pin: Pin }, src);
		else continue; // unreleased: no pin, no build
		cpSync(out, join(STATIC, 'demos', d.slug), {
			recursive: true,
			filter: (f) => basename(f) !== '.done'
		});
	}
}

await main();
