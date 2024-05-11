<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLTdAttributes } from 'svelte/elements';
	let { class: classList, children, ...rest }: HTMLTdAttributes & { children: Snippet } = $props();
</script>

<td class="px-4 py-2 border-neutral-400 dark:border-neutral-500 {classList}" {...rest}>
	{@render children()}
</td>