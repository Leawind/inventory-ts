import type { AssertExtends } from 'lay-sing'

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

export type AnyFunction<R = any, Params extends any[] = any[]> = (...args: Params) => R

export type Constructor<Inst = any, Params extends any[] = any[]> = new (...args: Params) => Inst

export type Awaitable<T> = Promise<T> | T

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type DeepRequire<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequire<T[P]> : T[P]
}

export type Keys<T, U extends (keyof T)[]> = Exclude<keyof T, U[number]> extends never ? U
  : U & ['Missing key: ', Exclude<keyof T, U[number]>]

/**
 * List all keys in the give type
 *
 * Including all fields and methods
 *
 * @example
 *
 * ```ts
 * const keys = listKeys<{
 *     a: number;
 *     b: string;
 * }>()('a', 'b');
 * // keys is ['a', 'b']
 * ```
 *
 * @returns An array of all keys name in the given type
 */
export function listKeys<T>(): <U extends (keyof T)[]>(...keys: Keys<T, U>) => Keys<T, U> {
  return (...keys) => keys
}

export type EnsureFullCoverage<T, S1 extends DeepPartial<T>, S2 extends DeepPartial<T>> = T extends DeepPartial<T>
  ? (S1 & S2) extends T ? T
  : never
  : never

export type PromiseControl = {
  resolve: (value: void | PromiseLike<void>) => void
  reject: (reason?: unknown) => void
}

export type JsonPrimitive = string | number | boolean | null
export type JsonArray = JsonValue[]
export type JsonObject = { [key: string]: JsonValue }
export type JsonValue = JsonPrimitive | JsonArray | JsonObject
export type Jsonable = string | number | boolean | null | Jsonable[] | { [key: string]: Jsonable }

export type TypedArray =
  | Int8Array
  | Uint8Array
  | Uint8ClampedArray
  | Int16Array
  | Uint16Array
  | Int32Array
  | Float32Array
  | Float64Array
  | Uint32Array
  | BigInt64Array
  | BigUint64Array

export type TypedArrayConstructor<T> = T extends Int8Array ? Int8ArrayConstructor
  : T extends Uint8Array ? Uint8ArrayConstructor
  : T extends Uint8ClampedArray ? Uint8ClampedArrayConstructor
  : T extends Int16Array ? Int16ArrayConstructor
  : T extends Uint16Array ? Uint16ArrayConstructor
  : T extends Int32Array ? Int32ArrayConstructor
  : T extends Float32Array ? Float32ArrayConstructor
  : T extends Float64Array ? Float64ArrayConstructor
  : T extends Uint32Array ? Uint32ArrayConstructor
  : never
export type TemplateStringArgs = [strs: TemplateStringsArray, ...args: readonly unknown[]]

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

// Index start >>>>>>>>>>>>>>>>
export * from './object.ts'
export * from './set.ts'
// <<<<<<<<<<<<<<<<   Index end
