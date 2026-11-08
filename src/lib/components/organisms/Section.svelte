<!-- A page section: eyebrow, heading, optional intro, then its content. -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import Label from '../atoms/Label.svelte';

	let {
		id,
		label,
		title,
		intro,
		children
	}: { id: string; label: string; title: string; intro?: Snippet; children: Snippet } = $props();
</script>

<section class="section" aria-labelledby="{id}-title" {id}>
	<header>
		<Label>{label}</Label>
		<h2 id="{id}-title">{title}</h2>
		{#if intro}<div class="intro">{@render intro()}</div>{/if}
	</header>
	{@render children()}
</section>

<style>
	.section {
		display: grid;
		gap: var(--space-6);
		padding-block-start: var(--space-9);
		scroll-margin-block-start: 4rem;
	}
	header {
		display: grid;
		gap: var(--space-3);
	}
	h2 {
		font-size: var(--step-4);
		max-inline-size: 22ch;
	}
	.intro {
		max-inline-size: var(--measure);
		color: var(--color-text-muted);
		font-size: var(--step-1);
		line-height: var(--leading-snug);
	}
</style>
