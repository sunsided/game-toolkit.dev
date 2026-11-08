<script lang="ts">
	import type { Project } from '#lib/registry.js';
	import Feature from '../molecules/Feature.svelte';

	let { items }: { items: Project['highlights'] } = $props();
</script>

<div class="grid">
	{#each items as item (item.title)}
		<Feature title={item.title} text={item.text} />
	{/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));
		gap: var(--space-6) var(--space-6);
	}
</style>
