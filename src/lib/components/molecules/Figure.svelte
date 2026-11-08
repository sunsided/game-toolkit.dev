<script lang="ts">
	let { src, alt, caption }: { src: string; alt: string; caption?: string } = $props();
</script>

<figure class="figure">
	<img {src} {alt} loading="lazy" decoding="async" />
	{#if caption}<figcaption>{caption}</figcaption>{/if}
</figure>

<style>
	.figure {
		display: grid;
		gap: var(--space-3);
		margin: 0;
	}
	img {
		inline-size: 100%;
		aspect-ratio: 4 / 3;
		object-fit: cover;
		border-radius: var(--radius-m);
		box-shadow: 0 0 0 1px var(--color-line-strong);
		background: var(--color-bg-deep);
		/* Screenshots of pixel art: keep the pixels square when scaled. */
		image-rendering: pixelated;
	}
	figcaption {
		color: var(--color-text-muted);
		font-size: var(--step--1);
	}
</style>
