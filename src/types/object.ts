/**
 * Recursively makes all properties of `T` optional
 *
 * @template T - The object type to make deep partial
 *
 * @example
 * ```ts
 * import { expect } from '@leawind/lay-sing/test-utils'
 *
 * type Result = DeepPartial<{ a: string; nested: { b: number } }>
 * expect<Result>().to.be<{ a?: string; nested?: { b?: number } }>().pass
 * ```
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * Recursively makes all properties of `T` required
 *
 * @template T - The object type to make deep required
 *
 * @example
 * ```ts
 * import { expect } from '@leawind/lay-sing/test-utils'
 *
 * expect<DeepRequire<{ _?: { _?: 1 } }>>().to.be<{ _: { _: 1 } }>().pass
 * ```
 */
export type DeepRequire<T> = {
  [K in keyof T]-?: T[K] extends object | undefined ? DeepRequire<NonNullable<T[K]>> : T[K]
}

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
 * import { expect } from 'lay-sing'
 *
 * type User = { name: string; age?: number };
 *
 * expect<Access<User, 'name'>>().to.be<string>().pass
 * expect<Access<User, 'age'>>().to.be<number | undefined>().pass
 * expect<Access<User, 'email', 'none'>>().to.be<'none'>().pass
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
 * import { expect } from 'lay-sing'
 *
 * expect<InverseAccess<{ a: string }, string>>().to.be<'a'>().pass
 * expect<InverseAccess<{ a: string; b: string }, string>>().to.be<'a' | 'b'>().pass
 * expect<InverseAccess<{ a: string }, number>>().to.be<never>().pass
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
 * import { expect } from 'lay-sing'
 *
 * type A = { a: 1; b: 2; }
 * type B = { b: string; c: 3 }
 * expect<Patch<A, B>>().to.extend<{ a: 1; b: string; c: 3 }>().pass
 * ```
 */
export type Patch<Target, Source> = Omit<Target, keyof Source> & Source
