<!--
	@component
	an `<input>` component, styled for text input
	
-->
<script lang="ts">
	import { untrack } from "svelte";
	import type { HTMLInputAttributes } from 'svelte/elements';

	let {
		value = $bindable(),
		type: _type = 'text',
		placeholder,
		class: classList = "",
		name,
		id,
		validate = () => {},
		...rest
	}: {
		value: string;
		/**
		 * a constant, unchanging string representing the type of this input box
		 */
		type?: 'text' | 'password' | 'url' | 'email';
		placeholder?: string;
		name?: string;
		class?: string;
		id?: string;
		/**
		 * check whether or not the entered value is valid
		 * @param str the current input value
		 * @returns If the value is *invalid*, return an error message (can be an empty string `""`). Otherwise, return nothing.
		 */
		validate?: (str: string) => string | void | undefined;
	} & HTMLInputAttributes = $props();

	let input: HTMLInputElement | undefined = $state(undefined);
	$effect(() => {
		if (value && input) {
			const validity = validate(value);
			if (validity) {
				input.setCustomValidity(validity)
			} else if (validity === "") {
				input.setCustomValidity("Please enter a valid value")
			} else {
				input.setCustomValidity("");
			}
		}
	})
	const type = $state.snapshot(_type);
</script>

<input
	{id}
	{type}
	bind:value
	bind:this={input}
	{placeholder}
	{name}
	{...rest}
	class="font-normal sm:text-lg block rounded-md border-0 dark:border dark:border-gray-500 dark:border-solid dark:bg-gray-700 py-1.5 text-gray-900 dark:text-white shadow-sm ring-1 dark:ring-0 ring-inset ring-gray-300 placeholder:text-gray-400 placeholder:dark:text-gray-300 focus:ring-2 focus:dark:ring-2 focus:ring-inset focus:ring-indigo-600 focus:invalid:ring-indigo-600 invalid:dark:ring-2 invalid:ring-red-600 px-3 {classList}"
/>
