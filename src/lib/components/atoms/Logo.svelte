<!--
	The mark: a pixel d-pad with one lit button, drawn on a 9×9 grid so it stays crisp at
	favicon size. The d-pad is the core colour; the button picks up the current --accent.
-->
<script lang="ts">
	let { size = '1.75rem' }: { size?: string } = $props();
</script>

<svg
	class="logo"
	viewBox="0 0 9 9"
	width={size}
	height={size}
	aria-hidden="true"
	shape-rendering="crispEdges"
>
	<rect width="9" height="9" rx="1.6" fill="var(--color-surface-raised)" />
	<path d="M2 3h1V2h1v1h1v1H4v1H3V4H2z" fill="var(--lime-400)" />
	<rect x="6" y="5" width="1" height="1" fill="var(--accent)" />
	<rect x="5" y="6" width="1" height="1" fill="var(--color-text-faint)" />
</svg>

<style>
	.logo {
		flex: none;
		display: block;
	}
</style>
