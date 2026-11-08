// What the prerender knows about a built demo: whether it is there at all (a dev checkout
// without `task demos` has none), and the size of its wasm, shown on the Run button.

import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { DEMOS, buildable, demoFiles, type Demo, type DemoInfo } from '#lib/registry.js';

const STATIC = join(process.cwd(), 'static', 'demos');

export function demoInfo(d: Demo): DemoInfo {
	const wasm = join(STATIC, d.slug, demoFiles(d).wasm);
	const built = existsSync(wasm);
	// The production build ships every demo; a missing one there is a broken page.
	if (!built && buildable(d) && process.env.REQUIRE_DEMOS)
		throw new Error(`demo ${d.slug} is not built (static/demos/${d.slug}/); run task demos`);
	return { ...d, built, bytes: built ? statSync(wasm).size : undefined };
}

export function allDemos(filter: (d: Demo) => boolean = () => true): DemoInfo[] {
	return DEMOS.filter((d) => buildable(d) && filter(d)).map(demoInfo);
}
