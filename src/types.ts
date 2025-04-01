export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Keys<T, U extends (keyof T)[]> = Exclude<keyof T, U[number]> extends never ? U
	: U & ['Missing key: ', Exclude<keyof T, U[number]>];

/**
 * List all keys in the give type
 *
 * Including all fields and methods
 *
 * @example
 *
 * ```ts
 * const keys = listKeys<{
 * 	a: number;
 * 	b: string;
 * }>()('a', 'b');
 * // keys is ['a', 'b']
 * ```
 *
 * @returns An array of all keys name in the given type
 */
export function listKeys<T>(): <U extends (keyof T)[]>(...keys: Keys<T, U>) => Keys<T, U> {
	return (...keys) => keys;
}
