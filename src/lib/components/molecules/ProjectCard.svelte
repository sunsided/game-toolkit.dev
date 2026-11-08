<!--
	A crate on the home page: a module with a lit edge in its colour, its name in mono, its
	tagline, and what it is (version, or that it is still in the works).
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import type { Project } from '#lib/registry.js';
	import Badge from '../atoms/Badge.svelte';

	let { project, demos = 0 }: { project: Project; demos?: number } = $props();
</script>

<a class="card" href={resolve('/[slug]', { slug: project.slug })} style:--accent={project.accent}>
	<span class="edge" aria-hidden="true"></span>
	<span class="crate">{project.crate}</span>
	<span class="tagline">{project.tagline}</span>
	<span class="foot">
		{#if project.pin}
			<Badge tone="accent">{project.pin.tag}</Badge>
		{:else}
			<Badge>in development</Badge>
		{/if}
		{#if demos}<span>{demos} {demos === 1 ? 'demo' : 'demos'}</span>{/if}
		<span class="go" aria-hidden="true">→</span>
	</span>
</a>

<style>
	.card {
		position: relative;
		display: grid;
		grid-template-rows: auto 1fr auto;
		gap: var(--space-3);
		padding: var(--space-5) var(--space-5) var(--space-4);
		border: 1px solid var(--color-line);
		border-radius: var(--radius-l);
		background: linear-gradient(180deg, var(--color-surface-raised), var(--color-surface));
		box-shadow: var(--shadow-raised);
		text-decoration: none;
		overflow: hidden;
		transition:
			border-color var(--dur-mid) var(--ease-out),
			translate var(--dur-mid) var(--ease-out);
	}
	.card:hover,
	.card:focus-visible {
		border-color: color-mix(in oklab, var(--accent) 55%, transparent);
		translate: 0 -2px;
	}
	/* The lit edge, like a cartridge's label stripe. */
	.edge {
		position: absolute;
		inset: 0 0 auto;
		block-size: 3px;
		background: var(--accent);
		box-shadow: 0 0 1.25rem var(--accent);
	}
	.crate {
		color: var(--color-text-strong);
		font-family: var(--font-mono);
		font-size: var(--step--1);
		font-weight: 600;
		overflow-wrap: anywhere;
	}
	.tagline {
		color: var(--color-text);
		font-size: var(--step-1);
		font-weight: 600;
		font-stretch: var(--wdth-display);
		line-height: var(--leading-snug);
		letter-spacing: -0.015em;
	}
	.foot {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding-block-start: var(--space-3);
		border-block-start: 1px solid var(--color-line);
		color: var(--color-text-faint);
		font-family: var(--font-mono);
		font-size: var(--step--2);
	}
	.go {
		margin-inline-start: auto;
		color: var(--accent);
		transition: translate var(--dur-mid) var(--ease-out);
	}
	.card:hover .go {
		translate: 0.25rem 0;
	}
</style>
