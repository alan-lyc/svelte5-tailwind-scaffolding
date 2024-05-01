<script lang="ts">
	import { modal, modals } from '$lib/modal.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import '../common.css';
	import { ManagedError } from '$lib/util.js';

	async function handler(error: unknown, promise: boolean) {
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
				stack = `\n\nStack Trace:\n\`\`\`${error.stack}\n\n\`\`\`\n\n`;
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
		try {
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
</script>

<svelte:window
	onunhandledrejection={async (e) => {
		await handler(e.reason, true);
	}}
/>

{#each modals as modal}
	<Modal {modal} />
{/each}
