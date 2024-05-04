<script lang="ts">
	import { modal, modals } from '$lib/modal.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import '../common.css';
	import { ManagedError } from '$lib/util.js';
	import { onMount } from 'svelte';
	import dedent from 'dedent';

	async function handler(error: unknown, promise: boolean) {
		try {
			let title = promise ? 'Unhandled Promise Rejection' : 'Unhandled Error';
			let stack = '';
			let message = '';
			let userMessage =
				'An error occurred, but it was not properly handled. If the site becomes unstable, please try refreshing the page.';
			if (typeof error === 'string') {
				message = `Error: ${error}`;
			} else if (error instanceof ManagedError) {
				const e = error.error;
				title = 'An error occurred';
				userMessage = 'An error occurred with the following message:';
				if (typeof e === 'string') {
					message = e;
				} else if (e instanceof Error) {
					message = e.toString();
				} else if (
					typeof e === 'object' &&
					e &&
					'message' in e &&
					typeof e.message === 'string'
				) {
					message = `Error: ${e.message}`;
				} else {
					message = JSON.stringify(e);
				}
			} else if (error instanceof Error) {
				if (error instanceof Error && error.stack) {
					const e = error.toString();
					const s = error.stack;
					const t = s.startsWith(e) ? s.slice(e.length) : s
					stack = `\n\nStack Trace:\n\n\`\`\`\n${dedent(t)}\n\n\`\`\`\n\n`;
				}
				message = error.toString();
			} else if (
				typeof error === 'object' &&
				error &&
				'message' in error &&
				typeof error.message === 'string'
			) {
				message = `Error: ${error.message}`;
			} else {
				message = JSON.stringify(error);
			}
			await modal({
				type: 'error',
				title,
				md: `${userMessage}\n<div class="markdown-align-initial">\n\n> ${message}${stack}</div>`,
				actions: [
					{
						text: 'OK',
						primary: true,
						destructive: false
					}
				]
			});
		} catch (e) {
			
		}
	}

	onMount(() => {
		window.onerror = async (e, s, l, c, err) => {
			await handler(err, false);
		}
	})
</script>

<svelte:window
	onunhandledrejection={async (e) => {
		await handler(e.reason, true);
	}}
/>

{#each modals as modal}
	<Modal {modal} />
{/each}
