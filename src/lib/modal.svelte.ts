import type { Snippet } from 'svelte';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const modals: ModalState<any>[] = $state([]);

export type ModalState<T> = PredefinedModal<T> | CustomModal<T> | LoadingStateImpl;

export type ModalAction<T> = {
	text: string;
	returns?: T;
	primary?: boolean;
	destructive?: boolean;
	closeOnError?: boolean;
	/**
	 * A list of `constructor`s, the instances of each represents an error that can be safely ignored.
	 *
	 * For example, if you expect your `onclick` handler to throw an `AxiosError`, which can be safely ignored without any cleanup, you can add `AxiosError` to this array.
	 * **An error message will still be shown to the user**, but it won't be an *unhandled* error.
	 */
	possibleErrors?: { new (): Error }[];
} & (
	| {
			loadingScreenMode: 'determinate';
			onclick: (loadingStates: LoadingState) => boolean | void | Promise<boolean | void>;
	  }
	| {
			loadingScreenMode: 'indeterminate';
			onclick: (
				loadingStates: Omit<LoadingState, 'step' | 'setNumberOfSteps'>
			) => boolean | void | Promise<boolean | void>;
	  }
	| {
			onclick?: () => boolean | void | Promise<boolean | void>;
	  }
)

export type PredefinedModal<T> = {
	type: 'error' | 'ok' | 'confirm' | 'warning';
	/**
	 * As its name implies
	 *
	 * ## Visualization
	 * ```txt
	 * *---------------------------------*
	 * | Title                           | <-- this
	 * |---------------------------------|
	 * | Lorem Ipsum                     |
	 * | ...                             |
	 * |---------------------------------|
	 * |               [ Cancel ] [ OK ] |
	 * *---------------------------------*
	 * ```
	 */
	title: string;
	/**
	 * A markdown representing the contents of the modal
	 *
	 * ## Visualization
	 * ```txt
	 * *---------------------------------*
	 * | Title                           |
	 * |---------------------------------|
	 * | ## Lorem Ipsum                  | <-- this
	 * | 1. ...                          | <
	 * | 2. ...                          | <
	 * | > A wise man once said .        | <
	 * |---------------------------------|
	 * |               [ Cancel ] [ OK ] |
	 * *---------------------------------*
	 * ```
	 */
	md: string;
	/**
	 * The action list
	 *
	 * ## Example
	 * To create the following,
	 * ```txt
	 * *---------------------------------*
	 * | Title                           |
	 * |---------------------------------|
	 * | Lorem Ipsum                     |
	 * | ...                             |
	 * |---------------------------------|
	 * |    [ Verify ] [ Cancel ] [ OK ] | <-- this
	 * *----- △ -------- △ -------- △ ---*
	 *        |          |          |
	 *        |          |          on click, returns undefined
	 *        |          on click, modal returns "cancel" and console.log("cancelled")
	 *        on click, does not return but do some verification
	 * ```
	 * you can use this action
	 * ```ts
	 * const verify = {
	 *     text: "Verify",
	 *     handler() {
	 *         //
	 *         // some verification ...
	 *         //
	 *         return false; // so the modal don't return
	 *     }
	 * }
	 * const cancel = {
	 *     text: "Cancel",
	 *     returns: "cancel",
	 *     handler() {
	 *         console.log("cancelled")
	 *     }
	 * }
	 * const ok = "OK"
	 * modal({
	 *     actions: [verify, cancel, ok]
	 *     // other config ...
	 * })
	 * ```
	 */
	actions: Exclude<(ModalAction<T> | string)[], []>;
	__resolve?: (ret: T) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	__reject?: (reason?: any) => void;
};
export type CustomModal<T> = {
	type: 'custom';
	/**
	 * Your UI `snippet`.
	 *
	 * ## The recommended way.
	 * The recommended way to build a `CustomModal` is by using `BaseModal`
	 * It automatically manage whether the modal is displayed, and provides a way to animate showing / hiding the modal.
	 *
	 * **WARNING: if you use `BaseModal`, you *must* call `animateClose` before `resolve` for animation to work**
	 * ```svelte
	 * {#snippet customModal(resolve: (returns: "yes" | "no") => void)}
	 * <BaseModal let:animateClose duration={200}>
	 *     Accept cookies?
	 * 	<div style="margin-top: .5rem;">
	 * 		<button onclick={() => animateClose().then(() => resolve("yes")) }>
	 * 			Accept All
	 * 		</button>
	 * 		<button onclick={() => animateClose().then(() => resolve("no")) }>
	 * 			Necessary Cookies Only
	 * 		</button>
	 * 	</div>
	 * </BaseModal>
	 * {/snippet}
	 * ```
	 */
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	ui: Snippet<[(returns: T) => void, (reject?: any) => void]>;
	__resolve?: (ret: T) => void;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	__reject?: (reason?: any) => void;
	// animateClose: () => Promise<void>,
};

/**
 * Create a modal procedurally
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
export async function modal<T>(modal: CustomModal<T> | PredefinedModal<T>): Promise<T> {
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

export type LoadingState = {
	step: (n: number) => {
		of: (total: number) => {
			completed: (progress?: number) => void;
		};
		completed: (progress?: number) => void;
	};
	log(str: string): void;
	clearLog(): void;
	setTitle: (title: string) => void;
	setNumberOfSteps: (total: number) => void;
	/**
	 * *Asynchronously* parse a markdown-formatted text to html, sanitize it, and render it directly as the description.
	 * @param markdown a markdown description of the currently executing step
	 */
	setDescription: (txt: string) => Promise<void>;
	setCancelHandler: (handler: () => Promise<void>) => void;
	removeCancelHandler: (handler: () => Promise<void>) => void;
};
export type LoadingStateImpl = Omit<LoadingModal<unknown>, 'task'> & {
	progress: { completedSteps: number; completedPortion: number };
	totalSteps: number;
	logs: string[];
	text?: string;
	title: string;
	cancel?: () => Promise<void>;
	animateClose?: () => Promise<void>;
};
export type LoadingModal<T> = {
	type: 'loading';
} & (
	| {
			/**
			 * If `mode` is set to `indeterminate`, no progress bar will be shown.
			 * Otherwise, a progress bar will be shown just below the title.
			 *
			 * ## Difference with `setNumberOfSteps(0)`
			 * There are two ways to tell users that there is no concrete progress (i.e. percentage) to be shown - by setting `mode` to `indeterminate` or by doing `setNumberOfSteps(0)`.
			 * However, if you set `mode` to `indeterminate`, you tell the user there will *never* be percentage progress. On the other hand, if you do `setNumberOfSteps(0)`, it means that
			 * there will *eventually* be percentage progress, but the app just need to do some preparation first.
			 */
			mode: 'determinate';
			task: (states: LoadingState) => T | Promise<T>;
	  }
	| {
			/**
			 * If `mode` is set to `indeterminate`, no progress bar will be shown.
			 * Otherwise, a progress bar will be shown just below the title.
			 *
			 * ## Difference with `setNumberOfSteps(0)`
			 * There are two ways to tell users that there is no concrete progress (i.e. percentage) to be shown - by setting `mode` to `indeterminate` or by doing `setNumberOfSteps(0)`.
			 * However, if you set `mode` to `indeterminate`, you tell the user there will *never* be percentage progress. On the other hand, if you do `setNumberOfSteps(0)`, it means that
			 * there will *eventually* be percentage progress, but the app just need to do some preparation first.
			 */
			mode: 'indeterminate';
			task: (states: Omit<LoadingState, 'step' | 'setNumberOfSteps'>) => T | Promise<T>;
	  }
);
/**
 * Perform an asynchronous task, blocking any user interaction with a top-layer loading modal while during so.
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
		cancel: undefined as (() => Promise<void>) | undefined,
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

// eslint-disable-next-line @typescript-eslint/no-namespace
export module modal {
	export class ModalBuilder<R> {
		constructor(public type: PredefinedModal<unknown>['type'], public __title: string = "", public __md: string = "", public __actions: ModalAction<R>[] = []) {}
		title(text: string) { this.__title = text; return this; }
		content(md: string) { this.__md = md; return new ActionBuilder_Start<R>(this) }
	}
	export class ActionBuilder_Start<R> {
		constructor(public __parent: ModalBuilder<R>) {}
		action(text: string): ActionBuilder<R | undefined>;
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
			return await modal({
				type: this.__parent.type,
				md: this.__parent.__md,
				title: this.__parent.__title,
				actions: this.__parent.__actions,
			})
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
		 * **An error message will still be shown to the user**, but it won't be an *unhandled* error.
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
	 * **Note:** don't pass `$state`s to this builder. They won't work.
	 * @param type `"ok" | "warning" | "error" | "confirm"`
	 * @returns a builder
	 */
	export function builder<R>(type: PredefinedModal<unknown>['type']): ModalBuilder<R> {
		return new ModalBuilder<R>(type)
	}
}