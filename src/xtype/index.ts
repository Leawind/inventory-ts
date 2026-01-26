/**
 * ### Example
 *
 * ```ts
 * type A = { a: string, b: number };
 * type B = { a: number, c: boolean };
 *
 * type Result = Intersect<[A, B]>;
 * type Result = { a: never, b: number, c: boolean }
 * ```
 */
export type Intersect<T extends unknown[]> = T extends [infer First, ...infer Rest] ? First & Intersect<Rest>
	: unknown;
/**
 * ### Example
 *
 * ```ts
 * type A = { a: string, b: number };
 * type B = { a: number, c: boolean };
 *
 * type Result = Union<[A, B]>;
 * type Result = { a: string | number }
 * ```
 */
export type Union<T extends unknown[]> = T extends [infer First, ...infer Rest] ? First | Union<Rest>
	: never;

/**
 * ### Example
 *
 * ```ts
 * type A = { a: string, b: number };
 * type B = { a: number, c: boolean };
 *
 * type Result = MergeNoConflict<[A, B]>;
 * type Result = { b: number, c: boolean }
 * ```
 */
export type DiffProps<T extends unknown[]> = Omit<Intersect<T>, keyof Union<T>>;

export function xorMerge<T extends object[]>(...objs: T): DiffProps<T> {
	return new Proxy({}, {
		get(_, key) {
			for (let i = 0; i < objs.length; i++) {
				const obj = objs[i];
				if (key in obj) {
					// deno-lint-ignore no-explicit-any
					return (obj as any)[key];
				}
			}
			return undefined;
		},
	}) as DiffProps<T>;
}
