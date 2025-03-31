import type { DeepPartial } from '@/types.ts';

const DEFAULTS = Symbol('defaults');

export enum OptionsObjectStrategy {
	/**
	 * Replace the object with the new object
	 */
	Replace = 'replace',
	/**
	 * Merge the objects
	 */
	Merge = 'merge',
}

export enum OptionsArrayStragegy {
	/**
	 * Concatenate the arrays
	 */
	Concat = 'concat',
	/**
	 * Replace the array with the new array
	 */
	Replace = 'replace',
	/**
	 * Merge the arrays, excluding duplicates
	 */
	Merge = 'merge',
}

export type OptionsTypeOf<Opts> = Opts extends Options<infer U> ? U : never;

export class Options<T> {
	private [DEFAULTS]: T;

	protected constructor(defaults: T) {
		this[DEFAULTS] = defaults;
	}

	public fill(opts: DeepPartial<T>): T {
		return Options.fillRecursive({} as T, opts, this[DEFAULTS]);
	}

	public static define<T>(defaults: T): Options<T> {
		return new Options(defaults);
	}

	private static fillRecursive<T>(result: T, opts: DeepPartial<T>, defaults: T): T {
		for (const key in defaults) {
			if (opts[key] === undefined) {
				result[key] = defaults[key];
			} else if (typeof opts[key] === 'object' && opts[key] !== null) {
				if (typeof defaults[key] === 'object' && defaults[key] !== null) {
					result[key] = {} as T[Extract<keyof T, string>];
					this.fillRecursive(result[key], opts[key], defaults[key]);
				} else {
					result[key] = defaults[key];
				}
			} else {
				result[key] = opts[key] as T[Extract<keyof T, string>];
			}
		}
		return result;
	}
}
