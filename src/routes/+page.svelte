<script lang="ts">
	import Scaffolding from '$lib/components/Scaffolding.svelte';
	import { block, modal } from '$lib/modal.svelte.js';
	import '../app.css';
	import '$lib/common.css';
	import Button from '$lib/components/Button.svelte';
	import { markErrorAsHandled, formatDownloadRate, toHHMMSS as formatDuration } from '$lib/util.js';
	import axios, { AxiosError } from 'axios';
</script>

<Scaffolding />

<main class="p-4 space-y-4">
	<h1 class="text-4xl font-bold">Scaffolding Demo</h1>

	<h2 class="font-bold text-xl">Modals</h2>
	<Button
		class="block"
		onclick={async () => {
			await modal({
				type: 'ok',
				title: 'All Good!',
				md: 'Everything is fine',
				actions: [
					{
						text: 'OK',
						primary: true
					}
				]
			});
		}}
	>
		OK
	</Button>
	<Button
		class="block"
		onclick={async () => {
			const allow = await modal({
				type: 'confirm',
				title: 'Your Privacy Matters',
				md: 'We use Cookies to track you and sell your data to 3rd party to make profit.',
				actions: [
					{
						text: 'Necessary Cookies Only',
						primary: false,
						returns: false
					},
					{
						text: 'Accept All',
						primary: true,
						returns: true
					}
				]
			});
			await modal({
				type: allow ? 'ok' : 'error',
				title: 'Your Options',
				md: `You ${allow ? 'allowed' : "didn't allow"} us to use Cookies`,
				actions: [
					{
						text: 'OK',
						primary: true
					}
				]
			});
		}}
	>
		Cookies
	</Button>
	<Button
		class="block"
		onclick={() => {
			throw markErrorAsHandled(new SyntaxError('Cannot use import statement outside a module'));
		}}
	>
		Error
	</Button>
	<Button class="block" onclick={() => { ((globalThis as any)["doesNotExist"]).toString() }}>
		Unhandled Error
	</Button>
	<Button
		class="block"
		onclick={async () => {
			await modal({
				type: 'warning',
				title: 'Caution!',
				md: "Be careful! You will shoot yourself in the foot if you don't watch out.",
				actions: [
					{
						text: 'OK',
						primary: true
					}
				]
			});
		}}
	>
		Warning
	</Button>
	<Button
		class="block"
		onclick={async () => {
			await modal({
				type: 'confirm',
				title: 'Are you sure?',
				md: 'Do you want to delete your account? This action **cannot be undone**.',
				actions: [
					{
						text: 'Yes',
						primary: false,
						destructive: true
					},
					{
						text: 'No',
						primary: true
					}
				]
			});
		}}
	>
		Destructive Action
	</Button>
	<Button
		class="block"
		onclick={async () => {
			await modal({
				type: 'confirm',
				title: 'Are you sure?',
				md: 'Do you want to delete this product? This action **cannot be undone**.',
				actions: [
					{
						text: 'No'
					},
					{
						text: 'Yes',
						primary: true,
						destructive: true
					}
				]
			});
		}}
	>
		Destructive Action (2)
	</Button>

	{#snippet customModal(resolve: (returns: "yes" | "no") => void)}
		<div class="w-[100dvw] h-[100dvh] bg-white text-black">Hello, world!</div>
	{/snippet}
	<Button
		class="block"
		onclick={async () => {
			const result = await modal({
				type: 'custom',
				ui: customModal
			});
			console.log(result);
		}}
	>
		Invalid Custom Modal
	</Button>

	<Button
		class="block"
		onclick={async () => {
			await block({
				type: 'loading',
				mode: 'determinate',
				async task(states) {
					states.setTitle("Downloading")
					states.step(0).of(1).completed();
					const controller = new AbortController();
					states.setCancelHandler(async () => controller.abort());
					await axios.get('/a-very-large-file', {
						signal: controller.signal,
						onDownloadProgress(e) {
							states.step(1).completed(e.progress ?? 0);
							states.setDescription(
								`Downloading a very large file (speed: ${e.rate ? (e.rate * 8) / 1024 : 'unknown'} Kbps${e.estimated ? `, estimated ${e.estimated}s left` : ''})`
							);
						}
					});
				}
			});
		}}
	>
		Download (404)
	</Button>
	<Button
		class="block"
		onclick={async () => {
			const result = await modal.builder<boolean>("confirm")
				.title("Are you sure?")
				.content('Do you want to download an asset (25 MB)?')
				.action("No")
				.action("Yes", true)
				.primary()
				.withDeterminateLoadingScreen(async (states) => {
					states.setTitle("Downloading...")
					states.step(0).of(1).completed();
					const controller = new AbortController();
					states.setCancelHandler(async () => controller.abort());
					await axios.get('/large-file', {
						signal: controller.signal,
						async onDownloadProgress(e) {
							states.log(`Downloaded ${e.bytes.toPrecision(3)} bytes`)
							states.step(1).completed(e.progress ?? 0);
							await states.setDescription(
								`Downloading asset \n\nspeed: ${e.rate ? formatDownloadRate(e.rate) : 'unknown'}${e.estimated ? `, estimated ${formatDuration(e.estimated)} left` : ''}`
							);
						},
					});
				})
				.possibleErrors(AxiosError)	// when cancelled, or some network error
				.closeOnError()
				.show();
			if (result)
				await modal({
					type: 'ok',
					title: 'Done',
					md: 'The file has been completely downloaded',
					actions: ['OK']
				});
		}}
	>
		Download (25 MB)
	</Button>
</main>