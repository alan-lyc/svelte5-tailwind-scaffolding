<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	let { class: classList, children, ...rest }: HTMLAttributes<HTMLTableSectionElement> & { children: Snippet } = $props();
</script>

<tbody class="{classList} border-neutral-400 dark:border-neutral-500" {...rest}>
	{@render children()}
</tbody>