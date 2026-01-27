import type { DeepPartial, DeepRequire } from '@/types.ts';

/**
 * Options for configuring object and array filling strategies.
 */
type FillOptionsType = {
	/**
	 * - `replace` **(Default)** Replace the object with the new object
	 * - `merge` Merge the objects
	 */
	objects: 'replace' | 'merge';
	/**
	 * - `concat` **(Default)** Concatenate the arrays
	 * - `replace` Replace the array with the new array
	 * - `merge` Merge the arrays, excluding duplicates
	 */
	arrays: 'concat' | 'replace' | 'merge';
};

/**
 * Defines an Options class with a generic type T representing the options type.
 *
 * @template T - The options type.
 *
 * @example
 * ```ts
 * const ListenOptions = Options.define({
 *     host: '0.0.0.0',
 *     port: 25565,
 * });
 *
 * function listen(options?: typeof ListenOptions.Partial) {
 *     const opts = ListenOptions.fill(options);
 *     console.log(`Host: ${opts.host}`);
 *     console.log(`Port: ${opts.port}`);
 * }
 *
 * listen({
 *     host: 'localhost',
 *     port: 51120,
 * });
 * ```
 */
export class Options<T> {
	public static FillOptions: Options<FillOptionsType> = Options.define<FillOptionsType>({
		objects: 'merge',
		arrays: 'concat',
	});

	//Readonly properties representing the options type, partial options, deep partial options, and required options.
	public readonly Type!: T;
	public readonly Partial!: Partial<T>;
	public readonly DeepPartial!: DeepPartial<T>;
	public readonly Require!: Required<T>;
	public readonly DeepRequire!: DeepRequire<T>;

	public readonly Default: T;

	protected constructor(defaults: T) {
		this.Default = defaults;
	}

	/**
	 * Fill options with defaults, accepting partial options and fill strategies as parameters.
	 *
	 * @param options - Partial options to fill.
	 * @param fillOptions - Fill strategies for objects and arrays.
	 * @returns The filled options.
	 */
	public fill(options?: DeepPartial<T>, fillOptions?: typeof Options.FillOptions.Partial): T {
		return Options.fillRecursive({} as T, this.Default, options, fillOptions);
	}

	/**
	 * Create an Options instance.
	 *
	 * @template T - The options type.
	 * @param defaults - The default options.
	 * @returns An Options instance.
	 */
	public static define<T>(defaults: T): Options<T> {
		return new Options(defaults);
	}

	/**
	 * Recursively fill options.
	 *
	 * @param result - The result object to fill.
	 * @param defaults - The default options.
	 * @param filledOptions - The partial options to fill.
	 * @param options - Fill strategies for objects and arrays.
	 * @returns The filled result object.
	 */
	private static fillRecursive<T>(
		result: T,
		defaults: T,
		filledOptions: DeepPartial<T> = {},
		options?: typeof Options.FillOptions.Partial,
	): T {
		const opts: typeof Options.FillOptions.Require = options ? Options.FillOptions.fill(options) : {
			objects: 'merge',
			arrays: 'concat',
		};

		for (const key in defaults) {
			const defaultValue = defaults[key];
			const optionValue = filledOptions[key];

			if (optionValue === undefined) {
				result[key] = defaultValue;
			} else if (typeof optionValue === 'object' && optionValue !== null) {
				if (Array.isArray(defaultValue) && Array.isArray(optionValue)) {
					switch (opts.arrays) {
						case 'replace': {
							result[key] = optionValue as T[Extract<keyof T, string>];
							break;
						}
						case 'concat': {
							result[key] = [
								...(defaultValue as unknown[]),
								...(optionValue as unknown[]),
							] as T[Extract<keyof T, string>];
							break;
						}
						case 'merge': {
							const merged = new Set([
								...defaultValue as unknown[],
								...optionValue as unknown[],
							]);
							result[key] = Array.from(merged) as T[Extract<keyof T, string>];
							break;
						}
					}
				} else if (typeof defaultValue === 'object' && defaultValue !== null) {
					switch (opts.objects) {
						case 'replace': {
							result[key] = optionValue as T[Extract<keyof T, string>];
							break;
						}
						case 'merge': {
							result[key] = {} as T[Extract<keyof T, string>];
							this.fillRecursive(
								result[key],
								defaultValue,
								optionValue as DeepPartial<T[Extract<keyof T, string>]>,
								options,
							);
							break;
						}
					}
				} else {
					result[key] = optionValue as T[Extract<keyof T, string>];
				}
			} else {
				result[key] = optionValue as T[Extract<keyof T, string>];
			}
		}
		return result;
	}
}
