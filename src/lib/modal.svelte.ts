import type { Snippet } from 'svelte';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const modals: ModalState<any>[] = $state([]);

export type ModalState<T> = PredefinedModal<T> | CustomModal<T> | LoadingStateImpl;

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
	actions: Exclude<
		(
			| ({
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
							loadingScreenTitle: string;
							loadingScreenMode: 'determinate';
							onclick: (loadingStates: LoadingState) => boolean | void | Promise<boolean | void>;
					  }
					| {
							loadingScreenTitle: string;
							loadingScreenMode: 'indeterminate';
							onclick: (
								loadingStates: Omit<LoadingState, 'step' | 'setNumberOfSteps'>
							) => boolean | void | Promise<boolean | void>;
					  }
					| {
							onclick?: () => boolean | void | Promise<boolean | void>;
					  }
			  ))
			| string
		)[],
		[]
	>;
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
	cancel?: () => Promise<void>;
	animateClose?: () => Promise<void>;
};
export type LoadingModal<T> = {
	type: 'loading';
	title: string;
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
		async setDescription(markdown) {
			const [marked, { default: DOMPurify }] = await Promise.all([
				import('marked'),
				import('dompurify')
			]);
			this.text = DOMPurify.sanitize(
				await marked.parse(
					`(${Math.ceil(this.progress.completedSteps + this.progress.completedPortion)}/${this.totalSteps}) ${markdown}`
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
