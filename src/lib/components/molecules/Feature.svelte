<!-- One highlight: a short title and a sentence or two, with a pixel bullet in the accent. -->
<script lang="ts">
	import RichText from '../atoms/RichText.svelte';

	let { title, text }: { title: string; text: string } = $props();
</script>

<div class="feature">
	<h3><span class="pip" aria-hidden="true"></span>{title}</h3>
	<p><RichText {text} /></p>
</div>

<style>
	.feature {
		display: grid;
		gap: var(--space-2);
		align-content: start;
		padding-block-start: var(--space-4);
		border-block-start: 1px solid var(--color-line);
	}
	h3 {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		font-size: var(--step-1);
		letter-spacing: -0.015em;
	}
	.pip {
		flex: none;
		inline-size: 0.5rem;
		block-size: 0.5rem;
		background: var(--accent);
		box-shadow: 0 0 0.6rem var(--accent-glow);
	}
	p {
		color: var(--color-text-muted);
		font-size: var(--step--1);
	}
</style>
