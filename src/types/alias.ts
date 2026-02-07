/**
 * Represents a function with any parameters and a specific return type
 *
 * @template Return - The return type of the function
 * @template Params - The parameters of the function as a tuple type
 *
 * @example
 * ```ts
 * type NumberToStringFn = AnyFunction<string, [number]>
 * // Equivalent to: (arg: number) => string
 * ```
 */
export type AnyFunction<
  Return = any,
  Params extends any[] = any[],
> = (...args: Params) => Return

/**
 * Represents a constructor function with any parameters and a specific return type
 *
 * @template Return - The type returned by the constructor function
 * @template Params - The parameters of the constructor function as a tuple type
 *
 * @example
 * ```ts
 * type StringConstructor = Constructor<string, [number]>
 * // Equivalent to: new (arg: number) => string
 * ```
 */
export type Constructor<
  Return = any,
  Params extends any[] = any[],
> = new (...args: Params) => Return

export type Awaitable<T> = Promise<T> | T

export type TemplateStringArgs = [strs: TemplateStringsArray, ...args: readonly unknown[]]

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

export type JsonPrimitive = string | number | boolean | null
export type JsonArray = JsonValue[]
export type JsonObject = { [key: string]: JsonValue }
export type JsonValue = JsonPrimitive | JsonArray | JsonObject
export type Jsonable = string | number | boolean | null | Jsonable[] | { [key: string]: Jsonable }
