<script lang="ts">
	import { onMount } from 'svelte';
	import './autocomplete.css';

	let {
		id,
		label,
		class: classList,
		insetLabel,
		...rest
	}: Omit<
		Parameters<(typeof import('accessible-autocomplete'))['default']>[0],
		'inputClasses' | 'hintClasses' | 'cssNamespace' | 'menuClasses' | 'element' | 'dropDownArrow'
	> & { label: string; class?: string, insetLabel?: boolean } = $props();

	let container: HTMLDivElement | undefined = $state(undefined);

	onMount(async () => {
		if (container) {
			const accessibleAutocomplete = (await import('accessible-autocomplete')).default;
			accessibleAutocomplete({
				element: container,
				id,
				displayMenu: 'overlay',
				dropdownArrow() {
					return `
					<span class="pointer-events-none absolute inset-y-0 right-0 ml-2 flex items-center pe-2 block h-[42px]">
						<svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path fill-rule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clip-rule="evenodd" />
						</svg>
					</span>
					`
				},
				...rest
			});
		}
	});
</script>

<div class={classList}>
	<label for={id} class="font-semibold text-sm {insetLabel ? 'ms-2' : ''}">
		{label}
	</label>
	<div bind:this={container} class="sf_autocomplete mt-1 h-[38px]"></div>
</div>
