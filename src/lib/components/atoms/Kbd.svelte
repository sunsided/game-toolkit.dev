<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<kbd>{@render children()}</kbd>

<style>
	kbd {
		display: inline-block;
		min-inline-size: 1.6em;
		padding: 0.05em 0.45em;
		border: 1px solid var(--color-line-strong);
		border-block-end-width: 2px;
		border-radius: var(--radius-s);
		background: var(--color-surface-raised);
		color: var(--color-text-strong);
		font-size: var(--step--2);
		text-align: center;
	}
</style>
