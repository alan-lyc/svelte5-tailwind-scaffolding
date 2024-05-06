<script lang="ts">
	import type { Snippet } from 'svelte';
	import ModalContent0 from './ModalContent0.svelte';
	import type { HTMLFormAttributes } from 'svelte/elements';

	let {
		title,
		withMargins,
		contentFlexCol: contentFlex,
		class: classList = "",
		children,
		...rest
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
	} & HTMLFormAttributes = $props();
</script>

<ModalContent0 {title} {withMargins}>
	<form
		{...rest}
		class="mt-1 text-sm text-gray-500 dark:text-gray-300 flex-1 min-h-0 {contentFlex
			? 'flex flex-col'
			: ''} {classList}"
	>
		{@render children()}
	</form>
</ModalContent0>
