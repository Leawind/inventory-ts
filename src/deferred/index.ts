type ResolveFn<T> = (value: T | PromiseLike<T>) => void;
type RejectFn<E = unknown> = (reason?: E) => void;

type State = 'pending' | 'resolved' | 'rejected';

export class Deferred<T, E = unknown> extends Promise<T> {
	#state: State = 'pending';

	/**
	 * Resolve the promise with a value or the result of another promise
	 */
	resolve!: ResolveFn<T>;

	/**
	 * Reject the promise with a provided reason or error.
	 */
	reject!: RejectFn<E>;

	public get state(): 'pending' | 'resolved' | 'rejected' {
		return this.#state;
	}

	public get isPending(): boolean {
		return this.#state === 'pending';
	}

	public get isFulfilled(): boolean {
		return this.#state !== 'pending';
	}

	public get isResolved(): boolean {
		return this.#state === 'resolved';
	}

	public get isRejected(): boolean {
		return this.#state === 'rejected';
	}

	/**
	 * ### Params
	 *
	 * - `executor` A callback used to initialize the promise. This callback is passed two arguments: a resolve callback used to resolve the promise with a value or the result of another promise, and a reject callback used to reject the promise with a provided reason or error.
	 */
	public constructor(executor?: (resolve: ResolveFn<T>, reject: RejectFn<E>) => void) {
		let tempResolve: ResolveFn<T>;
		let tempReject: RejectFn<E>;
		let tempState: State = 'pending';

		super((resolve, reject) => {
			tempResolve = resolve;
			tempReject = reject;

			if (executor) {
				executor(
					(value: T | PromiseLike<T>) => {
						if (tempState !== 'pending') return;
						tempState = 'resolved';
						resolve(value);
					},
					(reason?: E) => {
						if (tempState !== 'pending') return;
						tempState = 'rejected';
						reject(reason);
					},
				);
			}
		});

		// Must call super constructor in derived class before accessing 'this' or returning from derived constructor
		this.#state = tempState;
		this.resolve = (value: T | PromiseLike<T>) => {
			if (this.#state !== 'pending') {
				throw new Error(`Deferred already ${this.#state}`);
			}
			this.#state = 'resolved';
			tempResolve(value);
		};
		this.reject = (reason?: E) => {
			if (this.#state !== 'pending') {
				throw new Error(`Deferred already ${this.#state}`);
			}
			this.#state = 'rejected';
			tempReject(reason);
		};
	}
}
