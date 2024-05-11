declare module "accessible-autocomplete" {
	declare function accessibleAutocomplete(config: {
		element: HTMLElement,
		id: string,
		source: string[] | ((query: string, populateResults: (results: string[]) => void) => void),
		inputClasses?: string,
		hintClasses?: string,
		menuAttributes?: string,
		menuClasses?: string,
		autoselect?: boolean,
		confirmOnBlur?: boolean,
		cssNamespace?: string,
		defaultValue?: string,
		displayMenu?: 'inline' | 'overlay',
		minLength?: number,
		name?: string,
		onConfirm?: () => void,
		required?: boolean,
		showAllValues?: boolean,
		showNoOptionsFound?: boolean,
		templates?: {
			inputValue: (currentlySelectedSuggestion: string) => string,
			suggestion: (suggestionToBeDisplayed: string) => string,
		},
		dropdownArrow?: (arg: { className: string }) => string,
		tNoResults?: () => string,
		tStatusQueryTooShort?: (minQueryLength: number) => string,
		tStatusNoResults?: () => string,
		tStatusSelectedOption?: (selectedOption: string, length: number, index: number) => string,
		tStatusResults?: (numberOfAvailableOptions: number, contentSelectedOption: string) => string,
		tAssistiveHint?: () => string,
	});
	declare module accessibleAutocomplete {
		export function enhanceSelectElement(config: {
			defaultValue?: string,
			selectElement: HTMLSelectElement,
		} & Omit<Parameters<typeof accessibleAutocomplete>[0], "element" | "id" | "source">): void;
	}
	export default accessibleAutocomplete;
};