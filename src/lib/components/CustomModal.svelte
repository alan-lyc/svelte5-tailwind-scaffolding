<script lang="ts">
	import type { CustomModal } from '$lib/modal.svelte.js';
	import { markErrorAsHandled } from '$lib/util.js';
	import { onMount } from 'svelte';

	let {
		states = $bindable(),
		dialog = $bindable(),
		visible = $bindable()
	}: {
		states: CustomModal<any>;
		dialog?: HTMLDialogElement | undefined;
		visible: boolean;
	} = $props();

	let container: HTMLDivElement | undefined = $state();

	onMount(() => {
		const d = container!.children[0];
		if (d instanceof HTMLDialogElement) {
			dialog = d;
			dialog.showModal();
			visible = true;
		} else {
			states.__reject?.(
				markErrorAsHandled(
					new Error(
						'The `Modal` component received a custom modal that does not produce an `HTMLDialogElement`'
					)
				)
			);
		}
	});
</script>

<div bind:this={container}>
	{@render states.ui(states.__resolve!, states.__reject!)}
</div>
