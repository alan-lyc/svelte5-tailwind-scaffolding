<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributes } from 'svelte/elements';
	let { class: classList, "without-bg-color": withoutBG, children, ...rest }: HTMLAttributes<HTMLTableSectionElement> & { children: Snippet, 'without-bg-color'?: boolean } = $props();
</script>

<thead class="{withoutBG ? '' : 'bg-neutral-200 dark:bg-neutral-800'} {classList}" {...rest}>
	{@render children()}
</thead>