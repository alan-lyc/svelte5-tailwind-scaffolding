<!--
	@component
	a label that wraps an `<input>` element
-->
<script lang="ts">
	import type { Snippet } from 'svelte';

	let { class: classList = '', children, smallText }: { class?: string; children: Snippet, smallText?: boolean } = $props();
</script>

<!-- svelte-ignore a11y_label_has_associated_control -->
<label class="block font-medium {smallText ? 'text-sm leading-6' : 'text-base leading-8'} text-gray-900 dark:text-gray-200 {classList}">
	{@render children()}
</label>
