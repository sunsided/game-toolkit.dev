<!-- Registry prose with `code` and [links](https://…); see #lib/richtext.ts. -->
<script lang="ts">
	import { parse } from '#lib/richtext.js';

	let { text }: { text: string } = $props();

	const parts = $derived(parse(text));
</script>

{#each parts as part, i (i)}{#if part.kind === 'code'}<code>{part.value}</code
		>{:else if part.kind === 'link'}<a href={part.href}>{part.value}</a
		>{:else}{part.value}{/if}{/each}
