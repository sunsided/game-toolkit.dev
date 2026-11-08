<script lang="ts">
	import { resolve } from '$app/paths';
	import Badge from '#lib/components/atoms/Badge.svelte';
	import Label from '#lib/components/atoms/Label.svelte';
	import RichText from '#lib/components/atoms/RichText.svelte';
	import CodeBlock from '#lib/components/molecules/CodeBlock.svelte';
	import ProjectCard from '#lib/components/molecules/ProjectCard.svelte';
	import ProjectLinks from '#lib/components/molecules/ProjectLinks.svelte';
	import DemoGrid from '#lib/components/organisms/DemoGrid.svelte';
	import FeatureGrid from '#lib/components/organisms/FeatureGrid.svelte';
	import Gallery from '#lib/components/organisms/Gallery.svelte';
	import Section from '#lib/components/organisms/Section.svelte';
	import { PROJECTS, mediaPath, posterPath, project } from '#lib/registry.js';
	import { ORIGIN } from '#lib/site.js';

	let { data } = $props();

	const p = $derived(project(data.slug));
	const others = $derived(PROJECTS.filter((o) => o.slug !== p.slug));
	const url = $derived(`${ORIGIN}/${p.slug}/`);
	const title = $derived(`${p.crate} · game-toolkit`);
	const image = $derived(
		p.gallery?.[0] ? mediaPath(p.slug, p.gallery[0].path) : data.demos.map(posterPath).find(Boolean)
	);
	const STATUS = { released: 'released', preview: 'preview', 'in-development': 'in development' };
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={p.tagline} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={p.tagline} />
	<meta property="og:url" content={url} />
	{#if image}
		<meta property="og:image" content={`${ORIGIN}/${image}`} />
	{/if}
	<link rel="canonical" href={url} />
</svelte:head>

<div class="page" style:--accent={p.accent}>
	<header class="head">
		<nav class="crumbs" aria-label="Breadcrumb">
			<a href={resolve('/')}>game-toolkit</a>
			{#if p.role !== 'core'}<span aria-hidden="true">/</span> <span>{p.name}</span>{/if}
		</nav>
		<Label>{p.role === 'core' ? 'The toolkit' : 'Add-on'}</Label>
		<h1><span class="crate">{p.crate}</span></h1>
		<p class="tagline">{p.tagline}</p>
		<p class="facts">
			{#if p.pin}<Badge tone="accent">{p.pin.tag}</Badge>{/if}
			{#if p.status !== 'released'}<Badge>{STATUS[p.status]}</Badge>{/if}
			<Badge>{p.license}</Badge>
		</p>
		<ProjectLinks project={p} />
	</header>

	<div class="overview">
		<p class="summary"><RichText text={p.summary} /></p>
		<CodeBlock title="Cargo.toml" {...data.code.install} />
		{#if !p.published}
			<p class="note">Not on crates.io yet; the name above is what it will be published as.</p>
		{/if}
	</div>

	{#if data.demos.length}
		<Section id="demos" label="Play" title="Try it here.">
			{#snippet intro()}
				<p>
					Built for the browser from {p.pin?.tag}. Click into a running demo for keyboard input.
				</p>
			{/snippet}
			<DemoGrid demos={data.demos} />
		</Section>
	{/if}

	<Section id="features" label="Features" title="What it does.">
		<FeatureGrid items={p.highlights} />
	</Section>

	{#if data.code.example}
		<Section id="code" label="Code" title="What it looks like.">
			<CodeBlock
				title={p.role === 'core' || p.slug === 'dosvideo' ? 'src/main.rs' : 'example.rs'}
				{...data.code.example}
			/>
		</Section>
	{/if}

	{#if p.gallery?.length}
		<Section id="gallery" label="Gallery" title="Captured from the running demos.">
			<Gallery project={p} />
		</Section>
	{/if}

	<Section id="more" label="More" title="The rest of the family.">
		<div class="others">
			{#each others as o (o.slug)}
				<ProjectCard project={o} />
			{/each}
		</div>
	</Section>
</div>

<style>
	.head {
		display: grid;
		gap: var(--space-4);
		justify-items: start;
		padding-block: clamp(2rem, 6vw, 4.5rem) var(--space-6);
	}
	.crumbs {
		display: flex;
		gap: var(--space-2);
		color: var(--color-text-faint);
		font-family: var(--font-mono);
		font-size: var(--step--2);
	}
	.crumbs a {
		text-decoration: none;
	}
	.crumbs a:hover {
		color: var(--color-text-strong);
	}
	h1 {
		font-size: var(--step-5);
		letter-spacing: -0.04em;
		overflow-wrap: anywhere;
	}
	.crate {
		background: linear-gradient(90deg, var(--color-text-strong) 30%, var(--accent));
		background-clip: text;
		color: transparent;
	}
	.tagline {
		max-inline-size: 40ch;
		color: var(--color-text);
		font-size: var(--step-2);
		font-weight: 500;
		line-height: var(--leading-snug);
		letter-spacing: -0.01em;
	}
	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.overview {
		display: grid;
		gap: var(--space-5);
		align-items: start;
		padding-block-start: var(--space-6);
		border-block-start: 1px solid var(--color-line);
	}
	@media (min-width: 56rem) {
		.overview {
			grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
		}
	}
	.summary {
		color: var(--color-text-muted);
		font-size: var(--step-1);
		line-height: var(--leading-snug);
	}
	.note {
		grid-column: 1 / -1;
		color: var(--color-text-faint);
		font-size: var(--step--1);
	}
	.others {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
		gap: var(--space-4);
	}
</style>
