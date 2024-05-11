<script lang="ts">
	import Scaffolding from '$lib/components/Scaffolding.svelte';
	import { block, modal } from '$lib/modal.svelte.js';
	import '../app.css';
	import '$lib/common.css';
	import { timeout } from '$lib/util.js';
	import Button from '$lib/components/Button.svelte';
	import { markErrorAsHandled } from '$lib/util.js';
	import axios, { AxiosError } from 'axios';
	import BaseModal from '$lib/components/BaseModal.svelte';
	import InputText from '$lib/components/InputText.svelte';
	import Label from '$lib/components/Label.svelte';
	import _ from 'lodash';
	import ModalContentForm from '$lib/components/ModalContentForm.svelte';
	import Autocomplete from '$lib/components/Autocomplete.svelte';
	import { countries } from './countries.js';
	import Table from '$lib/components/table/Table.svelte';
	import TableHead from '$lib/components/table/TableHead.svelte';
	import TableRow from '$lib/components/table/TableRow.svelte';
	import TableHeadCell from '$lib/components/table/TableHeadCell.svelte';
	import TableBody from '$lib/components/table/TableBody.svelte';
	import TableCell from '$lib/components/table/TableCell.svelte';
	import TableFoot from '$lib/components/table/TableFoot.svelte';
	import TableCaption from '$lib/components/table/TableCaption.svelte';
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
				],
				defaultReturn: true,
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
				],
				preventEscape: true,
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
				],
				defaultReturn: undefined,
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
				],
				defaultReturn: undefined,
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
				],
				defaultReturn: undefined,
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
				],
				defaultReturn: undefined,
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
					states.setTitle('Downloading');
					states.step(0).of(1).completed();
					const controller = new AbortController();
					states.setCancelHandler(async () => controller.abort());
					await axios.get('/a-very-large-file', {
						signal: controller.signal,
						async onDownloadProgress(e) {
							states.step(1).completed(e.progress ?? 0);
							await states.setDescription(
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
			const result = await modal
				.builder('confirm')
				.title('Are you sure?')
				.content('Do you want to download an asset (25 MB)?')
				.defaultReturn(undefined)
				.action('No')
				.action('Yes', true)
				.primary()
				.withDeterminateLoadingScreen(async (states) => {
					states.setTitle('Downloading...');
					states.step(0).of(1).completed();
					let s = 120;
					const cancel = { value: false };
					states.setCancelHandler(() => {
						cancel.value = true;
					});
					states.setDescription(
						'Downloading asset \n\nspeed: unknown, estimated unknown time left'
					);
					for (let i = 0; i < s; i++) {
						if (cancel.value) throw Error('cancelled');
						await timeout(1000);
						states.step(1).completed((i + 1) / s);
						states.log(`Time elapsed ${i + 1} seconds`);
					}
				})
				.possibleErrors(AxiosError) // when cancelled, or some network error
				.closeOnError()
				.show();
			if (result)
				await modal({
					type: 'ok',
					title: 'Done',
					md: 'The file has been completely downloaded',
					actions: ['OK'],
					defaultReturn: undefined,
				});
		}}
	>
		Download Asset (fake, 120s)
	</Button>

	{#snippet login(resolve: (str: [string, string] | undefined) => void)}
		<BaseModal oncancel={() => resolve(undefined)}>
			{#snippet children(animateClose)}
				{@const credentials = { username: '', password: '' }}
				<ModalContentForm
					title="Login"
					class="gap-2 flex flex-col"
					onsubmit={async (e) => {
						e.preventDefault();
						if (credentials.username && credentials.password) {
							await animateClose();
							resolve([credentials.username, credentials.password]);
						}
					}}
				>
					<Label class="text-start">
						Username
						<InputText bind:value={credentials.username} class="w-full" name="username" />
					</Label>
					<Label class="text-start">
						Password
						<InputText
							bind:value={credentials.password}
							class="w-full"
							name="password"
							type="password"
							validate={(v) =>
								v.length <= 8 ? 'A password must be longer than 8 characters' : undefined}
						/>
					</Label>
					<div class="flex justify-end w-full mt-4 gap-2">
						<Button
							class="w-full sm:w-auto"
							type="button"
							onclick={async () => {
								await animateClose();
								resolve(undefined);
							}}>Cancel</Button
						>
						<Button class="w-full sm:w-auto" primary type="submit">Confirm</Button>
					</div>
				</ModalContentForm>
			{/snippet}
		</BaseModal>
	{/snippet}
	<Button
		class="block"
		onclick={async () => {
			const [user, pwd] = (await modal({
				type: 'custom',
				ui: login
			})) ?? [undefined, undefined];
			if (user && pwd)
				await modal
					.builder('ok')
					.title('Credentials')
					.content(`Your username is \`${_.escape(user)}\`, and your password is \`${pwd}\``)
					.defaultReturn(undefined)
					.action('OK')
					.show();
		}}
	>
		Login
	</Button>

	<h2 class="font-bold text-xl">Other Utilities</h2>
	<h3 class="font-bold text-lg">1. Autocomplete</h3>
	<Autocomplete
		inset-label
		label="Countries"
		id="countries"
		class="max-w-sm !mt-0"
		source={countries}
		show-all-values
		autoselect
		localization-assistive-hint={""}
	/>
	<h3 class="font-bold text-lg">2. Buttons</h3>
	<div class="flex gap-2 !mt-0 pt-1">
		<Button primary>Primary</Button>
		<Button>Secondary</Button>
		<Button primary destructive>Primary, Destructive</Button>
		<Button destructive>Secondary, Destructive</Button>
	</div>
	<div>
		<h3 class="font-bold text-lg">3. Normal Input</h3>
		<Label>
			<span class="ms-2">Input</span>
			{@const ref = { value: "" }}	<!-- just don't want to go to the top, you know? -->
			<InputText bind:value={ref.value} class="w-96" />
		</Label>
	</div>
	<div>
		<h3 class="font-bold text-lg">4. Tables</h3>
		<Table class="mt-2 table-auto">
			<TableCaption>
				The products we sell
			</TableCaption>
			<colgroup>
				<col>
				<col>
				<col class="whitespace-nowrap text-nowrap min-w-full">
				<col>
			</colgroup>
			<TableHead>
				<TableRow>
					<TableHeadCell>
						Product ID
					</TableHeadCell>
					<TableHeadCell>
						Product Name
					</TableHeadCell>
					<TableHeadCell>
						Last Modified
					</TableHeadCell>
					<TableHeadCell>
						Profit
					</TableHeadCell>
				</TableRow>
			</TableHead>
			<TableBody>
				<TableRow>
					<TableCell>
						00002
					</TableCell>
					<TableCell>
						Orange
					</TableCell>
					<TableCell class="whitespace-nowrap">
						1 Jan 1970 00:00
					</TableCell>
					<TableCell>
						$0.00
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>
						00003
					</TableCell>
					<TableCell>
						Grapes
					</TableCell>
					<TableCell>
						1 Jan 1970 00:00
					</TableCell>
					<TableCell>
						$0.00
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>
						00004
					</TableCell>
					<TableCell>
						Pineapple
					</TableCell>
					<TableCell>
						1 Jan 1970 00:00
					</TableCell>
					<TableCell>
						$0.00
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>
						00005
					</TableCell>
					<TableCell>
						Lorem ipsum dolor, sit amet consectetur adipisicing elit. Consequuntur blanditiis tempore molestiae odit, architecto recusandae perspiciatis atque placeat exercitationem eos id ullam sapiente earum commodi asperiores ipsa sit! Laudantium, adipisci.
					</TableCell>
					<TableCell>
						1 Jan 1970 00:00
					</TableCell>
					<TableCell>
						$0.00
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>
						00006
					</TableCell>
					<TableCell>
						Mango
					</TableCell>
					<TableCell>
						1 Jan 1970 00:00
					</TableCell>
					<TableCell>
						$0.00
					</TableCell>
				</TableRow>
				<TableRow>
					<TableCell>
						00007
					</TableCell>
					<TableCell>
						Watermelon
					</TableCell>
					<TableCell>
						1 Jan 1970 00:00
					</TableCell>
					<TableCell>
						$0.00
					</TableCell>
				</TableRow>
			</TableBody>
			<!-- <TableFoot>
				<TableRow>
					<TableHeadCell colspan={3} style="text-align: initial;">
						Total Profit
					</TableHeadCell>
					<TableCell>
						$0.00
					</TableCell>
				</TableRow>
			</TableFoot> -->
		</Table>
	</div>
</main>