import type { DeepPartial } from '@/types.ts';

export type OptionsTypeOf<Opts> = Opts extends Options<infer U> ? U : never;

export class Options<T> {
	private static FillOptions = Options.define<{
		/**
		 * - `replace` Replace the object with the new object
		 * - `merge` Merge the objects
		 */
		objects: 'replace' | 'merge';
		/**
		 * - `concat` Concatenate the arrays
		 * - `replace` Replace the array with the new array
		 * - `merge` Merge the arrays, excluding duplicates
		 */
		arrays: 'concat' | 'replace' | 'merge';
	}>({
		objects: 'merge',
		arrays: 'concat',
	});

	public Type: T = null!;
	public Partial: Partial<T> = null!;
	public DeepPartial: DeepPartial<T> = null!;
	public Require: Required<T> = null!;

	private readonly defaults: T;

	protected constructor(defaults: T) {
		this.defaults = defaults;
	}

	public fill(options?: DeepPartial<T>, fillOptions?: typeof Options.FillOptions.Partial): T {
		return Options.fillRecursive({} as T, this.defaults, options, fillOptions);
	}

	public static define<T>(defaults: T): Options<T> {
		return new Options(defaults);
	}

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
