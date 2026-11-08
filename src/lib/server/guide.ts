// A demo's guide: its source files as built, read from the pinned checkout that
// scripts/demos.ts made (`task sources` runs before every dev server and build).

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { checkoutName, project, type Demo, type Pin, type Project } from '#lib/registry.js';
import { highlight } from './code.js';

export interface GuideFile {
	path: string;
	lines: number;
	code: string;
	html: string;
	/** The file on GitHub at the pinned tag. */
	url: string;
}

export async function guideFiles(d: Demo): Promise<GuideFile[]> {
	const p = project(d.project) as Project & { pin: Pin };
	const root = join(process.cwd(), '.cache', 'src', checkoutName(p));
	return Promise.all(
		(d.code ?? []).map(async (path) => {
			const code = readFileSync(join(root, path), 'utf8').trimEnd();
			return {
				path,
				lines: code.split('\n').length,
				code,
				html: await highlight(code, path.endsWith('.wgsl') ? 'wgsl' : 'rust'),
				url: `https://github.com/${p.repo}/blob/${p.pin.tag}/${path}`
			};
		})
	);
}
