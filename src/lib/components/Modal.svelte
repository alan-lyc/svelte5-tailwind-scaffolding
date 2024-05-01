<script lang="ts">
	import type { ModalState } from '../modal.svelte';
	import '../common.css';
	import PredefinedModal from './PredefinedModal.svelte';
	import CustomModal from './CustomModal.svelte';
	import LoadingModal from './LoadingModal.svelte';

	let {
		modal: states = $bindable()
	}: {
		modal: ModalState<string | undefined>;
	} = $props();

	let dialog: HTMLDialogElement | undefined = $state();
	let visible = $state(false);
	let rendered = $state('');
</script>

{#if states.type === 'custom'}
	<CustomModal bind:visible bind:dialog bind:states />
{:else if states.type === 'loading'}
	<LoadingModal bind:dialog bind:visible bind:states />
{:else}
	<PredefinedModal bind:dialog bind:visible {states} {rendered} />
{/if}
