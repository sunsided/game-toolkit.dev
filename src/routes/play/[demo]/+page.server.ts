import { error } from '@sveltejs/kit';
import { highlight } from '#lib/server/code.js';
import { demoInfo } from '#lib/server/demos.js';
import { guideFiles } from '#lib/server/guide.js';
import { DEMOS, project, runCommand, source } from '#lib/registry.js';
import type { EntryGenerator, PageServerLoad } from './$types';

/** Guides exist for build demos with code; release demos are whole games. */
const guided = DEMOS.filter((d) => d.code?.length && project(d.project).pin);

export const entries: EntryGenerator = () => guided.map(({ slug }) => ({ demo: slug }));

export const load: PageServerLoad = async ({ params }) => {
	const d = guided.find((d) => d.slug === params.demo);
	if (!d) error(404, 'No such guide');
	const src = source(d)!;
	const name = src.repo.split('/')[1];
	const steps = {
		clone: `git clone --depth 1 --branch ${src.tag} https://github.com/${src.repo}\ncd ${name}`,
		run: runCommand(d)!
	};
	return {
		demo: demoInfo(d),
		files: await guideFiles(d),
		steps: {
			clone: { code: steps.clone, html: await highlight(steps.clone, 'sh') },
			run: { code: steps.run, html: await highlight(steps.run, 'sh') }
		}
	};
};
