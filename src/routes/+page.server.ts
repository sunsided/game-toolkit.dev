import { highlight } from '#lib/server/code.js';
import { allDemos, demoInfo } from '#lib/server/demos.js';
import { DEMOS, PROJECTS, demosOf, project } from '#lib/registry.js';
import type { PageServerLoad } from './$types';

const HERO = 'cookie-doh';

const GENERATE = `cargo generate --git https://github.com/sunsided/game-toolkit templates/jam --name my-jam
cd my-jam && cargo run`;

export const load: PageServerLoad = async () => {
	const core = project('game-toolkit');
	const install = `[dependencies]\n${core.install}`;
	return {
		hero: demoInfo(DEMOS.find((d) => d.slug === HERO)!),
		// The hero's demo is not repeated: two players of one demo would both start.
		featured: allDemos((d) => !!d.featured && d.slug !== HERO),
		family: PROJECTS.filter((p) => p.role !== 'core').map((p) => ({
			slug: p.slug,
			demos: demosOf(p.slug).length
		})),
		code: {
			generate: { code: GENERATE, html: await highlight(GENERATE, 'sh') },
			install: { code: install, html: await highlight(install, 'toml') },
			main: { code: core.example!, html: await highlight(core.example!, 'rust') }
		}
	};
};
