<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { LINKS } from '#lib/site.js';
	import GithubMark from '../atoms/GithubMark.svelte';
	import Logo from '../atoms/Logo.svelte';

	const nav = [
		{ href: resolve('/play'), label: 'Demos', id: '/play' },
		{ href: `${resolve('/')}#family`, label: 'Add-ons', id: '' }
	];
</script>

<header class="site-header">
	<div class="inner">
		<a class="home" href={resolve('/')} aria-label="game-toolkit home">
			<Logo />
			<span class="wordmark">game-toolkit</span>
		</a>
		<nav aria-label="Site">
			{#each nav as item (item.label)}
				<a href={item.href} aria-current={item.id && page.route.id === item.id ? 'page' : undefined}
					>{item.label}</a
				>
			{/each}
			<a class="hide-s" href={LINKS.guide}>Guide</a>
			<a class="icon" href={LINKS.github} aria-label="game-toolkit on GitHub" title="GitHub"
				><GithubMark /></a
			>
		</nav>
	</div>
</header>

<style>
	.site-header {
		position: sticky;
		inset-block-start: 0;
		z-index: 10;
		border-block-end: 1px solid var(--color-line);
		background: color-mix(in oklab, var(--color-bg) 78%, transparent);
		backdrop-filter: blur(12px) saturate(1.4);
	}
	.inner {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-4);
		inline-size: min(var(--page-max), 100% - 2 * var(--gutter));
		margin-inline: auto;
		block-size: 3.75rem;
	}
	.home {
		display: inline-flex;
		align-items: center;
		gap: var(--space-3);
		text-decoration: none;
	}
	.wordmark {
		color: var(--color-text-strong);
		font-family: var(--font-mono);
		font-size: var(--step--1);
		font-weight: 700;
		letter-spacing: -0.01em;
	}
	nav {
		display: flex;
		align-items: center;
		gap: var(--space-1);
		font-size: var(--step--1);
	}
	nav a {
		padding: var(--space-2) var(--space-3);
		border-radius: var(--radius-s);
		color: var(--color-text-muted);
		text-decoration: none;
		transition:
			color var(--dur-fast) var(--ease-out),
			background-color var(--dur-fast) var(--ease-out);
	}
	nav a:hover,
	nav a[aria-current='page'] {
		background: var(--color-surface-raised);
		color: var(--color-text-strong);
	}
	.icon {
		display: grid;
		place-items: center;
	}
	@media (max-width: 26rem) {
		.hide-s {
			display: none;
		}
	}
</style>
