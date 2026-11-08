import { allDemos } from '#lib/server/demos.js';
import { PROJECTS } from '#lib/registry.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	groups: PROJECTS.map((p) => ({
		slug: p.slug,
		demos: allDemos((d) => d.project === p.slug)
	})).filter((g) => g.demos.length)
});
