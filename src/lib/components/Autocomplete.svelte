<!--
	@component
	an autocomplete component, suitable for form inputs
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import './autocomplete.css';
	import _ from 'lodash';
	import { timeout } from '$lib/util.js';

	let {
		id,
		label,
		class: classList,
		insetLabel,
		source,
		onchange,
		autoselect,
		withoutNormalization,
		onconfirm,
		...rest
	}: Omit<
		Parameters<(typeof import('accessible-autocomplete'))['default']>[0],
		| 'inputClasses'
		| 'hintClasses'
		| 'cssNamespace'
		| 'menuClasses'
		| 'element'
		| 'dropDownArrow'
		| 'source'
		| 'autoselect'
		| 'onConfirm'
	> & {
		/**
		 * a *static, constant, non-reactive, unchanging* `id` for the `<input>` and the `<label for="...">`
		 * 
		 * You may get an "incorrect use of `<label for=FORM_ELEMENT>`" warning on Chrome. This is expected behavior because the <input> is not immediately rendered on the DOM.
		 */
		id: string,
		label: string;
		class?: string;
		/**
		 * apply a margin to the left of the label
		 * 
		 * Visualization:
		 * 
		 * this:
		 * ```txt
		 * Label
		 * *------------------------*
		 * | input                  |
		 * *------------------------*
		 * ```
		 * becomes:
		 * ```txt
		 *   Label
		 * *------------------------*
		 * | input                  |
		 * *------------------------*
		 * ```
		 */
		insetLabel?: boolean;
		/**
		 * the suggestions *in HTML* (or a function that generates them), for your autocomplete.
		 * 
		 * ### Warning
		 * The suggestions provided here are ***directly interpolated as HTML***. To mitigate potential XSS vectors, you are advised to escape / sanitizate any untrusted user-provided strings as suggestion.
		 * 
		 * ### Note on Unicode Normalization
		 * If this field is a function, the `query` passed to the function is NFKC normalized. To avoid normalization, set `withoutNormalization` to true.
		 */
		source: string[] | ((query: string) => string[] | Promise<string[]>);
		withoutNormalization?: boolean;
		/**
		 * a function to be executed *before* the updating the autocomplete suggestions
		 */
		onchange?: (query: string) => void | Promise<void>;
		/**
		 * select the first suggestion automatically, and confirm the selection when `blur` is fired
		 * 
		 * **Require CSS `:has()` selector (Baseline 2023)**
		 */
		autoselect?: boolean;
		onconfirm?: () => void;
	} = $props();

	let container: HTMLDivElement | undefined = $state(undefined);

	onMount(async () => {
		if (container) {
			const accessibleAutocomplete = (await import('accessible-autocomplete')).default;
			accessibleAutocomplete({
				element: container,
				id,
				displayMenu: 'overlay',
				onConfirm: onconfirm,
				dropdownArrow() {
					return `
					<span class="pointer-events-none absolute inset-y-0 right-0 ml-2 flex items-center pe-2 block h-[42px]">
						<svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
							<path fill-rule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clip-rule="evenodd" />
						</svg>
					</span>
					`;
				},
				async source(query, populate) {
					const normalized = withoutNormalization ? query : query.normalize("NFKC")
					await onchange?.(normalized);
					if (source instanceof Array) {
						const filtered = source.filter((v) =>
							(withoutNormalization ? v : v.normalize("NFKC")).toLocaleLowerCase().includes(normalized.toLocaleLowerCase())
						);
						const [beginsWith, other] = [[] as string[], [] as string[]];
						for (const v of filtered) {
							if (v.startsWith(normalized)) {
								beginsWith.push(v);
							} else {
								other.push(v);
							}
						}
						const sorted = _.flatten([beginsWith.sort(), other.sort()]);
						populate(sorted);
					} else {
						populate(await source(normalized));
					}
				},
				autoselect,
				...rest
			});
		}
	});
</script>

<div class={classList}>
	<label for={id} class="font-semibold text-sm {insetLabel ? 'ms-2' : ''}">
		{label}
	</label>
	<div bind:this={container} class="sf_autocomplete mt-1 h-[42px] {autoselect ? 'autoselect' : ''}"></div>
</div>
