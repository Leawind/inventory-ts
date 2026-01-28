// deno-lint-ignore no-explicit-any
export type Constructor<Inst, Params extends any[] = any[]> = new (...args: Params) => Inst;

export type Awaitable<T> = Promise<T> | T;

export type DeepPartial<T> = {
	[P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type DeepRequire<T> = {
	[P in keyof T]-?: T[P] extends object ? DeepRequire<T[P]> : T[P];
};

export type Keys<T, U extends (keyof T)[]> = Exclude<keyof T, U[number]> extends never ? U
	: U & ['Missing key: ', Exclude<keyof T, U[number]>];

// deno-lint-ignore no-explicit-any
export type AnyFunction = (...args: any[]) => any;

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
	return (...keys) => keys;
}

export type EnsureFullCoverage<T, S1 extends DeepPartial<T>, S2 extends DeepPartial<T>> = T extends DeepPartial<T>
	? (S1 & S2) extends T ? T
	: never
	: never;

export type PromiseControl = {
	resolve: (value: void | PromiseLike<void>) => void;
	reject: (reason?: unknown) => void;
};

export type JsonPrimitive = string | number | boolean | null;
export type JsonArray = JsonValue[];
export type JsonObject = { [key: string]: JsonValue };
export type JsonValue = JsonPrimitive | JsonArray | JsonObject;
export type Jsonable = string | number | boolean | null | Jsonable[] | { [key: string]: Jsonable };

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
	| BigUint64Array;

export type TypedArrayConstructor<T> = T extends Int8Array ? Int8ArrayConstructor
	: T extends Uint8Array ? Uint8ArrayConstructor
	: T extends Uint8ClampedArray ? Uint8ClampedArrayConstructor
	: T extends Int16Array ? Int16ArrayConstructor
	: T extends Uint16Array ? Uint16ArrayConstructor
	: T extends Int32Array ? Int32ArrayConstructor
	: T extends Float32Array ? Float32ArrayConstructor
	: T extends Float64Array ? Float64ArrayConstructor
	: T extends Uint32Array ? Uint32ArrayConstructor
	: never;
