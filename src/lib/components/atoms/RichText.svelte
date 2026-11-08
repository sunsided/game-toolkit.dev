<!--
	Registry prose: plain text where `backticks` mark code. Split here rather than rendered as
	HTML, so the registry never needs escaping and can never inject markup.
-->
<script lang="ts">
	let { text }: { text: string } = $props();

	const parts = $derived(text.split('`'));
</script>

{#each parts as part, i (i)}{#if i % 2}<code>{part}</code>{:else}{part}{/if}{/each}
