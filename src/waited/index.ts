export class Waited<T = void> {
	private resolveFn?: (value: T | PromiseLike<T>) => void;
	private rejectFn?: (reason?: unknown) => void;
	private promise: Promise<T> = this.reset();

	constructor(private readonly autoReset: boolean = true) {}

	private clear(): void {
		this.resolveFn = undefined;
		this.rejectFn = undefined;
	}

	public reset(): Promise<T> {
		this.clear();
		this.promise = new Promise<T>((resolve, reject) => {
			this.resolveFn = resolve;
			this.rejectFn = reject;
		});
		return this.promise;
	}

	public isWaiting(): boolean {
		return this.resolveFn !== undefined;
	}

	public wait(): Promise<T> {
		return this.promise;
	}

	public resolve(value: T | PromiseLike<T>): this {
		if (this.resolveFn) {
			this.resolveFn(value);
			this.clear();
		}
		if (this.autoReset) {
			this.reset();
		}
		return this;
	}
	public reject(reason?: unknown): this {
		if (this.rejectFn) {
			this.rejectFn(reason);
			this.clear();
		}
		if (this.autoReset) {
			this.reset();
		}
		return this;
	}
}
