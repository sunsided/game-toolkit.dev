<!-- Related crates outside the toolkit: a line each, with where to find them. -->
<script lang="ts">
	import { MENTIONS } from '#lib/registry.js';
	import GithubMark from '../atoms/GithubMark.svelte';
	import RichText from '../atoms/RichText.svelte';
</script>

<ul class="mentions">
	{#each MENTIONS as m (m.crate)}
		<li>
			<h3>{m.crate}</h3>
			<p><RichText text={m.tagline} /></p>
			<p class="links">
				<a href="https://github.com/{m.repo}"><GithubMark size="0.9rem" /> GitHub</a>
				<a href="https://crates.io/crates/{m.crate}">crates.io</a>
				{#if m.try}<a href={m.try}>Try it in the browser →</a>{/if}
			</p>
		</li>
	{/each}
</ul>

<style>
	.mentions {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
		gap: var(--space-6);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	li {
		display: grid;
		gap: var(--space-2);
		align-content: start;
		padding-block-start: var(--space-4);
		border-block-start: 1px solid var(--color-line);
	}
	h3 {
		font-family: var(--font-mono);
		font-size: var(--step-1);
		letter-spacing: -0.02em;
	}
	p {
		color: var(--color-text-muted);
		font-size: var(--step--1);
	}
	.links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2) var(--space-4);
		font-family: var(--font-mono);
		font-size: var(--step--2);
	}
	.links a {
		display: inline-flex;
		align-items: center;
		gap: var(--space-2);
		text-decoration: none;
	}
	.links a:hover {
		color: var(--color-text-strong);
	}
</style>
