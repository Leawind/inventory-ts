type ResolveFn<T> = (value: T | PromiseLike<T>) => void;
type RejectFn = (reason?: unknown) => void;

export class Deferred<T> extends Promise<T> {
	/**
	 * Resolve the promise with a value or the result of another promise
	 */
	public resolve!: ResolveFn<T>;

	/**
	 * Reject the promise with a provided reason or error.
	 */
	public reject!: RejectFn;

	/**
	 * @param executor A callback used to initialize the promise. This callback is passed two arguments: a resolve callback used to resolve the promise with a value or the result of another promise, and a reject callback used to reject the promise with a provided reason or error.
	 */
	public constructor(executor?: (resolve: ResolveFn<T>, reject: RejectFn) => void) {
		let tempResolve: ResolveFn<T>;
		let tempReject: RejectFn;

		super((resolve, reject) => {
			tempResolve = resolve;
			tempReject = reject;

			if (executor) {
				executor(resolve, reject);
			}
		});

		this.reject = tempReject!;
		this.resolve = tempResolve!;
	}
}
