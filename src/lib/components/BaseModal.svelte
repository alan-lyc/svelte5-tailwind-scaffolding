<!--
	@component
	A ready-to-use modal for you to build custom functions on top of it.
	
	It is supposed to provide a default style, and you are not supposed to build your own style for it.
-->
<script lang="ts">
	import { timeout } from '../util.js';
	import { onMount, type Snippet } from 'svelte';
	import '../common.css';

	let {
		dialog = $bindable(),
		visible = $bindable(),
		duration = 200,
		class: classList,
		// flex = 'horizontal',
		animateClose: closeFn = $bindable(),
		alwaysFullWidth = false,
		buttons,
		children,
		oncancel,
		preventEscape = false,
	}: {
		dialog?: HTMLDialogElement | null | undefined;
		visible?: boolean;
		/**
		 * the duration of animation in `ms` (milliseconds)
		 */
		duration?: number;
		class?: string;
		buttons?: Snippet<[typeof animateClose]>;
		alwaysFullWidth?: boolean;
		/**
		 * Whether or not to apply a *horizontal flex* to the content container
		 * ```txt
		 * *-------------------------------------------*
		 * | ## Your Privacy Matters                   | | <-- this box
		 * | We sell your data to 3rd party to make    | |
		 * | money.                                    | |
		 * *-------------------------------------------*
		 * |                                    [ OK ] |
		 * *-------------------------------------------*
		 * ```
		 */
		flex?: 'horizontal' | 'vertical' | false;
		animateClose?: typeof animateClose;

		// 'class'?: string
		children: Snippet<[typeof animateClose]>;
		oncancel: (e: Event & { currentTarget: HTMLDialogElement }) => void | Promise<void>;
		preventEscape?: boolean;
	} = $props();

	// let transparent = $state(false)

	onMount(async () => {
		closeFn = animateClose;
		if (visible === undefined) {
			dialog?.close();
			await timeout(100);
			dialog?.showModal();
			visible = true;
		}
	});

	/**
	 * ### WARNING: call this before you `resolve`!!!
	 */
	async function animateClose(): Promise<
		({ WARNING: 'call this before you call resolve' } & never) | void
	> {
		visible = false;
		await timeout(duration);
	}
</script>

<!-- svelte-ignore deprecated_slot_element -->
<dialog
	bind:this={dialog}
	class="
		{classList}
		{visible
		? 'scale-[1] backdrop:bg-black/25 dark:backdrop:bg-white/15'
		: 'scale-[0] backdrop:bg-transparent dark:backdrop:bg-transparent'} 
		overflow-hidden rounded-lg bg-white dark:bg-slate-800 text-left shadow-xl transition-all backdrop:transition-all
		{alwaysFullWidth ? 'w-full' : 'sm:w-full'} sm:max-w-lg min-w-72 flex flex-col
	"
	style="--sc-tr-d: {duration}ms"
	oncancel={async (e) => {
		if (preventEscape) e.preventDefault();
		else await animateClose();
		await oncancel?.(e);
	}}
>
	<div
		class=" bg-white dark:bg-gray-800 px-4 {buttons ? 'pb-4 sm:pb-4' : 'pb-6'} pt-5 sm:p-6 flex-[1_1_auto] min-h-0 flex flex-col sm:flex-row"
	>
		{@render children(animateClose)}
	</div>
	{#if buttons}
		<div
			class="bg-gray-50 dark:bg-gray-900 px-4 py-3 sm:flex sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 sm:px-6"
		>
			{@render buttons(animateClose)}
		</div>
	{/if}
</dialog>

<style lang="postcss">
	dialog {
		transition-duration: var(--sc-tr-d);
	}
	dialog::backdrop {
		transition-duration: var(--sc-tr-d);
	}
</style>
