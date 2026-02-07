/**
 * Checks if two types are exactly equal (structurally identical).
 *
 * ```ts
 * // Literal vs base type
 * type T1 = Same<3, number>;            // false
 *
 * // Special types
 * type T2 = Same<never, any>;           // false
 * type T3 = Same<any, 3>;               // false
 * type T4 = Same<any, unknown>;         // false
 * type T5 = Same<unknown, any>;         // false
 *
 * // Subtype vs supertype
 * type T6 = Same<string, string | number>;  // false
 *
 * // Modifier differences
 * type T7 = Same<{a: 1}, {readonly a: 1}>;  // false
 * type T8 = Same<{a?: 1}, {a: 1 | undefined}>;  // false
 *
 * // Function type differences
 * type T9 = Same<() => void, () => undefined>;  // false
 *
 * // Equal types
 * type T10 = Same<any, any>;                    // true
 * type T11 = Same<never, never>;                // true
 * type T12 = Same<5, 5>;                        // true
 * type T13 = Same<string, string>;              // true
 * type T14 = Same<number | string, string | number>;  // true
 *
 * // Different syntax, same type
 * type T15 = Same<{a: number[]}, {a: Array<number>}>;  // true
 * ```
 */
export type Exact<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false

/**
 * Use with {@link Switch}
 */
export type Case<T, Return> = [T, Return]
/**
 * ### Example
 *
 * ```ts
 * const _: boolean = any as Switch<4, [
 *   Case<3, string>,
 *   Case<4, boolean>,
 *   Case<5, number>,
 * ], `Error: fail to match any condition`>;
 * ```
 */
export type Switch<T, Cases extends readonly [unknown, unknown][], Default = never> = Cases extends
  [infer First, ...infer Rest] ? (
    First extends [infer C, infer R] ? (
        Exact<T, C> extends true ? R
          : Switch<T, (Rest extends readonly [unknown, unknown][] ? Rest : never), Default>
      )
      : never
  )
  : Default

export type SwitchExtends<T, Cases extends readonly [unknown, unknown][], Default = never> = Cases extends
  [infer First, ...infer Rest] ? (
    First extends [infer C, infer R] ? (
        [T] extends [C] ? R
          : SwitchExtends<T, (Rest extends readonly [unknown, unknown][] ? Rest : never), Default>
      )
      : never
  )
  : Default

/**
 * **⚠️Important:** parameter `T` and `U` are not distributive. When they are union type, it treats them as a single entity.
 *
 * @template T - The type to test (not distributed over unions)
 * @template U - The constraint type to test against
 *
 * @example
 *
 * ```ts
 * import { expect } from '@leawind/lay-sing/test-utils'
 *
 * expect<AssertExtends<string, number>>().toBeNever
 * expect<AssertExtends<1 | 2, 1>>().toBeNever
 * expect<AssertExtends<1, 1 | 2>>().toBe<1>().success
 * ```
 */
export type AssertExtends<T, U> = [T] extends [U] ? T : never

export type Replace<T, Old, New> = T extends any ? (
    Exact<T, Old> extends true ? New
      : T extends Promise<infer U> ? Promise<Replace<U, Old, New>>
      : T extends Map<infer K, infer V> ? Map<Replace<K, Old, New>, Replace<V, Old, New>>
      : T extends Set<infer U> ? Set<Replace<U, Old, New>>
      : T extends WeakMap<infer K, infer V>
        ? WeakMap<AssertExtends<Replace<K, Old, New>, WeakKey>, Replace<V, Old, New>>
      : T extends WeakSet<infer U> ? WeakSet<AssertExtends<Replace<U, Old, New>, WeakKey>>
      : T extends (...args: infer P extends any[]) => infer R
        ? (...args: AssertExtends<Replace<P, Old, New>, any[]>) => Replace<R, Old, New>
      : T extends object ? { [K in keyof T]: Replace<T[K], Old, New> }
      : T
  )
  : never
