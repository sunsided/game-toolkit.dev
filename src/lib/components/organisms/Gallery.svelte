<script lang="ts">
	import { generated } from '#lib/static.js';
	import { mediaPath, type Project } from '#lib/registry.js';
	import Figure from '../molecules/Figure.svelte';

	let { project }: { project: Project } = $props();
</script>

<div class="gallery">
	{#each project.gallery ?? [] as m (m.path)}
		<Figure src={generated(mediaPath(project.slug, m.path))} alt={m.alt} caption={m.caption} />
	{/each}
</div>

<style>
	.gallery {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
		gap: var(--space-6);
	}
</style>
