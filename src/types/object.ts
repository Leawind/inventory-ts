/**
 * Get property type from object, with fallback for missing keys.
 *
 * @template Obj - The object type to access
 * @template K - The key to access in the object
 * @template E - The fallback type if the key doesn't exist (defaults to `never`)
 *
 * @returns `Obj[K]` if key exists, otherwise `E`.
 *
 * @example
 * ```ts
 * import { expect } from 'lay-sing/test-utils'
 *
 * type User = { name: string; age?: number };
 *
 * expect<Access<User, 'name'>>().toBe<string>().success
 * expect<Access<User, 'age'>>().toBe<number | undefined>().success
 * expect<Access<User, 'email', 'none'>>().toBe<'none'>().success
 * ```
 */
export type Access<Obj, K extends PropertyKey, E = never> = K extends keyof Obj ? Obj[K] : E

/**
 * Inverse of `Access` - gets keys from an object that have values of a specific type
 *
 * @template T - The object type to inspect
 * @template V - The value type to match against
 * @template E - The fallback type if no keys match (defaults to `never`)
 *
 * @example
 * ```ts
 * import { expect } from 'lay-sing/test-utils'
 *
 * expect<InverseAccess<{ a: string }, string>>().toBe<'a'>().success
 * expect<InverseAccess<{ a: string; b: string }, string>>().toBe<'a' | 'b'>().success
 * expect<InverseAccess<{ a: string }, number>>().toBe<never>().success
 * ```
 */
export type InverseAccess<T, V, E = never> = { [K in keyof T]: T[K] extends V ? K : E }[keyof T]

/**
 * Patch `Source` into `Target`
 *
 * @template Target - The target object type to patch
 * @template Source - The source object type to patch from
 *
 * @example
 * ```ts
 * import { expect } from 'lay-sing/test-utils'
 *
 * type A = { a: 1; b: 2; }
 * type B = { b: string; c: 3 }
 * expect<Patch<A, B>>().toExtend<{ a: 1; b: string; c: 3 }>().success
 * ```
 */
export type Patch<Target, Source> = Omit<Target, keyof Source> & Source
