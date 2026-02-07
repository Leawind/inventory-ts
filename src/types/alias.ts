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
