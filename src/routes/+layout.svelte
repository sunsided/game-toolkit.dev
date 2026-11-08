<script lang="ts">
	import '@fontsource-variable/bricolage-grotesque/standard.css';
	import '@fontsource-variable/jetbrains-mono';
	import '#lib/design/tokens.css';
	import '#lib/design/base.css';
	import SiteFooter from '#lib/components/organisms/SiteFooter.svelte';
	import SiteHeader from '#lib/components/organisms/SiteHeader.svelte';
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<a class="skip" href="#main">Skip to content</a>
<SiteHeader />
<main id="main">
	{@render children()}
</main>
<SiteFooter />

<style>
	main {
		inline-size: min(var(--page-max), 100% - 2 * var(--gutter));
		margin-inline: auto;
	}
	.skip {
		position: absolute;
		inset-block-start: var(--space-2);
		inset-inline-start: var(--space-2);
		z-index: 20;
		padding: var(--space-2) var(--space-4);
		border-radius: var(--radius-s);
		background: var(--color-accent);
		color: var(--color-accent-ink);
		translate: 0 -200%;
	}
	.skip:focus {
		translate: 0;
	}
</style>
