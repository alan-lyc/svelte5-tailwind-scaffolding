<script lang="ts">
	import type { LoadingStateImpl } from '$lib/modal.svelte.js';
	import { onDestroy, onMount } from 'svelte';
	import BaseModal from './BaseModal.svelte';
	import Button from './Button.svelte';

	let {
		states = $bindable(),
		dialog = $bindable(),
		visible = $bindable()
	}: {
		states: LoadingStateImpl;
		dialog?: HTMLDialogElement;
		visible: boolean;
	} = $props();

	onMount(() => {
		states.animateClose = animateClose;
	});

	let animateClose: (() => Promise<void>) | undefined = $state(undefined);
	let code: HTMLElement | undefined = $state(undefined);

	$effect(() => {
		if (states.logs && code) {
			code.scrollIntoView({ block: 'end', behavior: 'smooth' });
		}
	});

	let progress = $derived(
		states.totalSteps
			? parseFloat(
					(
						(states.progress.completedSteps + states.progress.completedPortion) /
						states.totalSteps
					).toFixed(3)
				)
			: null
	);

	let dots = $state("");
	let i: ReturnType<typeof setInterval> | undefined = $state();

	onMount(async () => {
		dialog?.showModal();
		visible = true;
		i = setInterval(() => {
			dots = dots + ".";
			if (dots.length > 3) dots = "";
		}, 750)
	});

	onDestroy(() => {
		clearInterval(i);
	})

	$effect(() => {
		states.animateClose = animateClose;
	});
</script>

{#snippet buttons(animateClose: () => Promise<void>)}
	<Button
		class="inline-flex w-full sm:w-auto"
		onclick={async () => {
			await states.cancel?.();
			await animateClose();
			dialog?.close();
		}}
	>
		Cancel
	</Button>
{/snippet}
<BaseModal
	bind:dialog
	bind:visible
	bind:animateClose
	buttons={states.cancel ? buttons : undefined}
	alwaysFullWidth
>
	<div class="text-center sm:text-left sm:mt-0 flex-1 min-w-0">
		<h2 class=" text-lg sm:text-base font-semibold leading-6 text-gray-900 dark:text-white">
			{states.title}
		</h2>
		<div class="mt-2 text-sm text-gray-500 dark:text-gray-300 markdown">
			{#if states.mode === "determinate"}
			<div class="flex items-center gap-2">
				<span>{progress ? `${(progress * 100).toPrecision(3)}%` : 'Pending'}</span><progress
					class="h-2 flex-1 rounded overflow-hidden min-w-0"
					value={progress}
					max="1"
				></progress>
			</div>
			{:else}
			<div class="flex items-center gap-2">
				This may take a while {dots}
			</div>
			{/if}
			{@html states.text}
			{#if states.logs.length}
				<pre><code bind:this={code}
						>{#each states.logs as log}{log}<br />{/each}</code
					></pre>
			{/if}
		</div>
	</div>
</BaseModal>
