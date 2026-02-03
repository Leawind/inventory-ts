/**
 * Creates an intersection of all types in the provided tuple
 *
 * ## `IntersectOf<[A, B, ... T]>` = `A & B & ... & T`
 *
 * @template Types - A tuple of types to create an intersection from
 *
 * @example
 * ```ts
 * import { expect } from '@leawind/lay-sing/test-utils'
 *
 * type Result = IntersectOf<[{ a: string }, { b: number }, { c: boolean }]>
 * expect<Result>().toExtend<{ a: string } & { b: number } & { c: boolean }>().success
 * expect<Result>().toExtend<{ a: string; b: number; c: boolean }>().success
 * ```
 */
export type IntersectOf<Types extends readonly unknown[]> = Types extends [infer First, ...infer Rest]
	? First & IntersectOf<Rest>
	: unknown;

/**
 * Creates a union of all types in the provided tuple
 *
 * ## `UnionOf<[A, B, ... T]>` = `A | B | ... | T`
 *
 * @template Types - A tuple of types to create a union from
 *
 * @example
 * ```ts
 * import { expect } from '@leawind/lay-sing/test-utils'
 *
 * type Result = UnionOf<[string, number, boolean]>
 * expect<Result>().toBe<string | number | boolean>().success
 * ```
 */
export type UnionOf<Types extends readonly unknown[]> = Types extends [infer First, ...infer Rest]
	? First | UnionOf<Rest>
	: never;
