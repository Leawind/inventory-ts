export class Lazy {
	#keys: unknown[] = [];
	#map: Map<unknown, unknown> = new Map();

	public constructor(public limit: number = -1) {}

	public tryGet<T>(key: unknown): T | undefined {
		return this.#map.get(key) as T | undefined;
	}

	public getOrDefaultSync<T>(key: unknown, getter: () => T): T {
		if (!this.#map.has(key)) {
			this.#map.set(key, getter());
			this.#keys.push(key);
			this.checkLimit();
		}
		return this.tryGet(key)!;
	}

	public getSync<T, K = unknown>(key: K): T | undefined;
	public getSync<T, K = unknown>(key: K, getter: () => T): T;
	public getSync<T, K = unknown>(key: K, getter?: () => T): T | undefined;
	public getSync<T, K = unknown>(key: K, getter?: () => T) {
		if (getter === undefined) {
			return this.tryGet(key);
		} else {
			return this.getOrDefaultSync(key, getter);
		}
	}

	public async getOrDefault<T>(key: unknown, getter: () => Promise<T>): Promise<T> {
		if (!this.#map.has(key)) {
			this.#map.set(key, await getter());
			this.#keys.push(key);
			this.checkLimit();
		}
		return this.tryGet(key)!;
	}

	public get<T, K = unknown>(key: K): T | undefined;
	public get<T, K = unknown>(key: K, getter: () => Promise<T>): Promise<T>;
	public get<T, K = unknown>(key: K, getter?: () => Promise<T>): Promise<T | undefined>;
	public get<T, K = unknown>(key: K, getter?: () => Promise<T>) {
		if (getter === undefined) {
			return this.tryGet(key);
		} else {
			return this.getOrDefault(key, getter);
		}
	}

	public clear(): void {
		this.#map.clear();
	}

	public checkLimit(): void {
		if (this.limit > 0) {
			while (this.#keys.length > this.limit) {
				this.#map.delete(this.#keys.shift());
			}
		}
	}

	public delete(key: unknown): boolean {
		return this.#map.delete(key);
	}
}
