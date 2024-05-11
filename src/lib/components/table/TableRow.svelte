<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	let { class: classList, children, ...rest }: HTMLAttributes<HTMLTableRowElement> & { children: Snippet } = $props();
</script>

<tr class="border-neutral-400 dark:border-neutral-500 {classList}" {...rest}>
	{@render children()}
</tr>