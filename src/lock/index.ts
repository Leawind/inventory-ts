import { Delegate } from 'jsr:@leawind/delegate@0.4';

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
	private owner: unknown;
	private isLockedInternal: boolean = false;
	private waitingQueue: (() => void)[] = [];

	public readonly onRelease: Delegate<void> = new Delegate();

	public acquire(owner?: unknown): Promise<void> {
		return new Promise((resolve) => {
			const attemptToAcquire = () => {
				if (!this.isLockedInternal) {
					this.isLockedInternal = true;
					if (owner) {
						this.owner = owner;
					}
					resolve();
				} else {
					this.waitingQueue.push(attemptToAcquire);
				}
			};
			attemptToAcquire();
		});
	}

	public release(): void {
		if (!this.isLockedInternal) {
			throw new Error('Cannot release an unlocked lock');
		}

		this.owner = undefined;
		this.isLockedInternal = false;
		const nextResolve = this.waitingQueue.shift();
		if (nextResolve) {
			nextResolve();
		}

		this.onRelease.broadcast();
	}
	/**
	 * Checks if the lock is currently held.
	 * @returns `true` if lock is held, `false` otherwise
	 */
	public isLocked(): boolean {
		return this.isLockedInternal;
	}
	/**
	 * Gets the current owner of the lock, if one was specified during acquisition.
	 * 
	 * @see {@link acquire}
	 */
	public getOwner(): unknown | undefined {
		return this.owner;
	}

	private static locks: Map<string, Lock> = new Map();

	/**
	 * Get or create a named lock instance.
	 * The lock will be automatically cleaned up when released.
	 * @param key - Unique identifier for the lock
	 */
	public static of(key: string): Lock {
		if (!this.locks.has(key)) {
			const lock = new Lock();
			this.locks.set(key, lock);
			lock.onRelease.addListener(() => {
				this.locks.delete(key);
			});
		}
		return this.locks.get(key)!;
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
