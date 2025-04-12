interface ILock {
	/**
	 * Acquires the lock. Returns a Promise that resolves when the lock is obtained.
	 * @returns {Promise<void>} Promise that resolves when lock is acquired
	 */
	acquire(): Promise<void>;
	/**
	 * Releases the lock. Must be called after acquire() to allow other callers to proceed.
	 * @throws {Error} If called when lock is not held
	 */
	release(): void;
}

/**
 * A fair lock implementation that guarantees first-in-first-out (FIFO) ordering.
 * This ensures requests are granted in the order they were received, preventing starvation.
 */
export class Lock implements ILock {
	private isLocked: boolean = false;
	private waitingQueue: (() => void)[] = [];

	public acquire(): Promise<void> {
		return new Promise((resolve) => {
			const attemptToAcquire = () => {
				if (!this.isLocked) {
					this.isLocked = true;
					resolve();
				} else {
					this.waitingQueue.push(attemptToAcquire);
				}
			};
			attemptToAcquire();
		});
	}

	public release(): void {
		if (!this.isLocked) {
			throw new Error('Cannot release an unlocked lock');
		}

		this.isLocked = false;
		const nextResolve = this.waitingQueue.shift();
		if (nextResolve) {
			nextResolve();
		}
	}
}

export class UnfairLock implements ILock {
	private promise?: Promise<void>;
	private resolveFn?: (value: void | PromiseLike<void>) => void;

	private isLocked() {
		return this.promise !== undefined;
	}

	public acquire(): Promise<void> {
		if (!this.isLocked()) {
			this.promise = new Promise((resolve) => this.resolveFn = resolve);
		}
		return this.promise!;
	}

	public release(): void {
		if (!this.isLocked()) {
			throw new Error('Cannot release an unlocked lock');
		}
		this.resolveFn!();

		this.promise = undefined;
		this.resolveFn = undefined;
	}
}
