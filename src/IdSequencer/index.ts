export class IdSequencer<T> {
	public constructor(
		private lastValue: T,
		private readonly nextValueGetter: (last: T) => T,
		private readonly limit: number = Infinity,
		private readonly filter: (id: T) => boolean = () => true,
	) {}

	public next(): T {
		let i = this.lastValue;
		let count = 0;
		do {
			i = this.nextValueGetter(i);
			count++;

			if (count > this.limit) {
				throw new Error('IdSequencer limit exceeded');
			}
		} while (!this.filter(i));

		this.lastValue = i;
		return i;
	}

	public static createRanged(low: number, high: number): IdSequencer<number>;
	public static createRanged(
		low: number,
		high: number,
		limit: number,
	): IdSequencer<number>;
	public static createRanged(
		low: number,
		high: number,
		filter: (i: number) => boolean,
	): IdSequencer<number>;
	public static createRanged(
		low: number,
		high: number,
		limit: number,
		filter: (i: number) => boolean,
	): IdSequencer<number>;
	public static createRanged(
		...args:
			| [low: number, high: number]
			| [low: number, high: number, limit: number]
			| [low: number, high: number, filter: (i: number) => boolean]
			| [
				low: number,
				high: number,
				limit: number,
				filter: (i: number) => boolean,
			]
	): IdSequencer<number> {
		const [low, high] = args;
		const nextValueGetter = (i: number) => ((i - low + 1) % (high - low)) + low;

		switch (args.length) {
			case 2:
				return new IdSequencer(low, nextValueGetter);
			case 3:
				switch (typeof args[2]) {
					case 'number':
						return new IdSequencer(low, nextValueGetter, args[2]);
					case 'function':
						return new IdSequencer(low, nextValueGetter, undefined, args[2]);
					default:
						throw new Error('Invalid argument');
				}
			case 4:
				return new IdSequencer(low, nextValueGetter, args[2], args[3]);
		}
	}
}
