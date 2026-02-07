/**
 * Negates a boolean type
 *
 * @template T - The boolean type to negate
 *
 * @example
 * ```ts
 * import { expect } from '@leawind/lay-sing/test-utils'
 *
 * expect<Not<true>>().toBeFalse
 * expect<Not<false>>().toBeTrue
 * expect<Not<boolean>>().toBe<boolean>().success
 * ```
 */
export type Not<T extends boolean> = T extends true ? false
  : T extends false ? true
  : boolean

/**
 * Logical AND operation on two boolean types
 *
 * @template A - The first boolean type to compare
 * @template B - The second boolean type to compare
 *
 * @example
 * ```ts
 * import { expect } from '@leawind/lay-sing/test-utils'
 *
 * expect<And<true, true>>().toBeTrue
 * expect<And<true, false>>().toBeFalse
 * expect<And<false, true>>().toBeFalse
 * expect<And<false, false>>().toBeFalse
 * expect<And<boolean, boolean>>().toBe<boolean>().success
 * ```
 */
export type And<
  A extends boolean,
  B extends boolean,
> = A extends never ? never
  : [B] extends [never] ? never
  : (A extends true ? (B extends true ? true : false) : false)

/**
 * Logical OR operation on two boolean types
 *
 * @template A - The first boolean type to compare
 * @template B - The second boolean type to compare
 *
 * ### Result
 *
 * - `never`: if either `A` or `B` is `never`
 * - `boolean`: if either `A` or `B` is `boolean` or `any`
 * - `false`: if both `A` and `B` are `false`
 * - `true`: otherwise
 *
 * @example
 * ```ts
 * import { expect } from '@leawind/lay-sing/test-utils'
 *
 * expect<Or<true, true>>().toBeTrue
 * expect<Or<true, false>>().toBeTrue
 * expect<Or<false, true>>().toBeTrue
 * expect<Or<false, false>>().toBeFalse
 * expect<Or<boolean, false>>().toBe<boolean>().success
 * ```
 */
export type Or<
  A extends boolean,
  B extends boolean,
> = [A] extends [never] ? never
  : [B] extends [never] ? never
  : [boolean] extends [A] ? boolean
  : [boolean] extends [B] ? boolean
  : true extends A ? true
  : true extends B ? true
  : false
