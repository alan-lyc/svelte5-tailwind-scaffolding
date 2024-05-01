<script lang="ts">
	import { X } from 'lucide-svelte';

	let { type }: { type: 'error' | 'warning' | 'ok' | 'confirm' } = $props();
</script>

<div
	aria-hidden="true"
	class="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full {type ===
	'error'
		? 'bg-red-100'
		: type === 'confirm'
			? 'bg-blue-100'
			: type === 'warning'
				? 'bg-yellow-100'
				: 'bg-green-100'} sm:mx-0 sm:h-10 sm:w-10"
>
	{#if type == 'error'}
		<X class="h-6 w-6 text-red-600" />
	{:else if type === 'ok'}
		<svg
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			aria-hidden="true"
			class="h-6 w-6 text-green-600"
			><path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5"></path></svg
		>
	{:else if type === 'confirm'}
		<span class="text-2xl text-blue-700 font-[arial]"> ? </span>
	{:else if type === 'warning'}
		<svg
			class="h-6 w-6 text-yellow-700"
			fill="none"
			viewBox="0 0 24 24"
			stroke-width="1.5"
			stroke="currentColor"
			aria-hidden="true"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
			></path>
		</svg>
	{/if}
</div>
