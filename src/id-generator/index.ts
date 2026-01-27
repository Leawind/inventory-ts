/**
 * A generic sequencer that generates consecutive IDs of type T.
 * The sequencer produces the next ID by applying the nextValueGetter to the last value,
 * filtering results through a predicate, and respecting a maximum iteration limit.
 */
export class IdGenerator<T> {
	/**
	 * Constructs an IdSequencer instance.
	 * @param lastValue - The initial last value (will not be returned as the first next()).
	 * @param nextValueGetter - A function that takes the last value and returns the next candidate value.
	 * @param maxTries - Maximum allowed attempts to find a valid ID before throwing an error (default: Infinity).
	 * @param filter - A predicate function that returns true if a candidate ID is valid and can be returned (default: always true).
	 */
	public constructor(
		private lastValue: T,
		private readonly nextValueGetter: (last: T) => T,
		private readonly maxTries: number = Infinity,
		private readonly filter: (id: T) => boolean = () => true,
	) {}

	/**
	 * Returns the next valid ID in the sequence.
	 * Repeatedly generates candidates using nextValueGetter until one passes the filter.
	 * @returns The next valid ID.
	 * @throws {Error} If the number of attempts exceeds the limit before finding a valid ID.
	 */
	public next(): T {
		let i = this.lastValue;
		let count = 0;
		do {
			i = this.nextValueGetter(i);
			count++;

			if (count > this.maxTries) {
				throw new Error('IdSequencer limit exceeded');
			}
		} while (!this.filter(i));

		this.lastValue = i;
		return i;
	}

	/**
	 * Manually sets the last value used by the sequencer.
	 * The next call to next() will start from this value.
	 * @param id - The value to set as the last value.
	 */
	public setLast(id: T): void {
		this.lastValue = id;
	}

	/**
	 * Creates a number sequencer that cycles through a numeric range [low, high).
	 * The range is exclusive of the high value.
	 */
	public static ranged(low: number, high: number): IdGenerator<number>;
	/**
	 * Creates a number sequencer with a numeric range and an attempt limit.
	 * @param maxTries - Maximum attempts before throwing an error.
	 */
	public static ranged(low: number, high: number, maxTries: number): IdGenerator<number>;
	/**
	 * Creates a number sequencer with a numeric range and a custom filter.
	 * @param filter - A predicate to validate candidate IDs.
	 */
	public static ranged(low: number, high: number, filter: (i: number) => boolean): IdGenerator<number>;
	/**
	 * Creates a number sequencer with a numeric range, limit, and filter.
	 * @param maxTries - Maximum attempts before throwing an error.
	 * @param filter - A predicate to validate candidate IDs.
	 */
	public static ranged(
		low: number,
		high: number,
		maxTries: number,
		filter: (i: number) => boolean,
	): IdGenerator<number>;
	/**
	 * Implementation of the ranged factory method.
	 * Handles all overload signatures by examining the number and types of arguments.
	 * @param args - Arguments corresponding to one of the overload signatures.
	 * @returns An IdSequencer instance configured for numeric ranges.
	 * @throws {Error} If the arguments are invalid.
	 */
	public static ranged(
		...args:
			| [low: number, high: number]
			| [low: number, high: number, limit: number]
			| [low: number, high: number, filter: (i: number) => boolean]
			| [low: number, high: number, limit: number, filter: (i: number) => boolean]
	) {
		const [low, high] = args;
		// Generates the next number in the range, wrapping around to low when reaching high.
		const nextValueGetter = (i: number) => ((i - low + 1) % (high - low)) + low;

		switch (args.length) {
			case 2:
				return new IdGenerator(low, nextValueGetter);
			case 3:
				switch (typeof args[2]) {
					case 'number':
						return new IdGenerator(low, nextValueGetter, args[2]);
					case 'function':
						return new IdGenerator(low, nextValueGetter, undefined, args[2]);
					default:
						throw new Error('Invalid argument');
				}
			case 4:
				return new IdGenerator(low, nextValueGetter, args[2], args[3]);
		}
	}
}
