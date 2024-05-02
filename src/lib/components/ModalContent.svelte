<script lang="ts">
	import type { Snippet } from "svelte";

	let { title, children }: { title: string, children: Snippet } = $props();
</script>

<div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1 min-w-0">
	<h2 class="text-lg sm:text-base font-semibold leading-6 text-gray-900 dark:text-white">
		{title}
	</h2>
	<div
		class="mt-1 text-sm text-gray-500 dark:text-gray-300 markdown"
	>
		{@render children()}
	</div>
</div>