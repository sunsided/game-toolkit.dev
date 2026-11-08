<script lang="ts">
	import { project, type DemoInfo } from '#lib/registry.js';
	import DemoPlayer from './DemoPlayer.svelte';

	let {
		demos,
		showProject = false,
		headingLevel = 3,
		aspect,
		showSource = false
	}: {
		demos: DemoInfo[];
		showProject?: boolean;
		headingLevel?: 2 | 3;
		aspect?: [number, number];
		showSource?: boolean;
	} = $props();

	// A grid's frames are all one shape: the demos' own if they agree, else 16:10 (the
	// widest common screen here); each demo fits itself into it.
	const shape = $derived.by((): [number, number] => {
		if (aspect) return aspect;
		const ratios = new Set(demos.map((d) => d.size[0] / d.size[1]));
		return ratios.size === 1 ? demos[0].size : [16, 10];
	});
</script>

<div class="grid">
	{#each demos as demo (demo.slug)}
		<DemoPlayer
			{demo}
			project={project(demo.project)}
			{showProject}
			{headingLevel}
			aspect={shape}
			{showSource}
		/>
	{/each}
</div>

<style>
	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 26rem), 1fr));
		gap: var(--space-8) var(--space-6);
	}
</style>
