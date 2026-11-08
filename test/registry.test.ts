import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { DEMOS, PROJECTS, demoPath, mediaPath, problems } from '../src/lib/registry.ts';

test('the registry holds its invariants', () => {
	assert.deepEqual(problems(), []);
});

test('every released crate is pinned; the unreleased one is not', () => {
	for (const p of PROJECTS)
		assert.equal(!!p.pin, p.status !== 'in-development', `${p.slug}: pin vs status`);
});

test('exactly one core crate, and it is game-toolkit', () => {
	assert.deepEqual(
		PROJECTS.filter((p) => p.role === 'core').map((p) => p.slug),
		['game-toolkit']
	);
});

test('demos and media are served below their own folders', () => {
	for (const d of DEMOS) assert.match(demoPath(d), /^demos\/[a-z0-9-]+\/$/);
	assert.equal(mediaPath('dosvideo', 'docs/a/b.png'), 'media/dosvideo/b.png');
});

test('problems() catches what would escape a path or an argument', () => {
	const demo = DEMOS[0];
	const saved = { ...demo, build: { ...demo.build } };
	try {
		demo.assets = '../../etc';
		demo.build!.package = 'x; rm -rf /';
		demo.slug = 'Bad Slug';
		const found = problems().join('\n');
		assert.match(found, /path "\.\.\/\.\.\/etc"/);
		assert.match(found, /name "x; rm -rf \/"/);
		assert.match(found, /demo slug "Bad Slug"/);
	} finally {
		Object.assign(demo, saved);
		if (!('assets' in saved)) delete demo.assets;
	}
});
