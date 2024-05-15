<script lang="ts">
	import type { PredefinedModal } from "$lib/modal.types.ts"
	import { block } from '$lib/modal.svelte.js';
	import { onMount } from 'svelte';
	import BaseModal from './BaseModal.svelte';
	import Button from './Button.svelte';
	import ModalIcon from './ModalIcon.svelte';
	import dedent from 'dedent';
	import { markErrorAsHandled, timeout } from '$lib/util.js';
	import ModalContent from './ModalContent.svelte';

	let {
		states,
		dialog = $bindable(),
		visible = $bindable(),
		rendered
	}: {
		states: PredefinedModal<any>;
		dialog?: HTMLDialogElement;
		visible: boolean;
		rendered: string;
	} = $props();

	// eslint-disable-next-line svelte(non_state_reference)
	let DOMPurify: Awaited<ReturnType<typeof imports>>['DOMPurify'] | undefined;
	let marked: typeof import('marked') | undefined;

	let disabled = $state(false);

	async function imports() {
		return {
			DOMPurify: (await import('dompurify')).default,
			marked: await import('marked')
		};
	}

	onMount(async () => {
		rendered = states.md;
		dialog!.showModal();
		await timeout(50);
		visible = true;
		({ DOMPurify, marked } = await imports());
		rendered = DOMPurify?.sanitize((await marked?.parse(dedent(states.md))) ?? '');
	});
</script>

<BaseModal
	bind:dialog
	bind:visible
	preventEscape={states.preventEscape}
	oncancel={() => {
	console.log("this")
	states.__resolve!(states.defaultReturn)
}}
>
	<ModalIcon type={states.type} />
	<ModalContent title={states.title} withMargins>
		{@html rendered}
	</ModalContent>
	{#snippet buttons(animateClose)}
		{#each states.actions as action}
			{@const realAction =
				typeof action === 'string'
					? { text: action, primary: states.actions.length === 1 }
					: action}
			<Button
				class="inline-flex w-full sm:w-auto"
				primary={realAction.primary}
				destructive={realAction.destructive}
				{disabled}
				onclick={async () => {
					disabled = true;
					let result = true;
					try {
						if ("loadingScreenMode" in realAction) {
							// yeah we really have to duplicate them because TypeScript will not be happy if we don't
							if (realAction.loadingScreenMode === "indeterminate") {
								result = (await block({
									type: "loading",
									// title: realAction.loadingScreenTitle,
									mode: realAction.loadingScreenMode,
									task: realAction.onclick,
								})) ?? true
							} else if (realAction.loadingScreenMode === "determinate") {
								result = (await block({
									type: "loading",
									// title: realAction.loadingScreenTitle,
									mode: realAction.loadingScreenMode,
									task: realAction.onclick,
								})) ?? true
							}
						} else {
							result = (await realAction.onclick?.()) ?? true;
						}
						if (result) {
							await animateClose();
							dialog?.close();
						}
						states.__resolve!(realAction.returns)
					} catch (e) {
						let error = e;
						if (
							realAction.possibleErrors && 
							realAction.possibleErrors.length && 
							realAction.possibleErrors.some((c) => error instanceof c)
						) {
							error = markErrorAsHandled(error);
						}
						if (realAction.closeOnError) {
							await animateClose();
							dialog?.close();
							states.__reject!(error)
						} else {
							throw error;
						}
					}
				}}
			>
				{realAction.text}
			</Button>
		{/each}
	{/snippet}
</BaseModal>
