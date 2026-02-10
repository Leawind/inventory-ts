/**
 * Creates an intersection of all types in the provided tuple
 *
 * ## `IntersectOf<[A, B, ... T]>` = `A & B & ... & T`
 *
 * @template Types - A tuple of types to create an intersection from
 *
 * @example
 * ```ts
 * import { expect } from 'lay-sing'
 *
 * type Result = IntersectOf<[{ a: string }, { b: number }, { c: boolean }]>
 * expect<Result>().to.extend<{ a: string } & { b: number } & { c: boolean }>().pass
 * expect<Result>().to.extend<{ a: string; b: number; c: boolean }>().pass
 * ```
 */
export type IntersectionOf<Types extends readonly unknown[]> = Types extends [infer First, ...infer Rest]
  ? First & IntersectionOf<Rest>
  : unknown

/**
 * Creates a union of all types in the provided tuple
 *
 * ## `UnionOf<[A, B, ... T]>` = `A | B | ... | T`
 *
 * @template Types - A tuple of types to create a union from
 *
 * @example
 * ```ts
 * import { expect } from 'lay-sing'
 *
 * type Result = UnionOf<[string, number, boolean]>
 * expect<Result>().to.be<string | number | boolean>().pass
 * ```
 */
export type UnionOf<Types extends readonly unknown[]> = Types extends [infer First, ...infer Rest]
  ? First | UnionOf<Rest>
  : never
