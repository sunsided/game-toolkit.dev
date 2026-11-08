import { PROJECTS } from '#lib/registry.js';
import { ORIGIN } from '#lib/site.js';

export const prerender = true;

export function GET() {
	const pages = ['', 'play/', ...PROJECTS.map((p) => `${p.slug}/`)];
	const urls = pages.map((path) => `\t<url><loc>${ORIGIN}/${path}</loc></url>`).join('\n');
	return new Response(
		`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
		{ headers: { 'Content-Type': 'application/xml' } }
	);
}
