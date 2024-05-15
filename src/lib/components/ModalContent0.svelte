<script lang="ts">
	import type { Snippet } from 'svelte';

	let {
		title,
		withMargins,
		contentFlexCol: contentFlex,
		class: classList = "",
		children,
	}: {
		title: string;
		children: Snippet;
		/**
		 * if true, apply `mt-3 sm:ml-4 sm:mt-0` to the outermost `div` (you can then place a icon on the left, and on the top for small screens)
		 */
		withMargins?: boolean;
		/**
		 * if true, apply `flex flex-col` to the `div` that wraps your `children`, useful if you want to do the `flex-1 min-h-0` trick to limit the height of some elements
		 */
		contentFlexCol?: boolean;
		/**
		 * apply classes to the `div` that wraps your `children`
		 */
		class?: string;
	} = $props();
</script>

<div
	class="{withMargins
		? 'mt-3 sm:ml-4 sm:mt-0'
		: ''} text-center sm:text-left flex-1 min-w-0 min-h-0 flex flex-col overflow-auto"
>
	<h2 class="text-lg sm:text-base font-semibold leading-6 text-gray-900 dark:text-white">
		{title}
	</h2>
	<div
		class="mt-1 text-sm text-gray-500 dark:text-gray-300 markdown flex-1 min-h-0 {contentFlex
			? 'flex flex-col'
			: ''} {classList}"
	>
		{@render children()}
	</div>
</div>