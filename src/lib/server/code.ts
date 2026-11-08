// Syntax highlighting at prerender time. Only server loads import this, so Shiki never
// reaches the browser. Colours come from the --shiki-* tokens in tokens.css.

import { createCssVariablesTheme, createHighlighter } from 'shiki';

const theme = createCssVariablesTheme({ name: 'tokens', variablePrefix: '--shiki-' });
const highlighter = createHighlighter({ themes: [theme], langs: ['rust', 'toml', 'sh', 'wgsl'] });

export type Lang = 'rust' | 'toml' | 'sh' | 'wgsl';

/** `code` as highlighted HTML: a `<pre class="shiki">`, safe to `{@html}` (Shiki escapes). */
export async function highlight(code: string, lang: Lang): Promise<string> {
	return (await highlighter).codeToHtml(code, { lang, theme: 'tokens' });
}
