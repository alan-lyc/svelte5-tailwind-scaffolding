import type { ModalState, CustomModal, PredefinedModal, LoadingModal, LoadingStateImpl, LoadingState, ModalAction } from './modal.types.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const modals: ModalState<any>[] = $state([]);

/**
 * Display a modal and asynchronously wait for it to return
 * 
 * **Require `HTMLDialogElement`** (Baseline 2022)
 * 
 * ## Example
 * An honest cookies modal
 * ```svelte
 * <Button
 * 	class="block"
 * 	onclick={async () => {
 * 		const allow = await modal({
 * 			type: 'confirm',
 * 			title: 'Your Privacy Matters',
 * 			md: 'We use Cookies to track you and sell your data to 3rd party to make profit. Do you want to allow Cookies?',
 * 			actions: [
 * 				{
 * 					text: 'Necessary Cookies Only',
 * 					primary: false,
 * 					returns: false
 * 				},
 * 				{
 * 					text: 'Accept All',
 * 					primary: true,
 * 					returns: true
 * 				}
 * 			]
 * 		});
 * 		await modal({
 * 			type: allow ? 'ok' : 'error',
 * 			title: 'Your Options',
 * 			md: `You ${allow ? 'allowed' : "didn't allow"} us to use Cookies`,
 * 			actions: ["OK"]
 * 		});
 * 	}}
 * >
 * 	Cookies
 * </Button>
 * ```
 * A modal asking user to confirm download.
 * ```svelte
 * <Button
 * 	class="block"
 * 	onclick={async () => {
 * 		await modal({
 * 			type: 'confirm',
 * 			title: 'Are you sure?',
 * 			md: 'Do you want to download a very large file (1.07 GB)? Fee from your mobile carrier may apply.',
 * 			actions: [
 * 				'No',
 * 				{
 * 					text: 'Yes',
 * 					loadingScreenTitle: 'Downloading',
 * 					loadingScreenMode: 'determinate',
 * 					closeOnError: true,
 * 					returns: true,
 * 					possibleErrors: [AxiosError],
 * 					async onclick(states) {
 * 						states.step(0).of(1).completed();
 * 						const controller = new AbortController();
 * 						states.setCancelHandler(async () => controller.abort());
 * 						await axios.get('/testfile.org-1GB- Corrupt.zip', {
 * 							signal: controller.signal,
 * 							async onDownloadProgress(e) {
 * 								states.step(1).completed(e.progress ?? 0);
 * 								await states.setDescription(
 * 									`Downloading a very large file \n\nspeed: ${e.rate ? formatDownloadRate(e.rate) : 'unknown'}${e.estimated ? `, estimated ${formatDuration(e.estimated)} left` : ''}`
 * 								);
 * 							}
 * 						});
 * 					}
 * 				}
 * 			]
 * 		});
 * 	}}
 * >
 * 	Download (404)
 * </Button>
 * ```
 * ## Parameters
 * This function accept the parameter `modal`, a config representing the modal. It can either be
 * - a `PredefinedModal` that enforce a strict restriction on what you can do with the modal
 * ```ts
 * type PredefinedModal<T> = {
 *     type: 'error' | 'ok' | 'confirm' | 'warning';
 *     title: string;
 *     md: string;
 *     actions: (string | ({
 *         text: string;
 *         returns?: T | undefined;
 *         primary?: boolean | undefined;
 *         destructive?: boolean | undefined;
 *         closeOnError?: boolean | undefined;
 *         possibleErrors?: (new () => Error)[] | undefined;
 *         loadingScreenTitle?: string,
 *         loadingScreenMode?: "determinate" | "indeterminate",
 *         onclick?: (loadingState?: LoadingState) => boolean | void | Promise<boolean | void>
 *     }))[];
 * }
 * ```
 * - a `CustomModal` that provides more freedom on what you can do
 * ```ts
 * type CustomModal<T> = {
 *     type: 'custom';
 *     ui: Snippet<[(returns: T) => void]>;
 * }
 * ```
 * @returns the result of calling `resolve`
 */
export async function modal<T = undefined>(modal: CustomModal<T> | PredefinedModal<T>): Promise<T> {
	/**
	 * This should be safe.
	 * The typescript error essentially means that the actions could be assigned something that is `string | undefined`, but is not `T`.
	 * Alternatively, `__resolve` may be called with something that is `string | undefined`, but is not `T`.
	 * However, the modal (when operating correctly) should only ever return things that satisfies `T`
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	modals.push(modal as ModalState<any>);
	// mount()
	return new Promise((resolve, reject) => {
		modal.__resolve = (ret) => {
			resolve(ret);
			const t = modals.findIndex((v) => v === modal);
			if (t) modals.splice(t, 1);
		};
		modal.__reject = (reason) => {
			reject(reason);
			const t = modals.findIndex((v) => v === modal);
			if (t) modals.splice(t, 1);
		};
	});
}

// for some reason it tells me to use ES2015 module, when I am in fact, using ES2015 module?
// https://stackoverflow.com/questions/58270901/es2015-module-syntax-is-preferred-over-custom-typescript-modules-and-namespaces
// eslint-disable-next-line @typescript-eslint/no-namespace
export module modal {
	export class ModalBuilder<R = never> {
		constructor(public type: PredefinedModal<unknown>['type'], public __title: string = "", public __md: string = "", public __actions: ModalAction<R>[] = [], public __defaultReturn: R | undefined = undefined, public __preventEscape = false) {}
		title(text: string) { this.__title = text; return this; }
		content(md: string) { this.__md = md; return this }
		defaultReturn<T extends bigint>(returns: T): ActionBuilder_Start<R | T>;
		defaultReturn<T extends number>(returns: T): ActionBuilder_Start<R | T>;
		defaultReturn<T extends boolean>(returns: T): ActionBuilder_Start<R | T>;
		defaultReturn<T extends object>(returns: T): ActionBuilder_Start<R | T>;
		defaultReturn<T extends string>(returns: T): ActionBuilder_Start<R | T>;
		defaultReturn<T>(returns: T): ActionBuilder_Start<R | T>;
		defaultReturn(returns: R) { this.__defaultReturn = returns; return new ActionBuilder_Start<R>(this) }
		preventEscape() { this.__preventEscape = true; return new ActionBuilder_Start<R>(this) }
	}
	export class ActionBuilder_Start<R> {
		constructor(public __parent: ModalBuilder<R>) {}
		action(text: string): ActionBuilder<R | undefined>;
		action<T extends bigint>(text: string, returns: T): ActionBuilder<R | T>;
		action<T extends number>(text: string, returns: T): ActionBuilder<R | T>;
		action<T extends boolean>(text: string, returns: T): ActionBuilder<R | T>;
		action<T extends object>(text: string, returns: T): ActionBuilder<R | T>;
		action<T extends string>(text: string, returns: T): ActionBuilder<R | T>;
		action<T>(text: string, returns: T): ActionBuilder_Start<R | T>;
		action(text: string, returns: R): ActionBuilder<R>;
		action(text: string, returns?: R) {
			const a = {
				text,
				returns
			}
			this.__parent.__actions.push(a)
			return new ActionBuilder<R>(this.__parent, a);
		}
		async show(): Promise<R> {
			if (this.__parent.__preventEscape) {
				return await modal({
					type: this.__parent.type,
					md: this.__parent.__md,
					title: this.__parent.__title,
					actions: this.__parent.__actions,
					defaultReturn: undefined,
					preventEscape: true,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				}) as any;
			} else {
				return await modal({
					type: this.__parent.type,
					md: this.__parent.__md,
					title: this.__parent.__title,
					actions: this.__parent.__actions,
					defaultReturn: this.__parent.__defaultReturn,
					preventEscape: false,
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				}) as any;
			}
		}
	}
	export class ActionBuilder<R> extends ActionBuilder_Start<R> {
		constructor(public __parent: ModalBuilder<R>, private __action: ModalAction<R>) { super(__parent) }
		primary(defaultsToTrue?: boolean) { this.__action.primary = defaultsToTrue ?? true; return this; }
		destructive(defaultsToTrue?: boolean) { this.__action.destructive = defaultsToTrue ?? true; return this; }
		onclick(handler: () => boolean | void | Promise<boolean | void>): ActionBuilder_Handler<R> {
			if ("loadingScreenMode" in this.__action) throw new Error(`unexpected "loadingScreenMode" in this._action`)
			this.__action.onclick = handler;
			return new ActionBuilder_Handler(this.__parent, this.__action)
		}
		/**
		 * Specify that a loading screen should be shown when this action is invoked. You will provide
		 * 
		 * @returns a builder for you to provide possible error handling mechanics, or add another action.
		 */
		withDeterminateLoadingScreen(onclick: (states: LoadingState) => Promise<boolean | void>) {
			// we have two choices:
			// 1. use any (bad)
			// 2. i)   remove this._action from this.parent.actions
			//    ii)  swap this._action with a new one
			//    iii) push the new action into this.parent.actions (worse)
			//
			// therefore...
			//
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(this.__action as any).loadingScreenMode = "determinate"
			this.__action.onclick = onclick;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return new ActionBuilder_Handler(this.__parent, this.__action as any)
		}
		/**
		 * Specify that a loading screen should be shown when this action is invoked. You will provide
		 * 
		 * @returns a builder for you to provide possible error handling mechanics, or add another action.
		 */
		withIndeterminateLoadingScreen(onclick: (states: Omit<LoadingState, 'step' | 'setNumberOfSteps'>) => Promise<boolean | void>) {
			// we have two choices:
			// 1. use any (bad)
			// 2. i)   remove this._action from this.parent.actions
			//    ii)  swap this._action with a new one
			//    iii) push the new action into this.parent.actions (worse)
			//
			// therefore...
			//
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(this.__action as any).loadingScreenMode = "indeterminate"
			this.__action.onclick = onclick;
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			return new ActionBuilder_Handler(this.__parent, this.__action as any)
		}
	}
	export class ActionBuilder_Handler<R> extends ActionBuilder_Start<R> {
		constructor(public __parent: ModalBuilder<R>, public __action: Omit<ModalAction<R>, "onclick" | "loadingScreenTitle" | "loadingScreenMode"> & { onclick?: (arg?: unknown) => boolean | void | Promise<boolean | void> }) { super(__parent) }
		/**
		 * If the handler throws an error, ***transform*** the error and return it.
		 * If you do not wish to handle the error, return nothing.
		 * **If you do not wish to display an error to the user, return `null`.**
		 * 
		 * ## Example
		 * This `catch` handler ignores *all* error without displaying *any* error message (and the user won't know anything is wrong)
		 * ```ts
		 * await modal.builder("confirm")
		 * 	// ... other config
		 * 	// ignore all error
		 * 	.catch((_) => null)
		 * ```
		 * The following `catch` handler marks `CanceledError` as handled, so the user will know that the request has been cancelled.
		 * ```ts
		 * await modal.builder("confirm")
		 * 	// ... other config
		 * 	// marks `CanceledError` as handled
		 * 	.catch((e) => {
		 * 		if (e instanceof CanceledError) return markErrorAsHandled(e);
		 * 	})
		 * ```
		 */
		catch(rethrow: (e: unknown) => unknown | Promise<unknown>) {
			const fn = this.__action.onclick;
			this.__action.onclick = async (arg?: unknown) => {
				try {
					return await fn?.(arg)
				} catch (e) {
					const transformed = await rethrow(e);
					if (transformed !== null) throw transformed ?? e;
				}
			}
			return this as ActionBuilder_Start<R>;
		}
		/**
		 * Specify a list of `constructor`s, the instances of each represents an error that can be safely ignored.
		 *
		 * For example, if you expect your `onclick` handler to throw an `AxiosError`, which can be safely ignored without any cleanup, you can add `AxiosError` to this array.
		 * **An error will still be thrown, and an error message will still be shown to the user**, but it won't be an *unhandled* error.
		 */
		possibleErrors(...errors: { new(): Error }[]) {
			this.__action.possibleErrors = errors;
			return this;
		}
		closeOnError(defaultsToTrue?: boolean) { this.__action.closeOnError = defaultsToTrue ?? true; return this; }
	}

	/**
	 * A potentially more user-friendly way to create a modal
	 * 
	 * **Require `HTMLDialogElement`** (Baseline 2022)
	 * 
	 * **Note:** don't pass `$state`s to this builder. They won't work.
	 * @param type `"ok" | "warning" | "error" | "confirm"`
	 * @returns a builder
	 */
	export function builder<R = never>(type: PredefinedModal<unknown>['type']): ModalBuilder<R> {
		return new ModalBuilder<R>(type)
	}
}

/**
 * Perform an asynchronous task, blocking any user interaction with a top-layer loading modal while during so.
 *
 * **Require `HTMLDialogElement`** (Baseline 2022)
 * 
 * The block returns and the modal disappears when, and only when:
 * - the task returns
 * - the task throws
 * - the task is cancelled
 *
 * ## Example
 * ```ts
 * await block({
 *     type: "loading",
 *     mode: "determinate",
 *     title: "Downloading",
 *     async task(states) {
 *         states.setNumberOfSteps(1);
 *         const controller = new AbortController();
 *         states.setCancelHandler(() => controller.abort());
 *         await axios.get("/a-very-large-file", {
 *             signal: controller.signal
 *             onDownloadProgress(e) {
 *                 states.step(1).completed(e.progress ?? 0)
 *                 states.setDescription(`Downloading a very large file (speed: ${bytes * 8 / 1024} Kbps, estimated ${e.estimated}s left)`)
 *             }
 *         })
 *     }
 * })
 * ```
 */
export async function block<T>(config: LoadingModal<T>): Promise<T> {
	// so. how does this work?
	//
	// we receive a config from the user, describing some *constants* that will not be changed throughout the blocking task
	//
	const states: LoadingStateImpl & LoadingState = $state({
		...config,
		title: "Loading",
		logs: [] as string[],
		text: undefined as string | undefined,
		animateClose: undefined,
		cancel: undefined as (() => Promise<void> | void) | undefined,
		log(str) {
			this.logs.push(str);
		},
		clearLog() {
			this.logs = [];
		},
		setTitle(title) {
			this.title = title;
		},
		async setDescription(markdown) {
			const [marked, { default: DOMPurify }] = await Promise.all([
				import('marked'),
				import('dompurify')
			]);
			const t = this.mode === "determinate" ? `(${Math.ceil(this.progress.completedSteps + this.progress.completedPortion)}/${this.totalSteps}) ` : "";
			this.text = DOMPurify.sanitize(
				await marked.parse(
					t.concat(markdown)
				)
			);
		},
		setCancelHandler(handler) {
			this.cancel = handler;
		},
		removeCancelHandler() {
			this.cancel = undefined;
		},
		get localization() {
			return {
				activityIndicatorText: (text: string) => {
					this.localizationImpl.activityIndicatorText = text;
				},
				logsLable: (text: string) => {
					this.localizationImpl.logsLabel = text;
				},
			}
		},
		localizationImpl: {
			activityIndicatorText: 'This may take a while',
			logsLabel: 'Logs:'
		},
		progress: {
			completedSteps: 0,
			completedPortion: 0
		},
		totalSteps: 0,
		setNumberOfSteps(total) {
			this.totalSteps = total;
		},
		step(n) {
			this.progress.completedSteps = n;
			const completed = (progress?: number) => {
				/**
				 * step(0).of(2).completed();    // nothing is done
				 *                               // [________________]
				 * step(1).of(2).completed(.5);  // step 1 is 50% completed
				 *                               // [****____________]
				 *                               //
				 * step(1).of(2).completed();    // step 2 is 0% completed;
				 *                               // [********________]
				 * step(2).of(2).completed();    // step 2 is 100% completed;
				 *                               // [****************]
				 */
				if (progress === undefined || progress === 1) {
					this.progress.completedPortion = 0;
				} else {
					this.progress.completedSteps = n - 1;
					this.progress.completedPortion = progress;
				}
			};
			return {
				of: (total) => {
					this.totalSteps = total;
					return {
						completed
					};
				},
				completed
			};
		}
	});
	modals.push(states);
	try {
		const result = await config.task(states);
		return result;
	} finally {
		await states.animateClose?.();
		const t = modals.findIndex((v) => v === states);
		if (t !== undefined) modals.splice(t, 1);
	}
}