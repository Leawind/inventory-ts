/**
 * Negates a boolean type
 *
 * @template T - The boolean type to negate
 *
 * @example
 * ```ts
 * import { expect } from '@leawind/lay-sing/test-utils'
 *
 * expect<Not<true>>().to.be.false
 * expect<Not<false>>().to.be.true
 * expect<Not<boolean>>().to.be<boolean>().pass
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
 * expect<And<true, true>>().to.be.true
 * expect<And<true, false>>().to.be.false
 * expect<And<false, true>>().to.be.false
 * expect<And<false, false>>().to.be.false
 * expect<And<boolean, boolean>>().to.be<boolean>().pass
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
 * expect<Or<true, true>>().to.be.true
 * expect<Or<true, false>>().to.be.true
 * expect<Or<false, true>>().to.be.true
 * expect<Or<false, false>>().to.be.false
 * expect<Or<boolean, false>>().to.be<boolean>().pass
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
