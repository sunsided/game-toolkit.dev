<!--
	A link or a button that looks like one. `primary` is filled with the current --accent,
	`secondary` is outlined, `ghost` is text with a hover wash.
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAnchorAttributes, HTMLButtonAttributes } from 'svelte/elements';

	type Props = {
		variant?: 'primary' | 'secondary' | 'ghost';
		size?: 'm' | 's';
		children: Snippet;
	} & (({ href: string } & HTMLAnchorAttributes) | ({ href?: undefined } & HTMLButtonAttributes));

	let { variant = 'secondary', size = 'm', children, ...rest }: Props = $props();
</script>

{#if rest.href !== undefined}
	<a class="button {variant} {size}" {...rest as HTMLAnchorAttributes}>{@render children()}</a>
{:else}
	<button class="button {variant} {size}" type="button" {...rest as HTMLButtonAttributes}
		>{@render children()}</button
	>
{/if}

<style>
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: var(--space-2);
		min-block-size: 2.75rem;
		padding-inline: var(--space-5);
		border: 1px solid transparent;
		border-radius: var(--radius-m);
		font: inherit;
		font-size: var(--step--1);
		font-weight: 600;
		line-height: 1;
		text-decoration: none;
		white-space: nowrap;
		cursor: pointer;
		transition:
			background-color var(--dur-fast) var(--ease-out),
			border-color var(--dur-fast) var(--ease-out),
			color var(--dur-fast) var(--ease-out),
			translate var(--dur-fast) var(--ease-out);
	}
	.button:active {
		translate: 0 1px;
	}
	.s {
		min-block-size: 2.25rem;
		padding-inline: var(--space-4);
	}
	.primary {
		background: var(--accent);
		color: var(--color-bg-deep);
		box-shadow: 0 0 1.5rem -0.5rem var(--accent-glow);
	}
	.primary:hover {
		background: color-mix(in oklab, var(--accent) 82%, white);
	}
	.secondary {
		border-color: var(--color-line-strong);
		background: var(--color-surface);
		color: var(--color-text-strong);
	}
	.secondary:hover {
		border-color: var(--accent);
	}
	.ghost {
		color: var(--color-text-muted);
	}
	.ghost:hover {
		background: var(--color-surface-raised);
		color: var(--color-text-strong);
	}
</style>
