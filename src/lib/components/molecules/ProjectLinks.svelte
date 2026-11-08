<!-- GitHub, crates.io and docs.rs for a crate, as far as it has them. -->
<script lang="ts">
	import { links, type Project } from '#lib/registry.js';
	import Button from '../atoms/Button.svelte';
	import GithubMark from '../atoms/GithubMark.svelte';

	let { project, size = 'm' }: { project: Project; size?: 'm' | 's' } = $props();

	const to = $derived(links(project));
</script>

{#if to.github || to.crates || to.docs}
	<div class="links">
		{#if to.github}
			<Button href={to.github} {size}><GithubMark size="1rem" /> GitHub</Button>
		{/if}
		{#if to.docs}<Button href={to.docs} {size}>docs.rs</Button>{/if}
		{#if to.crates}<Button href={to.crates} {size}>crates.io</Button>{/if}
	</div>
{/if}

<style>
	.links {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
	}
</style>
