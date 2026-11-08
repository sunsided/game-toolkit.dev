<!--
	A demo, playable in place. At rest it is a poster (or the title on a pixel field) with a
	Run button that says how much it downloads; nothing loads before the click. Running, it is
	an iframe on the demo's own page (static/demos/<slug>/, built by scripts/demos.ts): a
	separate document, so a demo's globals, panics and GPU context stay its own, and Stop
	removes all of it. The page posts `running` or `error` back; see scripts/demos.ts.
-->
<script lang="ts">
	import { generated } from '#lib/static.js';
	import { size } from '#lib/format.js';
	import { player } from '#lib/player.svelte.js';
	import { demoPath, posterPath, source, type DemoInfo, type Project } from '#lib/registry.js';
	import Badge from '../atoms/Badge.svelte';
	import Button from '../atoms/Button.svelte';
	import GithubMark from '../atoms/GithubMark.svelte';
	import Kbd from '../atoms/Kbd.svelte';
	import RichText from '../atoms/RichText.svelte';

	let {
		demo,
		project,
		headingLevel = 3,
		showProject = false,
		aspect = demo.size,
		showSource = false
	}: {
		demo: DemoInfo;
		project: Project;
		headingLevel?: 2 | 3;
		showProject?: boolean;
		/** The screen's shape; the demo's own unless a grid wants them all alike. */
		aspect?: [number, number];
		/** Link the repository the demo is built from. */
		showSource?: boolean;
	} = $props();

	let phase = $state<'loading' | 'running' | 'error'>('loading');
	let message = $state('');
	let frame = $state<HTMLIFrameElement>();
	let screen = $state<HTMLDivElement>();
	let width = $state(0);
	let height = $state(0);

	// A whole-number scaler (`native`) gets an iframe of the next whole multiple of its screen
	// that covers the frame, scaled down to fit: k = ceil(fit), drawn at fit / k.
	const fit = $derived.by(() => {
		if (!demo.native || !width || !height) return undefined;
		const [nw, nh] = demo.native;
		const s = Math.min(width / nw, height / nh);
		const k = Math.max(1, Math.ceil(s));
		return {
			w: nw * k,
			h: nh * k,
			scale: s / k,
			x: (width - nw * s) / 2,
			y: (height - nh * s) / 2
		};
	});

	const active = $derived(player.active === demo.slug);
	// The file, not the folder: the dev server serves no index for folders in static/.
	const src = $derived(generated(`${demoPath(demo)}index.html`));
	const poster = $derived(demo.poster ? generated(posterPath(demo)!) : undefined);

	function run() {
		phase = 'loading';
		message = '';
		player.active = demo.slug;
	}

	function stop() {
		if (document.fullscreenElement) document.exitFullscreen();
		player.active = null;
	}

	function fullscreen() {
		screen?.requestFullscreen?.().then(() => frame?.focus());
	}

	$effect(() => {
		if (!active) return;
		const onMessage = (e: MessageEvent) => {
			// Only this demo's own frame speaks for it.
			if (e.source !== frame?.contentWindow || e.data?.demo !== demo.slug) return;
			if (e.data.state === 'running') phase = 'running';
			if (e.data.state === 'error') {
				phase = 'error';
				message = String(e.data.message ?? 'The demo stopped.');
			}
		};
		window.addEventListener('message', onMessage);
		return () => window.removeEventListener('message', onMessage);
	});
</script>

<article class="player" style:--accent={project.accent}>
	<div
		class="screen"
		bind:this={screen}
		bind:clientWidth={width}
		bind:clientHeight={height}
		style:aspect-ratio="{aspect[0]} / {aspect[1]}"
	>
		{#if active}
			<iframe
				bind:this={frame}
				{src}
				title="{demo.title}, running"
				class:native={fit}
				style:width={fit && `${fit.w}px`}
				style:height={fit && `${fit.h}px`}
				style:transform={fit && `translate(${fit.x}px, ${fit.y}px) scale(${fit.scale})`}
				allow="fullscreen; gamepad; autoplay"
				onload={() => frame?.focus()}
			></iframe>
			{#if phase === 'loading'}
				<div class="status" aria-live="polite"><span class="spinner"></span> Starting…</div>
			{/if}
		{:else}
			{#if poster}
				<img class="poster" src={poster} alt={demo.poster?.alt} loading="lazy" decoding="async" />
			{:else}
				<div class="titlecard" aria-hidden="true">
					<span>{demo.title}</span>
				</div>
			{/if}
			<div class="launch">
				{#if demo.built}
					<Button variant="primary" onclick={run} aria-label="Run {demo.title}">
						<span class="play" aria-hidden="true"></span> Run demo
						{#if demo.bytes}<span class="bytes">{size(demo.bytes)}</span>{/if}
					</Button>
				{:else}
					<p class="unbuilt">Not built in this checkout · <code>task demos</code></p>
				{/if}
			</div>
		{/if}
	</div>

	<div class="meta">
		<div class="text">
			<svelte:element this={`h${headingLevel}`} class="title">
				{demo.title}
				{#if showProject}<Badge tone="accent">{project.name}</Badge>{/if}
			</svelte:element>
			<p class="blurb"><RichText text={demo.blurb} /></p>
			{#if phase === 'error' && active}
				<p class="error" role="alert">{message}</p>
			{/if}
			{#if showSource && source(demo)}
				{@const src = source(demo)!}
				<a class="source" href={src.url}><GithubMark size="0.9rem" /> {src.repo} @ {src.tag}</a>
			{/if}
			{#if demo.controls?.length}
				<ul class="controls" aria-label="Controls">
					{#each demo.controls as [keys, action] (keys)}
						<li><Kbd>{keys}</Kbd> {action}</li>
					{/each}
				</ul>
			{/if}
		</div>
		{#if active}
			<div class="actions">
				<Button size="s" onclick={fullscreen}>Fullscreen</Button>
				<Button size="s" onclick={stop}>Stop</Button>
			</div>
		{/if}
	</div>
</article>

<style>
	.player {
		display: grid;
		gap: var(--space-4);
		align-content: start;
		min-inline-size: 0;
	}
	.screen {
		position: relative;
		display: grid;
		border-radius: var(--radius-l);
		background: var(--color-bg-deep);
		box-shadow: var(--shadow-screen);
		overflow: hidden;
		isolation: isolate;
	}
	.screen:fullscreen {
		border-radius: 0;
	}
	.screen > :global(*) {
		grid-area: 1 / 1;
	}
	iframe {
		inline-size: 100%;
		block-size: 100%;
		border: 0;
		background: var(--color-bg-deep);
	}
	iframe.native {
		position: absolute;
		inset: 0 auto auto 0;
		transform-origin: 0 0;
	}
	.poster {
		inline-size: 100%;
		block-size: 100%;
		object-fit: cover;
		image-rendering: pixelated;
		transition:
			scale 600ms var(--ease-out),
			filter var(--dur-mid) var(--ease-out);
	}
	.player:hover .poster {
		scale: 1.025;
	}
	/* No screenshot: the title on a field of pixels in the accent, like a boot screen. */
	.titlecard {
		display: grid;
		place-items: center;
		padding: var(--space-5);
		background:
			radial-gradient(70% 70% at 50% 45%, var(--accent-wash), transparent 75%),
			conic-gradient(from 90deg at 2px 2px, transparent 25%, rgb(255 255 255 / 0.05) 0) 0 0 / 12px
				12px,
			var(--color-bg-deep);
	}
	.titlecard span {
		color: var(--accent);
		font-family: var(--font-mono);
		font-size: var(--step-2);
		font-weight: 700;
		letter-spacing: 0.04em;
		text-align: center;
		text-transform: uppercase;
		text-shadow: 0 0 1.25rem var(--accent-glow);
	}
	.launch {
		display: grid;
		place-items: end start;
		padding: var(--space-4);
		background: linear-gradient(180deg, transparent 55%, rgb(0 0 0 / 0.55));
		z-index: 1;
	}
	.play {
		inline-size: 0;
		block-size: 0;
		border-block: 0.4em solid transparent;
		border-inline-start: 0.65em solid currentColor;
	}
	.bytes {
		padding-inline-start: var(--space-2);
		border-inline-start: 1px solid rgb(0 0 0 / 0.25);
		font-family: var(--font-mono);
		font-size: var(--step--2);
		font-weight: 500;
		opacity: 0.75;
	}
	.unbuilt {
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-s);
		background: rgb(0 0 0 / 0.6);
		color: var(--color-text-muted);
		font-size: var(--step--1);
	}
	.status {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-3);
		color: var(--color-text-muted);
		font-family: var(--font-mono);
		font-size: var(--step--1);
		pointer-events: none;
	}
	.spinner {
		inline-size: 1rem;
		block-size: 1rem;
		border: 2px solid var(--color-line-strong);
		border-block-start-color: var(--accent);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}
	@keyframes spin {
		to {
			rotate: 360deg;
		}
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: start;
		justify-content: space-between;
		gap: var(--space-3) var(--space-5);
	}
	.text {
		display: grid;
		gap: var(--space-2);
		flex: 1 1 18rem;
	}
	.title {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-3);
		font-size: var(--step-1);
		letter-spacing: -0.015em;
	}
	.blurb {
		max-inline-size: var(--measure);
		color: var(--color-text-muted);
		font-size: var(--step--1);
	}
	.error {
		color: var(--color-danger);
		font-size: var(--step--1);
	}
	.source {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		justify-self: start;
		color: var(--color-text-muted);
		font-family: var(--font-mono);
		font-size: var(--step--2);
		text-decoration: none;
	}
	.source:hover {
		color: var(--color-text-strong);
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-4);
		margin: 0;
		padding: 0;
		list-style: none;
		color: var(--color-text-faint);
		font-size: var(--step--2);
	}
	.actions {
		display: flex;
		gap: var(--space-2);
	}
</style>
