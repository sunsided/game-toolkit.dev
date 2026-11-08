import { strict as assert } from 'node:assert';
import { test } from 'node:test';
import { parse } from '../src/lib/richtext.ts';

test('code, https links and text in order', () => {
	assert.deepEqual(parse('a `b` [c](https://x.dev/c) d'), [
		{ kind: 'text', value: 'a ' },
		{ kind: 'code', value: 'b' },
		{ kind: 'text', value: ' ' },
		{ kind: 'link', value: 'c', href: 'https://x.dev/c' },
		{ kind: 'text', value: ' d' }
	]);
});

test('only https becomes a link', () => {
	for (const text of ['[x](javascript:alert(1))', '[x](http://x.dev)', '[x](/local)'])
		assert.deepEqual(parse(text), [{ kind: 'text', value: text }], text);
});
