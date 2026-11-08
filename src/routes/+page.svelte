<script lang="ts">
	import { resolve } from '$app/paths';
	import Badge from '#lib/components/atoms/Badge.svelte';
	import Button from '#lib/components/atoms/Button.svelte';
	import Label from '#lib/components/atoms/Label.svelte';
	import CodeBlock from '#lib/components/molecules/CodeBlock.svelte';
	import ProjectCard from '#lib/components/molecules/ProjectCard.svelte';
	import ProjectLinks from '#lib/components/molecules/ProjectLinks.svelte';
	import DemoGrid from '#lib/components/organisms/DemoGrid.svelte';
	import DemoPlayer from '#lib/components/organisms/DemoPlayer.svelte';
	import FeatureGrid from '#lib/components/organisms/FeatureGrid.svelte';
	import Mentions from '#lib/components/organisms/Mentions.svelte';
	import Section from '#lib/components/organisms/Section.svelte';
	import RichText from '#lib/components/atoms/RichText.svelte';
	import { project } from '#lib/registry.js';
	import { LINKS, ORIGIN } from '#lib/site.js';

	let { data } = $props();

	const core = project('game-toolkit');
	const title = 'game-toolkit · Rust crates for game jams';
	const description = `${core.tagline} Native and in the browser, with add-ons for platforming, DOS-era video and sound.`;
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={`${ORIGIN}/`} />
	<link rel="canonical" href={`${ORIGIN}/`} />
</svelte:head>

<section class="hero" aria-labelledby="hero-title">
	<div class="pitch">
		<Label>Rust · wgpu · native and web</Label>
		<h1 id="hero-title">Ship the jam, <span class="not">not the engine.</span></h1>
		<p class="lede"><RichText text={core.summary} /></p>
		<div class="ctas">
			<Button variant="primary" href="#start">Start a jam</Button>
			<Button href={resolve('/play')}>Play the demos</Button>
		</div>
		<p class="facts">
			<Badge tone="accent">{core.pin?.tag}</Badge>
			<Badge>{core.license}</Badge>
			<Badge>unsafe forbidden</Badge>
		</p>
	</div>
	<div class="stage">
		<DemoPlayer demo={data.hero} project={project(data.hero.project)} showProject />
	</div>
</section>

<Section id="start" label="01 · Start" title="From nothing to a window in one command.">
	{#snippet intro()}
		<p>
			Generate a jam from a template with <code>cargo-generate</code>: a minimal game, an asset
			folder, a web build, and a guide to the whole API for you and your coding agent. Or add the
			crate to what you have.
		</p>
	{/snippet}
	<div class="start">
		<div class="steps">
			<CodeBlock title="terminal" {...data.code.generate} />
			<CodeBlock title="Cargo.toml" {...data.code.install} />
			<p class="note">
				The <a href={LINKS.guide}>guide</a> covers the loop, drawing, input, audio, assets and the web
				build on one page.
			</p>
			<ProjectLinks project={core} size="s" />
		</div>
		<CodeBlock title="src/main.rs" {...data.code.main} />
	</div>
</Section>

<Section id="inside" label="02 · Inside" title="Everything a jam needs, nothing it does not.">
	<FeatureGrid items={core.highlights} />
</Section>

<Section id="family" label="03 · Add-ons" title="Built on the toolkit.">
	{#snippet intro()}
		<p>
			Separate crates for the parts of a game that deserve their own: a character that feels right,
			and the PC hardware of 1981 to 1994, down to the electron beam.
		</p>
	{/snippet}
	<div class="family">
		{#each data.family as f (f.slug)}
			<ProjectCard project={project(f.slug)} demos={f.demos} />
		{/each}
	</div>
</Section>

<Section id="play" label="04 · Play" title="Running in your browser, from the same code.">
	{#snippet intro()}
		<p>
			Every demo is a crate example built for <code>wasm32</code> at a pinned release. Nothing loads until
			you press Run.
		</p>
	{/snippet}
	<DemoGrid demos={data.featured} showProject />
	<p><Button href={resolve('/play')}>All demos →</Button></p>
</Section>

<Section id="mentions" label="05 · Also" title="Honorable mentions.">
	{#snippet intro()}
		<p>Not part of the toolkit, from the same workshop, and useful in a game.</p>
	{/snippet}
	<Mentions />
</Section>

<style>
	.hero {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-7);
		align-items: center;
		padding-block: clamp(2.5rem, 7vw, 5.5rem) 0;
	}
	@media (min-width: 62rem) {
		.hero {
			grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
		}
	}
	.pitch {
		display: grid;
		gap: var(--space-5);
		justify-items: start;
	}
	h1 {
		font-size: var(--step-5);
		font-weight: 760;
		letter-spacing: -0.04em;
	}
	.not {
		color: var(--color-text-faint);
	}
	.lede {
		max-inline-size: 56ch;
		color: var(--color-text-muted);
		font-size: var(--step-1);
		line-height: var(--leading-snug);
	}
	.ctas,
	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-3);
	}
	.facts {
		gap: var(--space-2);
	}
	.start {
		display: grid;
		gap: var(--space-5);
		align-items: start;
	}
	@media (min-width: 60rem) {
		.start {
			grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
		}
	}
	.steps {
		display: grid;
		gap: var(--space-4);
	}
	.note {
		color: var(--color-text-muted);
		font-size: var(--step--1);
	}
	.family {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 16rem), 1fr));
		gap: var(--space-4);
	}
</style>
