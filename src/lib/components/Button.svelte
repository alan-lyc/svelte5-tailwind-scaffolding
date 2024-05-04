<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLButtonAttributes } from 'svelte/elements';
	import '../common.css';

	let {
		children,
		primary,
		destructive,
		class: classList,
		...rest
	}: {
		children: Snippet;
		primary?: boolean;
		destructive?: boolean;
	} & HTMLButtonAttributes = $props();
</script>

<button
	class="
	transition-all duration-200
	{classList}
	{primary
		? destructive
			? 'justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:bg-red-500 focus-visible:ring-1 focus-visible:dark:ring-black focus-visible:ring-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600'
			: 'justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-indigo-500 focus-visible:ring-1 focus-visible:dark:ring-black focus-visible:ring-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600'
		: destructive
			? 'justify-center rounded-md bg-white dark:bg-red-50 px-3 py-2 text-sm font-semibold text-red-800 dark:text-red-900 shadow-sm ring-1 ring-inset ring-red-400 dark:ring-red-500 hover:bg-red-100 dark:hover:bg-red-200 sm:mt-0'
			: 'justify-center rounded-md bg-white dark:bg-gray-200 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-black shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-gray-500 hover:bg-gray-50 hover:dark:bg-white sm:mt-0'}"
	{...rest}
>
	{@render children()}
</button>

<style>
</style>
