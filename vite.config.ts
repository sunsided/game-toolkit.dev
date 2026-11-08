import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			// Static files in a bucket: every route prerendered, and a route that fails to
			// prerender fails the build instead of shipping a 404.
			adapter: adapter({ fallback: '404.html', strict: true }),
			paths: { relative: true },
			prerender: {
				handleHttpError: 'fail',
				handleMissingId: 'fail',
				handleEntryGeneratorMismatch: 'fail'
			}
		})
	]
});
