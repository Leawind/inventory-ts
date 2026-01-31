import type { IntersectOf, UnionOf } from '@leawind/lay-sing';

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
export type DiffProps<T extends unknown[]> = Omit<IntersectOf<T>, keyof UnionOf<T>>;

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
