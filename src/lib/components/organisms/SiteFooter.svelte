<script lang="ts">
	import { resolve } from '$app/paths';
	import { PROJECTS } from '#lib/registry.js';
	import { LINKS } from '#lib/site.js';
	import Logo from '../atoms/Logo.svelte';
</script>

<footer class="site-footer">
	<div class="inner">
		<div class="about">
			<span class="brand"><Logo size="1.5rem" /> game-toolkit</span>
			<p>
				Rust crates for game jams, by <a href={LINKS.author}>Markus Mayer</a>. Games made with them
				are at <a href={LINKS.games}>games.markusmayer.dev</a>.
			</p>
		</div>
		<nav aria-label="Crates">
			<p class="heading">Crates</p>
			<ul>
				{#each PROJECTS as p (p.slug)}
					<li><a href={resolve('/[slug]', { slug: p.slug })}>{p.crate}</a></li>
				{/each}
			</ul>
		</nav>
		<nav aria-label="Legal">
			<p class="heading">Site</p>
			<ul>
				<li><a href={resolve('/play')}>All demos</a></li>
				<li><a href={LINKS.privacy}>Privacy</a></li>
				<li><a href={LINKS.imprint}>Imprint</a></li>
			</ul>
		</nav>
	</div>
</footer>

<style>
	.site-footer {
		margin-block-start: var(--space-9);
		border-block-start: 1px solid var(--color-line);
		background: var(--color-bg-deep);
		color: var(--color-text-muted);
		font-size: var(--step--1);
	}
	.inner {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
		gap: var(--space-6);
		inline-size: min(var(--page-max), 100% - 2 * var(--gutter));
		margin-inline: auto;
		padding-block: var(--space-7) var(--space-8);
	}
	.about {
		display: grid;
		gap: var(--space-3);
		align-content: start;
		grid-column: span 2;
		max-inline-size: 36ch;
	}
	@media (max-width: 40rem) {
		.about {
			grid-column: auto;
		}
	}
	.brand {
		display: inline-flex;
		align-items: center;
		gap: var(--space-3);
		color: var(--color-text-strong);
		font-family: var(--font-mono);
		font-weight: 700;
	}
	.heading {
		margin-block-end: var(--space-3);
		color: var(--color-text-faint);
		font-family: var(--font-mono);
		font-size: var(--step--2);
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
	}
	ul {
		display: grid;
		gap: var(--space-2);
		margin: 0;
		padding: 0;
		list-style: none;
	}
	nav a {
		text-decoration: none;
	}
	nav a:hover {
		color: var(--color-text-strong);
	}
</style>
