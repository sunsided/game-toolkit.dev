<!-- The mono eyebrow above a heading: "01 · Quick start". -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<p class="label">{@render children()}</p>

<style>
	.label {
		color: var(--accent);
		font-family: var(--font-mono);
		font-size: var(--step--2);
		font-weight: 500;
		letter-spacing: var(--tracking-label);
		text-transform: uppercase;
	}
</style>
