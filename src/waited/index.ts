export type WaitedOptions<T> = {
	/**
	 * Whether to create new promise after resolution/rejectio	 *
	 * @default false
	 */
	autoReset: boolean;

	/**
	 * Whether to keep the result and error after resolution/rejection
	 *
	 * @default true
	 */
	keepResult: boolean;

	/**
	 * Callback when resolved
	 */
	onresolved?: (value: T) => void;

	/**
	 * Callback when rejected
	 */
	onrejected?: (reason: unknown) => void;
};

export enum WaitedState {
	Init = 'init',
	Waiting = 'waiting',
	Resolved = 'resolved',
	Rejected = 'rejected',
}

/**
 * A controllable promise wrapper that allows manual resolution/rejection and optional auto-reset.
 *
 * @template T - The type of the resolved value (default: void)
 */
export class Waited<T = void> {
	private options: WaitedOptions<T> = {
		autoReset: false,
		keepResult: true,
	};

	constructor(options?: Partial<WaitedOptions<T>>) {
		this.options = Object.assign(this.options, options);

		if (this.options.autoReset) {
			this.reset();
		}
	}

	private state: WaitedState = WaitedState.Init;

	/**
	 * The current active promise instance
	 *
	 * Only available when {@link state} is {@link WaitedState.Waiting}
	 */
	private promise?: Promise<T>;
	/** Internal resolver function for {@link promise} */
	private resolveFn?: (value: T | PromiseLike<T>) => void;
	/** Internal rejector function for {@link promise} */
	private rejectFn?: (reason?: unknown) => void;

	private result?: T;
	private reason?: unknown;

	/**
	 * Clear current resolver/rejector references
	 *
	 * Clear {@link promise}, {@link resolveFn} and {@link rejectFn}
	 *
	 * If {@link keepResult} is false, clear {@link result} and {@link reason}
	 */
	private clear(): void {
		this.resolveFn = undefined;
		this.rejectFn = undefined;
		this.promise = undefined;

		if (!this.options.keepResult) {
			this.result = undefined;
			this.reason = undefined;
		}
	}

	/**
	 * Create new promise instance and return it
	 * @returns The newly created promise
	 * @description
	 * - Resets internal state
	 * - Creates fresh promise with new resolver/rejector
	 * - Maintains chainability with previous instances
	 */
	public reset(): this {
		this.clear();
		this.promise = new Promise<T>((resolve, reject) => {
			this.resolveFn = resolve;
			this.rejectFn = reject;
		});
		this.state = WaitedState.Waiting;
		return this;
	}

	/**
	 * Check if is waiting for resolution/rejection
	 *
	 * @returns true if there's pending promise waiting to settle
	 */
	public isWaiting(): boolean {
		return this.state === WaitedState.Waiting;
	}

	/**
	 * Get the current promise instance
	 *
	 * @returns The active promise that can be awaited. Or the result if resolved.
	 */
	public wait(): Promise<T> | T | undefined {
		switch (this.state) {
			case WaitedState.Init:
				return undefined;
			case WaitedState.Waiting:
				return this.promise!;
			case WaitedState.Resolved:
				return this.result;
			case WaitedState.Rejected:
				throw this.reason;
		}
	}

	/**
	 * Resolve the current promise
	 *
	 * @param value - Resolution value or thenable
	 * @returns The instance itself for chaining
	 * @description
	 * - Only affects the current active promise
	 * - Subsequent calls before reset will be no-op
	 * - Auto-reset if configured
	 *
	 * @throws Error if called on a non-waiting waited
	 */
	public resolve(value: T): this {
		if (this.state === WaitedState.Waiting) {
			this.state = WaitedState.Resolved;
			this.result = value;

			this.resolveFn!(value);
			if (this.options.onresolved) {
				this.options.onresolved(value);
			}

			this.clear();
			if (this.options.autoReset) {
				this.reset();
			}

			return this;
		} else {
			throw new Error('Cannot resolve a non-waiting waited');
		}
	}

	/**
	 * Reject the current promise
	 *
	 * @param reason - Optional rejection reason
	 * @returns The instance itself for chaining
	 * @description
	 * - Only affects the current active promise
	 * - Subsequent calls before reset will be no-op
	 * - Auto-reset if configured
	 *
itself for chaining
	 * @description
	 * - Only affects the current active promise
	 * - Subsequent calls before reset will be no-op
	 * - Auto-reset if configured
	 *
self for chaining
	 * @description
	 * - Only affects the current active promise
	 * - Subsequent calls before reset will be no-op
	 * - Auto-reset if configured
	 *
self for chaining
	 * @description
	 * - Only affects the current active promise
	 * - Subsequent calls before reset will be no-op
	 * - Auto-reset if configured
	 *
tself for chaining
	 * @description
	 * - Only affects the current active promise
	 * - Subsequent calls before reset will be no-op
	 * - Auto-reset if configured
	 *
	 * @throws Error if called on a non-waiting waited
	 */
	public reject(reason?: unknown): this {
		if (this.state === WaitedState.Waiting) {
			this.state = WaitedState.Rejected;
			this.reason = reason;

			this.rejectFn!(reason);
			if (this.options.onrejected) {
				this.options.onrejected(reason);
			}

			this.clear();
			if (this.options.autoReset) {
				this.reset();
			}

			return this;
		} else {
			throw new Error('Cannot reject a non-waiting waited');
		}
	}
}
