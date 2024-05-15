<!--
	@component
	an autocomplete component powered by [alphagov/accessible-autocomplete](https://github.com/alphagov/accessible-autocomplete?tab=readme-ov-file), suitable for form inputs
-->
<script lang="ts">
	import { onMount } from 'svelte';
	import './autocomplete.css';
	import _ from 'lodash';

	let {
		id,
		label,
		class: classList,
		'inset-label': insetLabel,
		source,
		onchange,
		autoselect,
		'without-normalization': withoutNormalization,
		onconfirm,
		'localization-no-results': tNoResults = 'No results found',
		'localization-status-query-too-short': tStatusQueryTooShort,
		'localization-status-no-results': tStatusNoResults = 'No search results',
		'localization-status-selected-option': tStatusSelectedOption,
		'localization-status-results': tStatusResults,
		'localization-assistive-hint': tAssistiveHint = 'When autocomplete results are available use up and down arrows to review and enter to select.  Touch device users, explore by touch or with swipe gestures.',
		'show-all-values': showAllValues,
		'show-no-options-found': showNoOptionsFound,
		'menu-attributes': menuAttributes,
		'min-length': minLength,
		'confirm-on-blur': confirmOnBlur,
		'default-value': defaultValue,
		...rest
	}: Omit<
		Parameters<(typeof import('accessible-autocomplete'))['default']>[0],
		| 'inputClasses'
		| 'hintClasses'
		| 'cssNamespace'
		| 'menuClasses'
		| 'element'
		| 'dropdownArrow'
		| 'source'
		| 'autoselect'
		| 'onConfirm'
		| 'tNoResults' 
		| 'tStatusQueryTooShort' 
		| 'tStatusNoResults' 
		| 'tStatusSelectedOption' 
		| 'tStatusResults' 
		| 'tAssistiveHint'
		| 'showAllValues'
		| 'showNoOptionsFound'
		| 'menuAttributes'
		| 'minLength'
		| 'confirmOnBlur'
		| 'defaultValue'
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
		'inset-label'?: boolean;
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
		'without-normalization'?: boolean;
		/**
		 * a function to be executed *before* the updating the autocomplete suggestions
		 */
		onchange?: (query: string) => void | Promise<void>;
		/**
		 * If set, the first suggestion is selected automatically.
		 * 
		 * **Require CSS `:has()` selector (Baseline 2023)**
		 * 
		 * ### Note
		 * On mobile, this may not work (because if it worked, it would be impossible to *not* select the first option).
		 */
		autoselect?: boolean;
		onconfirm?: () => void;
		'localization-no-results'?: string,
		'localization-status-query-too-short'?: (minQueryLength: number) => string,
		'localization-status-no-results'?: string,
		'localization-status-selected-option'?: (selectedOption: string, length: number, index: number) => string,
		'localization-status-results'?: (numberOfAvailableOptions: number, contentSelectedOption: string) => string,
		'localization-assistive-hint'?: string,
		'show-all-values'?: boolean,
		'show-no-options-found'?: boolean,
		'menu-attributes'?: string,
		'min-length'?: number,
		'confirm-on-blur'?: boolean,
		'default-value'?: string,
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
				tNoResults: () => tNoResults,
				tStatusQueryTooShort,
				tStatusNoResults: () => tStatusNoResults,
				tStatusSelectedOption,
				tStatusResults,
				tAssistiveHint: () => tAssistiveHint,
				showAllValues,
				showNoOptionsFound,
				menuAttributes,
				minLength,
				confirmOnBlur,
				defaultValue,
				...rest
			});
		}
	});

	// $effect(() => {
	// 	if (container) {
	// 		const elements: {
	// 			input: HTMLInputElement | null,
	// 			menu: HTMLUListElement | undefined,
	// 		} = {
	// 			input: null,
	// 			menu: undefined,
	// 		}
	// 		document.body.addEventListener("click", (event) => {
	// 			if (container) {
	// 				elements.input = container.getElementsByTagName("input").namedItem(id);
	// 				elements.menu = [...container.getElementsByTagName("ul")].find(e => e.classList.contains("autocomplete__menu--visible"));
	// 				if (elements.input && elements.menu) {
	// 					if (event.target instanceof Node && !container?.contains(event.target)) {
	// 				console.log("here")
	// 						elements.input?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
	// 					}
	// 				}
	// 			}
	// 		})
	// 	}
	// })
</script>

<div class={classList}>
	<label for={id} class="font-semibold text-sm {insetLabel ? 'ms-2' : ''}">
		{label}
	</label>
	<div
		bind:this={container}
		class="sf_autocomplete mt-1 h-[42px] {autoselect ? 'autoselect' : ''}"
	></div>
</div>
