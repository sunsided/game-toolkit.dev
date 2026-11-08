<!--
	A highlighted snippet: a bar with its file name and a copy button, then
	Shiki's <pre>. `html` comes from the server (Shiki escapes the code); `code` is the plain
	text the button copies.
-->
<script lang="ts">
	let {
		html,
		code,
		title,
		maxHeight
	}: { html: string; code: string; title?: string; maxHeight?: string } = $props();

	let copied = $state(false);
	let timer: ReturnType<typeof setTimeout> | undefined;

	async function copy() {
		try {
			await navigator.clipboard.writeText(code);
			copied = true;
			clearTimeout(timer);
			timer = setTimeout(() => (copied = false), 1600);
		} catch {
			// No clipboard permission: the text stays selectable.
		}
	}
</script>

<figure class="code">
	<figcaption class="bar">
		{#if title}<span class="title">{title}</span>{/if}
		<button class="copy" type="button" onclick={copy} aria-live="polite">
			{copied ? 'Copied' : 'Copy'}
		</button>
	</figcaption>
	<div class="body" style:--max-height={maxHeight}>{@html html}</div>
</figure>

<style>
	.code {
		margin: 0;
		min-inline-size: 0;
		border: 1px solid var(--color-line);
		border-radius: var(--radius-l);
		background: var(--color-bg-deep);
		box-shadow: var(--shadow-raised);
		overflow: hidden;
	}
	.bar {
		display: flex;
		align-items: center;
		gap: var(--space-3);
		padding: var(--space-2) var(--space-2) var(--space-2) var(--space-4);
		border-block-end: 1px solid var(--color-line);
		background: var(--color-surface);
		font-family: var(--font-mono);
		font-size: var(--step--2);
		color: var(--color-text-muted);
	}
	.title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.copy {
		margin-inline-start: auto;
		padding: 0.3rem 0.65rem;
		border: 1px solid transparent;
		border-radius: var(--radius-s);
		background: none;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}
	.copy:hover {
		border-color: var(--color-line-strong);
		color: var(--color-text-strong);
	}
	.body :global(pre) {
		max-block-size: var(--max-height, none);
		margin: 0;
		padding: var(--space-4) var(--space-5);
		overflow-x: auto;
		font-size: var(--step--1);
		line-height: 1.65;
		tab-size: 4;
	}
	.body :global(code) {
		font-size: inherit;
	}
</style>
