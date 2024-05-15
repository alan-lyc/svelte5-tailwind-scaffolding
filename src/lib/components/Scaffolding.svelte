<!--
	@component
	A component for displaying modals and automatically displaying error message.

	### How are error displayed?
	- If the error is not thrown with `markErrorAsHandled`:
	- &nbsp;&nbsp;&nbsp;&nbsp;It is an unhandled error.
	- &nbsp;&nbsp;&nbsp;&nbsp;The render the error message. If a stack trace is available, it is also displayed.
	- Otherwise, if the error `instanceof Response`:
	- &nbsp;&nbsp;&nbsp;&nbsp;If `const body = await response.json()` succeed:
	- &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;It renders `body`, `body.message`, or `body.error.message`.
	- &nbsp;&nbsp;&nbsp;&nbsp;Otherwise, if `const body = await response.text()` succeed:
	- &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;If the response is a `text/html`:
	- &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;It is sanitized.
	- &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Any `<h1>` is replaced with `<h2>`.
	- &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The `innerHTML` of the sanitized body element is interpolated as the message.
	- &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Otherwise:
	- &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The response is interpolated as the message.
	- &nbsp;&nbsp;&nbsp;&nbsp;Otherwise:
	- &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;The error message is replaced with `Error: Unknown Error`.
	- Otherwise:
	- &nbsp;&nbsp;&nbsp;&nbsp;Only the error message will be displayed.

	### How is the error message *rendered*?
	- it is interpolated, as a markdown text, inside a blockquote (`> ...`)
	- the resulting markdown is rendered and sanitized
-->
<script lang="ts">
	import { modal, modals } from '$lib/modal.svelte';
	import Modal from '$lib/components/Modal.svelte';
	import '../common.css';
	import { ManagedError } from '$lib/util.js';
	import { onMount } from 'svelte';
	import dedent from 'dedent';
	import { getReasonPhrase } from 'http-status-codes';
	import _ from 'lodash';

	function transform(e: unknown): string {
		try {
			if (typeof e === 'string') {
				return dedent(e.replace(/\n+$/, '')).replaceAll("\n", "\n>");
			} else if (e instanceof Error) {
				return e.toString();
			} else if (
				typeof e === 'object' &&
				e &&
				'message' in e &&
				typeof e.message === 'string'
			) {
				return dedent(e.message.replace(/\n+$/, '')).replaceAll("\n", "\n>");
			} else if (
				typeof e === 'object' &&
				e &&
				'error' in e &&
				typeof e.error === 'object' &&
				e.error && 
				'message' in e.error &&
				typeof e.error.message === 'string'
			) {
				return dedent(e.error.message.replace(/\n+$/, '')).replaceAll("\n", "\n>");
			} else {
				return '```\n>' + `${JSON.stringify(e, null, 2)}`.replace(/\n+$/, '').replaceAll("\n", "\n> ") + "\n>```";
			}
		} catch {
			return unknownErrorMessage
		}
	}

	async function handler(error: unknown, promise: boolean) {
		try {
			let title = promise ? unhandledRejectionTitle : unhandledErrorTitle;
			let stack = '';
			let message = '';
			let userMessage = unhandledErrorMessage;
			if (error instanceof Response) {
				title = unsuccessfulNetworkRequestTitle;
				userMessage = unsuccessfulNetworkRequestDescription(error.status);
				try {
					const clone = error.clone();
					try {
						const json = await error.json();
						message = transform(json)
					} catch {
						const text = await clone.text();
						const type = clone.headers.get("Content-Type")?.toLowerCase();
						if (type === "text/html" || type === "text/xml" || type === "application/xhtml+xml" || type === "application/xml" || type === "image/svg+xml") {
							const { default: DOMPurifier } = await import('dompurify');
							const html = DOMPurifier.sanitize(text, { RETURN_DOM: true })
							const e = [...html.querySelectorAll("h1")]
							e.forEach(e => {
								const h2 = document.createElement("h2");
								h2.innerHTML = e.innerHTML;
								e.replaceWith(h2)
							});
							message = dedent(html.innerHTML.replace(/\n+$/, '')).replaceAll("\n", "\n> ");
						} else {
							message = dedent(text.replace(/\n+$/, '')).replaceAll("\n", "\n> ");
						}
					}
				} catch (e) {
					console.warn(e);
					message = unknownErrorMessage;
				}
			} else if (error instanceof ManagedError) {
				const e = error.error;
				title = handledErrorTitle;
				userMessage = handledErrorMessage;
				message = transform(e)
			} else if (error instanceof Error) {
				if (error instanceof Error && error.stack) {
					const e = error.toString();
					const s = error.stack;
					const t = s.startsWith(e) ? s.slice(e.length) : s
					stack = `\n\n${stackTraceLabel}\n\n\`\`\`\n${dedent(t)}\n\n\`\`\`\n\n`;
				}
				message = error.toString();
			} else {
				message = transform(error);
			}
			await modal({
				type: 'error',
				title,
				md: `${userMessage}\n<div class="markdown-align-initial">\n\n> ${message}${stack} \n\n</div>`,
				actions: ["OK"],
				defaultReturn: undefined,
			});
		} catch (e) {
			console.error(e);
		}
	}

	onMount(() => {
		window.onerror = async (e, s, l, c, err) => {
			await onerror?.(e, s, l, c, err);
			await handler(err, false);
		}
		document.body.addEventListener("scroll", (e) => {
			console.log("hi")
		})
	})

	let {
		'localization-handled-error-title': handledErrorTitle = 'An Error Occurred',
		'localization-handled-error-description': handledErrorMessage = 'An error occurred with the following message:',
		'localization-unhandled-error-title': unhandledErrorTitle = 'Unhandled Error',
		'localization-unhandled-promise-rejection-title': unhandledRejectionTitle = 'Unhandled Promise Rejection',
		'localization-unhandled-error-description': unhandledErrorMessage = 'An error occurred, but it was not properly handled. If the site becomes unstable, please try refreshing the page.',
		'localization-stack-trace-label': stackTraceLabel = 'Stack Trace:',
		'localization-network-request-unsuccessful-title': unsuccessfulNetworkRequestTitle = 'Unsuccessful Network Request',
		'localization-unknown-error-message': unknownErrorMessage = 'Error: Unknown Error',
		'localization-network-request-unsuccessful-description': unsuccessfulNetworkRequestDescription = (status) => {
			try {
				if (status >= 400) {
					return `A network request failed, and the Status Code \`${status} ${getReasonPhrase(status)}\` was received.`
				} else {
					return `The server responded with an error.`
				}
			} catch {
				return `A network request failed, and the Status Code \`${status}\` was received.`
			}
		},
		onerror,
	}: {
		/**
		 * default: `'An Error Occurred'`
		 */
		'localization-handled-error-title'?: string,
		/**
		 * default: `'An error occurred with the following message:'`
		 */
		'localization-handled-error-description'?: string,
		/**
		 * default: `'Unhandled Error'`
		 */
		'localization-unhandled-error-title'?: string,
		/**
		 * default: `'Unhandled Promise Rejection'`
		 */
		'localization-unhandled-promise-rejection-title'?: string,
		/**
		 * default: `'Stack Trace:'`
		 */
		'localization-stack-trace-label'?: string,
		/**
		 * default: `'An error occurred, but it was not properly handled. If the site becomes unstable, please try refreshing the page.'`
		 */
		'localization-unhandled-error-description'?: string;
		/**
		 * default: `'Unsuccessful Network Request'`
		 */
		'localization-network-request-unsuccessful-title'?: string;
		/**
		 * default: `'Error: Unknown Error'`
		 */
		'localization-unknown-error-message'?: string;
		/**
		 * default:
		 * ```ts
		 * (status: number) => {
		 * 	try {
		 * 		if (status >= 400) {
		 * 			return `A network request failed, and the Status Code ${status} (${getReasonPhrase(status)}) was received.`
		 * 		} else {
		 * 			console.warn("A response with the status", status, "was thrown")
		 * 			return `The server responded with an error.`
		 * 		}
		 * 	} catch {
		 * 		return `A network request failed, and the Status Code ${status} was received.`
		 * 	}
		 * }
		 * ```
		 */
		'localization-network-request-unsuccessful-description'?: (status: number) => string;
		onerror?: (event: string | Event, source?: string, line?: number, column?: number, error?: unknown) => any;
	} = $props();
</script>

<svelte:window
	onunhandledrejection={async (e) => {
		await handler(e.reason, true);
	}}
/>

{#each modals as modal}
	<Modal {modal} />
{/each}
