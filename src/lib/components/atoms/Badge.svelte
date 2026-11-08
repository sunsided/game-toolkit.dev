<!-- A small mono label in a pill: versions, statuses, licences. `accent` tints it. -->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { tone = 'neutral', children }: { tone?: 'neutral' | 'accent'; children: Snippet } = $props();
</script>

<span class="badge {tone}">{@render children()}</span>

<style>
	.badge {
		display: inline-flex;
		align-items: center;
		gap: 0.4em;
		padding: 0.2em 0.6em;
		border: 1px solid var(--color-line-strong);
		border-radius: var(--radius-pill);
		color: var(--color-text-muted);
		font-family: var(--font-mono);
		font-size: var(--step--2);
		line-height: 1.4;
		white-space: nowrap;
	}
	.accent {
		border-color: color-mix(in oklab, var(--accent) 45%, transparent);
		background: var(--accent-wash);
		color: var(--accent);
	}
</style>
