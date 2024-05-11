<!--
	@component
	The Table `<table>` component.
	
	### Note
	You can use `<colgroup>` to style your columns (though with limited capability), and you can have multiple `<TableBody>` in your `<Table>`
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import "./table.css"
	import type { HTMLTableAttributes } from 'svelte/elements';
	let { class: classList, children, ...rest }: HTMLTableAttributes & { children: Snippet } = $props();
</script>

<table class="sf-table caption-bottom appearance-none dark:border-neutral-500 border-collapse overflow-hidden {classList}" {...rest}>
	{@render children()}
</table>