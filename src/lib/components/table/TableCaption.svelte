<!--
	@component
	The Table Caption `<caption>` element.
	
	## Waring
	This component ***MUST*** be the first child of the parent `<Table>`
-->
<script lang="ts">
	import { onMount, type Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	let {
		class: classList,
		children,
		...rest
	}: HTMLAttributes<HTMLElement> & { children: Snippet } = $props();

	let caption: HTMLTableCaptionElement | undefined = $state();
	
	onMount(() => {
		if (caption && caption.parentElement && caption.parentElement.firstElementChild !== caption && caption.parentElement.firstElementChild?.nextElementSibling !== caption) {
			console.warn("Warning: The <TableCaption> component must be the first child of the parent <Table>")
		}
	});
</script>

<caption
	bind:this={caption}
	class="pt-2 text-neutral-600 dark:text-neutral-400 {classList}"
	{...rest}
>
	{@render children()}
</caption>
