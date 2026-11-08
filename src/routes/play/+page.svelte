<script lang="ts">
	import { resolve } from '$app/paths';
	import Label from '#lib/components/atoms/Label.svelte';
	import DemoGrid from '#lib/components/organisms/DemoGrid.svelte';
	import { project } from '#lib/registry.js';
	import { ORIGIN } from '#lib/site.js';

	let { data } = $props();

	const title = 'Demos · game-toolkit';
	const description =
		'game-toolkit, dosvideo and the platformer, running in the browser: crate examples built for wasm32 at their pinned releases.';
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={`${ORIGIN}/play/`} />
	<link rel="canonical" href={`${ORIGIN}/play/`} />
</svelte:head>

<header class="head">
	<Label>Play</Label>
	<h1>Every demo, in the browser.</h1>
	<p>
		Crate examples built for <code>wasm32</code> from the same code that runs natively. WebGPU where your
		browser has it, WebGL2 where it does not. One runs at a time; click into it for the keyboard.
	</p>
</header>

{#each data.groups as g (g.slug)}
	{@const p = project(g.slug)}
	<section class="group" style:--accent={p.accent} aria-labelledby="{g.slug}-demos">
		<header>
			<h2 id="{g.slug}-demos"><a href={resolve('/[slug]', { slug: p.slug })}>{p.crate}</a></h2>
			<p>{p.tagline}</p>
		</header>
		<!-- One shape for all, so the page reads as a grid; each demo fits itself into it. -->
		<DemoGrid demos={g.demos} aspect={[4, 3]} showSource />
	</section>
{/each}

<style>
	.head {
		display: grid;
		gap: var(--space-4);
		padding-block: clamp(2rem, 6vw, 4.5rem) var(--space-4);
	}
	h1 {
		font-size: var(--step-5);
		letter-spacing: -0.04em;
	}
	.head p {
		max-inline-size: var(--measure);
		color: var(--color-text-muted);
		font-size: var(--step-1);
		line-height: var(--leading-snug);
	}
	.group {
		display: grid;
		gap: var(--space-6);
		padding-block-start: var(--space-8);
	}
	.group header {
		display: grid;
		gap: var(--space-2);
		padding-block-start: var(--space-4);
		border-block-start: 1px solid var(--color-line);
	}
	h2 {
		font-family: var(--font-mono);
		font-size: var(--step-2);
		letter-spacing: -0.02em;
	}
	h2 a {
		text-decoration-color: var(--accent);
	}
	.group header p {
		color: var(--color-text-muted);
	}
</style>
