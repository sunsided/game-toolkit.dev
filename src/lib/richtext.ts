// Registry prose: plain text where `backticks` mark code and [text](https://…) a link. Parsed
// into parts rather than rendered as HTML, so the registry never needs escaping and can never
// inject markup; only https links are recognised, anything else stays text.

export type Part =
	{ kind: 'text' | 'code'; value: string } | { kind: 'link'; value: string; href: string };

const TOKEN = /`([^`]*)`|\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g;

export function parse(text: string): Part[] {
	const out: Part[] = [];
	let at = 0;
	for (const m of text.matchAll(TOKEN)) {
		if (m.index > at) out.push({ kind: 'text', value: text.slice(at, m.index) });
		if (m[1] !== undefined) out.push({ kind: 'code', value: m[1] });
		else out.push({ kind: 'link', value: m[2], href: m[3] });
		at = m.index + m[0].length;
	}
	if (at < text.length) out.push({ kind: 'text', value: text.slice(at) });
	return out;
}
