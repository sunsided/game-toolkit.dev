<script lang="ts">
	import { resolve } from '$app/paths';
	import Badge from '#lib/components/atoms/Badge.svelte';
	import GithubMark from '#lib/components/atoms/GithubMark.svelte';
	import Label from '#lib/components/atoms/Label.svelte';
	import RichText from '#lib/components/atoms/RichText.svelte';
	import CodeBlock from '#lib/components/molecules/CodeBlock.svelte';
	import DemoPlayer from '#lib/components/organisms/DemoPlayer.svelte';
	import Section from '#lib/components/organisms/Section.svelte';
	import { project, source } from '#lib/registry.js';
	import { LINKS, ORIGIN } from '#lib/site.js';

	let { data } = $props();

	const d = $derived(data.demo);
	const p = $derived(project(d.project));
	const src = $derived(source(d)!);
	const lines = $derived(data.files.reduce((n, f) => n + f.lines, 0));
	const title = $derived(`${d.title} · how it’s made · ${p.name}`);
	const url = $derived(`${ORIGIN}/play/${d.slug}/`);
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={d.blurb} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={d.blurb} />
	<meta property="og:url" content={url} />
	<link rel="canonical" href={url} />
</svelte:head>

<div class="page" style:--accent={p.accent}>
	<header class="head">
		<nav class="crumbs" aria-label="Breadcrumb">
			<a href={resolve('/play')}>Demos</a>
			<span aria-hidden="true">/</span>
			<a href={resolve('/[slug]', { slug: p.slug })}>{p.name}</a>
		</nav>
		<Label>How it’s made</Label>
		<h1>{d.title}</h1>
		<p class="facts">
			<Badge tone="accent">{p.crate} {src.tag}</Badge>
			<Badge>{lines} lines, comments included</Badge>
		</p>
	</header>

	<DemoPlayer demo={d} project={p} headingLevel={2} linkGuide={false} showSource />

	<Section id="run" label="01 · Run it" title="On your machine, in two commands.">
		{#snippet intro()}
			<p>
				Rust and a checkout are all it takes; the first build downloads and compiles the
				dependencies. For the browser, the toolkit’s <a href={LINKS.web}>web build</a> does the same
				with <code>trunk</code>.
			</p>
		{/snippet}
		<div class="steps">
			<CodeBlock title="get the code" {...data.steps.clone} />
			<CodeBlock title="run it" {...data.steps.run} />
		</div>
	</Section>

	<Section id="code" label="02 · Read it" title="The whole program.">
		{#snippet intro()}
			{#if d.codeNote}
				<p><RichText text={d.codeNote} /></p>
			{:else}
				<p>
					Nothing left out: this is the file the demo above was built from, at {src.tag}. The
					comments explain the rest.
				</p>
			{/if}
		{/snippet}
		{#each data.files as f (f.path)}
			<div class="file">
				<CodeBlock
					title="{f.path} · {f.lines} lines"
					code={f.code}
					html={f.html}
					maxHeight="75vh"
				/>
				<a class="gh" href={f.url}><GithubMark size="0.9rem" /> {f.path} on GitHub</a>
			</div>
		{/each}
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
	}
	.facts {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
	.steps {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 24rem), 1fr));
		gap: var(--space-4);
	}
	.file {
		display: grid;
		gap: var(--space-3);
	}
	.gh {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		justify-self: start;
		color: var(--color-text-muted);
		font-family: var(--font-mono);
		font-size: var(--step--2);
		text-decoration: none;
	}
	.gh:hover {
		color: var(--color-text-strong);
	}
</style>
