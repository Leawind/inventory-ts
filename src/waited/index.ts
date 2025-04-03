/**
 * A controllable promise wrapper that allows manual resolution/rejection and optional auto-reset.
 *
 * @template T - The type of the resolved value (default: void)
 */
export class Waited<T = void> {
	/** Internal resolver function for the current promise */
	private resolveFn?: (value: T | PromiseLike<T>) => void;
	/** Internal rejector function for the current promise */
	private rejectFn?: (reason?: unknown) => void;
	/** The current active promise instance */
	private promise?: Promise<T> = this.reset();

	constructor(
		/**
		 * Whether to automatically create new promise after resolution/rejection
		 * (default: true - enables seamless reuse)
		 */
		public autoReset: boolean = true,
		/**
		 * Called when resolved or rejected
		 */
		public onfinished?: () => void,
	) {}

	/** Clear current resolver/rejector references */
	private clear(): void {
		this.resolveFn = undefined;
		this.rejectFn = undefined;
		this.promise = undefined;
	}

	/**
	 * Create new promise instance and return it
	 * @returns The newly created promise
	 * @description
	 * - Resets internal state
	 * - Creates fresh promise with new resolver/rejector
	 * - Maintains chainability with previous instances
	 */
	public reset(): Promise<T> {
		this.clear();
		this.promise = new Promise<T>((resolve, reject) => {
			this.resolveFn = resolve;
			this.rejectFn = reject;
		});
		return this.promise;
	}

	/**
	 * Check if waiting for resolution/rejection
	 * @returns true if there's pending promise waiting to settle
	 */
	public isWaiting(): boolean {
		return this.resolveFn !== undefined;
	}

	/**
	 * Get the current promise instance
	 * @returns The active promise that can be awaited
	 */
	public wait(): Promise<T> {
		return this.promise!;
	}

	/**
	 * Resolve the current promise
	 * @param value - Resolution value or thenable
	 * @returns The instance itself for chaining
	 * @description
	 * - Only affects the current active promise
	 * - Subsequent calls before reset will be no-op
	 * - Auto-reset if configured
	 */
	public resolve(value: T | PromiseLike<T>): this {
		if (this.resolveFn) {
			this.resolveFn(value);
			this.clear();
			if (this.onfinished) {
				this.onfinished();
			}
		}
		if (this.autoReset) {
			this.reset();
		}
		return this;
	}

	/**
	 * Reject the current promise
	 * @param reason - Optional rejection reason
	 * @returns The instance itself for chaining
	 * @description
	 * - Only affects the current active promise
	 * - Subsequent calls before reset will be no-op
	 * - Auto-reset if configured
	 */
	public reject(reason?: unknown): this {
		if (this.rejectFn) {
			this.rejectFn(reason);
			this.clear();
			if (this.onfinished) {
				this.onfinished();
			}
		}
		if (this.autoReset) {
			this.reset();
		}
		return this;
	}
}
