import { error } from '@sveltejs/kit';
import { highlight } from '#lib/server/code.js';
import { allDemos } from '#lib/server/demos.js';
import { PROJECTS } from '#lib/registry.js';
import type { EntryGenerator, PageServerLoad } from './$types';

export const entries: EntryGenerator = () => PROJECTS.map(({ slug }) => ({ slug }));

export const load: PageServerLoad = async ({ params }) => {
	const p = PROJECTS.find((p) => p.slug === params.slug);
	if (!p) error(404, 'No such crate');
	const install = `[dependencies]\n${p.install}`;
	return {
		slug: p.slug,
		demos: allDemos((d) => d.project === p.slug),
		code: {
			install: { code: install, html: await highlight(install, 'toml') },
			example: p.example ? { code: p.example, html: await highlight(p.example, 'rust') } : null
		}
	};
};
