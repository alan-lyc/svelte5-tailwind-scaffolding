<!--
	@component
	The Table Header `<th>` component.

	### Note
	You may use `scope="row"` to indicate (especially to screen readers) that the header is for a row.

	In the example below, the header "Apple" and "Orange" can be have `scope="row"`
	```
	*---------*------------*
	| Product | Items Sold |
	*---------*------------*
	| Apple   |    127     |
	*---------*------------*
	| Orange  |    255     |
	*---------*------------*
	```
-->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLThAttributes } from 'svelte/elements';
	let { class: classList, children, ...rest }: HTMLThAttributes & { children: Snippet } = $props();
</script>

<th class="px-4 py-2 {classList}" {...rest}>
	{@render children()}
</th>