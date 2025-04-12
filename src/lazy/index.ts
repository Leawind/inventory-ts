import { Waited } from '@/waited/index.ts';

/**
 * A deferred action executor with deadline control and reschedulable execution.
 *
 * - Delays action execution until optimal time window
 * - Guarantees execution before deadline
 *
 * @template T - The return type of the action function
 */
export class LazyAction<T> {
	private waited: Waited<T> = new Waited({ autoReset: true });

	/** setTimeout reference for pending execution */
	private timeoutId?: number;
	/** Timestamp of scheduled execution time */
	private momentScheduledExecution?: number;

	/** Latest allowable delay time (timestamp) */
	private momentLatestDelayTime: number = 0;
	/** Earliest required deadline (timestamp) */
	private momentEarliestDeadline: number = Infinity;

	/** Timestamp of last execution */
	private momentLastExecute: number = 0;

	/**
	 * @param actionFn - Function to execute
	 * @param defaultDelay - Default waiting time before execution (ms)
	 * @param defaultDeadline - Maximum allowable delay after first trigger (ms)
	 */
	constructor(
		private actionFn: () => T,
		private defaultDelay: number = 5000,
		private defaultDeadline: number = 20000,
	) { }

	/**
	 * Replace the core action function

	 * @param action - New function to execute
	 * @returns Instance for chaining
	 */
	public setAction(action: () => T): this {
		this.actionFn = action;
		return this;
	}

	/**
	 * Request execution with timing constraints
	 *
	 * Behavior:
	 * - Guarantees execution before `deadline`
	 * - Attempts to wait at least `delay` ms from first trigger
	 * - Returns immediate result if constraints are met, otherwise Promise
	 *
	 * @param delay - Minimum preferred waiting time (ms)
	 * @param deadline - Maximum allowable delay (ms)
	 * @returns Action result (immediate) | Promise that resolves with result
	 */
	public urge(delay: number = this.defaultDelay, deadline: number = this.defaultDeadline): T | Promise<T> {
		const moment = Date.now();
		const momentDelayTime = moment + delay;
		const momentDeadline = moment + deadline;

		// Update time constraints
		this.momentLatestDelayTime = Math.max(this.momentLatestDelayTime, momentDelayTime);
		this.momentEarliestDeadline = Math.min(this.momentEarliestDeadline, momentDeadline);
		const momentExecute = Math.min(this.momentLatestDelayTime, this.momentEarliestDeadline);

		if (momentExecute <= moment) {
			// Immediate execution
			if (this.timeoutId) {
				clearTimeout(this.timeoutId);
				this.timeoutId = undefined;
			}
			return this.execute();
		} else {
			// Reschedule if needed
			if (this.timeoutId !== undefined) {
				if (this.momentScheduledExecution !== momentExecute) {
					clearTimeout(this.timeoutId);
					this.schedule(momentExecute);
				}
			} else {
				this.schedule(momentExecute);
			}
		}

		return this.waited.wait()!;
	}

	/**
	 * Schedule execution at specific timestamp
	 *
	 * @param time - Target execution time (timestamp)
	 */
	private schedule(time: number): void {
		this.timeoutId = setTimeout(() => {
			this.timeoutId = undefined;

			this.waited.resolve(this.execute());

			this.momentScheduledExecution = undefined;
			this.momentEarliestDeadline = Infinity;
			this.momentLatestDelayTime = 0;
		}, time - Date.now());
	}

	public cancel(): void {
		if (this.timeoutId !== undefined) {
			clearTimeout(this.timeoutId);
			const p = this.waited.wait();
			if (p instanceof Promise) {
				p.catch(() => { });
			}
			this.waited.reject(new Error(`Canceled`));
		}
		this.momentScheduledExecution = undefined;
		this.momentEarliestDeadline = Infinity;
		this.momentLatestDelayTime = 0;
	}

	/**
	 * Immediately execute the action

	 * @returns Action result
	 */
	public execute(): T {
		const result = this.actionFn();
		this.momentLastExecute = Date.now();
		return result;
	}

	/**
	 * Get time elapsed since last execution

	 * @returns Milliseconds since last execute() call
	 */
	public sinceLastExecute(): number {
		return Date.now() - this.momentLastExecute;
	}
}
