import type { Snippet } from "svelte";

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
} & ({
	/**
	 * the default value to return if the user press `ESC`
	 */
	defaultReturn: T
	preventEscape?: false
} | {
	defaultReturn?: undefined
	/**
	 * if the user press `ESC`, do `e.preventDefault()` to prevent the dialog from closing
	 * 
	 * **Warning:** there was a bug in Chrome where `e.preventDefault()` occasionally does not work on `cancel` event (which is ired when `Esc` is pressed). Prepare to handle `undefined` in case `e.preventDefault()` does not work.
	 */
	preventEscape: true
});
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


export type LoadingState = {
	/**
	 * Update the progress of the task.
	 * ### Example
	 * ```ts
	 * (states: LoadingState) => {
	 * 	step(1).of(1).completed(.1); // step 1 completed 10%
	 * 	step(1).of(1).completed();   // step 1 completed
	 * }
	 * ```
	 */
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
	setCancelHandler: (handler: () => Promise<void> | void) => void;
	removeCancelHandler: (handler: () => Promise<void>) => void;
	localization: {
		logsLable: (text: string) => void;
		/**
		 * Set the textual activity indicator. You can update call it once in a while to let the user know the app is not frozen.
		 * 
		 * ### Example
		 * ```ts
		 * (states: LoadingState) => {
		 * 	let n = 0;
		 * 	const info = [
		 * 		"Did you know you can do this hack?",
		 * 		"We are working hard, please wait a while...",
		 * 		"Limited Time Offer! Save 10% for all purchase today!",
		 * 		"Almost there.",
		 * 		// ...
		 * 	]
		 * 	const t = setInterval(() => {
		 * 		states.localization.activityIndicatorText(info[n])
		 * 		n++;
		 * 		if (n === info.length) n = 0;
		 * 	}, 10 * 1000)
		 * }
		 * ```
		 */
		activityIndicatorText: (text: string) => void;
	}
};
export type LoadingStateImpl = Omit<LoadingModal<unknown>, 'task'> & {
	progress: { completedSteps: number; completedPortion: number };
	totalSteps: number;
	logs: string[];
	text?: string;
	title: string;
	localizationImpl: LoadingScreenLocalization,
	cancel?: () => Promise<void> | void;
	animateClose?: () => Promise<void>;
};
type LoadingScreenLocalization = {
	activityIndicatorText?: string,
	logsLabel: string,
}
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