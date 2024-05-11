<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	let { class: classList, "without-bg-color": withoutBG, children, ...rest }: HTMLAttributes<HTMLTableSectionElement> & { children: Snippet, 'without-bg-color'?: boolean } = $props();
</script>

<tfoot class="{classList} {withoutBG ? '' : 'bg-neutral-200 dark:[&_td]:bg-neutral-800 dark:[&_th]:bg-neutral-800'} border-neutral-400 dark:border-neutral-500" {...rest}>
	{@render children()}
</tfoot>