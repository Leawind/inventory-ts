import type { AnyFunction, Case, Same, SwitchExtends } from '../types/index.ts';

type AsIs = AnyFunction | string | number | boolean | bigint | symbol;
enum ValueType {
	Undefined = 'undefined',
	AsIs = 'as-is',
	Array = 'array',
	Object = 'object',
}

type TypeOf<T> = T extends undefined ? ValueType.Undefined
	: T extends AsIs ? ValueType.AsIs
	: T extends readonly unknown[] ? ValueType.Array
	: ValueType.Object;
function typeOf<T>(value: T): TypeOf<T> {
	type Returned = TypeOf<T>;
	if (value === undefined) {
		return ValueType.Undefined as Returned;
	}
	if (Array.isArray(value)) {
		return ValueType.Array as Returned;
	}
	if (typeof value === 'object') {
		if (value === null) {
			return ValueType.AsIs as Returned;
		} else {
			return ValueType.Object as Returned;
		}
	}
	if (typeof value === 'function') {
		return ValueType.AsIs as Returned;
	}
	return ValueType.AsIs as Returned;
}

type UndefinedOptions = 'replace' | 'ignore';
type ArrayOptions = 'concat-tail' | 'concat-head' | 'replace' | 'union';

/**
 * Options for controlling how objects are overwritten during merge operations
 */
type OverwriteOptions<
	Ou extends UndefinedOptions = UndefinedOptions,
	Oa extends ArrayOptions = ArrayOptions,
> = {
	/**
	 * Controls how undefined values are handled during overwrite operations:
	 *
	 * - **replace**: If `source.attr` is `undefined`, set `target.attr` to `undefined`
	 * - **ignore**: Ignore `undefined` values in `source`
	 *
	 * Default: `replace`
	 */
	undefined: Ou;

	/**
	 * Controls how array values are merged during overwrite operations:
	 *
	 * - **concat-tail**: append to array tail
	 * - **concat-head**: append to array head
	 * - **replace**: replace with new array
	 * - **union**: like set union
	 *
	 * Default: `concat-tail`
	 */
	array: Oa;
};

const DEFAULT_OPTIONS: OverwriteOptions<'replace', 'concat-tail'> = {
	undefined: 'replace',
	array: 'concat-tail',
};

type AssertExtends<T, A> = T extends A ? T : never;

type ConcatArray<A, B> = A extends readonly unknown[] ? B extends readonly unknown[] ? [...A, ...B] : never
	: never;

type Includes<Tuple extends readonly unknown[], Element> = Tuple extends readonly [infer First, ...infer Rest]
	? (Same<Element, First> extends true ? true : Includes<Rest, Element>)
	: false;
type PushIfNotExists<Tuple extends readonly unknown[], Element> = Includes<Tuple, Element> extends true ? Tuple
	: [...Tuple, Element];
type UnionArray<
	A,
	B,
	R extends readonly unknown[] = AssertExtends<A, readonly unknown[]>,
> = B extends readonly [infer First, ...infer Rest] ? UnionArray<A, Rest, PushIfNotExists<R, First>>
	: R;

/**
 * Type definition for the result of an overwrite operation.
 * This type describes how the target and source objects are merged based on the options provided.
 *
 * @template T The type of the target object
 * @template S The type of the source object
 * @template Opts The options for overwriting
 */
export type Overwrite<
	T,
	S,
	Opts extends OverwriteOptions,
	Ou extends UndefinedOptions = Opts extends OverwriteOptions<infer X> ? X : never,
	Oa extends ArrayOptions = Opts extends OverwriteOptions<infer _X, infer Y> ? Y : never,
> = S extends undefined ? (SwitchExtends<Ou, [
		Case<'replace', S>,
		Case<'ignore', T>,
	]>)
	: TypeOf<T> extends TypeOf<S> ? (
			SwitchExtends<TypeOf<S>, [
				Case<ValueType.AsIs, S>,
				Case<
					ValueType.Array,
					SwitchExtends<Oa, [
						Case<'replace', S>,
						Case<'concat-tail', ConcatArray<T, S>>,
						Case<'concat-head', ConcatArray<S, T>>,
						Case<'union', UnionArray<T, S>>,
					]>
				>,
				Case<
					ValueType.Object,
					{
						[k in keyof T | keyof S]: k extends keyof S ? (k extends keyof T ? Overwrite<T[k], S[k], Opts>
								: S[k])
							: T[AssertExtends<k, keyof T>];
					}
				>,
			]>
		)
	: S;

/**
 * Merges two objects with configurable behavior for handling special cases like undefined values and arrays.
 *
 * The function mutates the target object in place and returns it.
 *
 * ### Examples
 *
 * Basic object merging
 * ```ts
 * const target = { a: 1, b: 2 };
 * const source = { b: 3, c: 4 };
 * const result = overwrite(target, source);
 * // Result: { a: 1, b: 3, c: 4 }
 * ```
 *
 * Array concatenation (default behavior)
 *
 * ```ts
 * const target = { arr: [1, 2] };
 * const source = { arr: [3, 4] };
 * const result = overwrite(target, source);
 * // Result: { arr: [1, 2, 3, 4] }
 * ```
 *
 * Array replacement
 *
 * ```ts
 * const target = { arr: [1, 2] };
 * const source = { arr: [3, 4] };
 * const result = overwrite(target, source, { array: 'replace' });
 * // Result: { arr: [3, 4] }
 * ```
 *
 * Ignoring undefined values
 *
 * ```ts
 * const target = { a: 1, b: 2 };
 * const source = { a: undefined, c: 3 };
 * const result = overwrite(target, source, { undefined: 'ignore' });
 * // Result: { a: 1, b: 2, c: 3 }
 * ```
 *
 * @param target The object to merge into (will be mutated)
 * @param source The object to merge from
 * @param options Options for controlling the overwrite behavior
 * @returns The mutated target object with properties from source merged in
 */
export function overwrite<
	T,
	S,
	Ou extends UndefinedOptions = typeof DEFAULT_OPTIONS['undefined'],
	Oa extends ArrayOptions = typeof DEFAULT_OPTIONS['array'],
	Opts extends OverwriteOptions = OverwriteOptions<Ou, Oa>,
>(target: T, source: S, options?: Partial<OverwriteOptions<Ou, Oa>>): Overwrite<T, S, Opts> {
	type Returned = Overwrite<T, S, Opts>;
	const opts: OverwriteOptions = Object.assign({}, DEFAULT_OPTIONS, options);
	if (source === undefined) {
		switch (opts.undefined) {
			case 'ignore':
				return target as Returned;
			default:
				return undefined as Returned;
		}
	}

	const targetType = typeOf(target);
	const sourceType = typeOf(source);

	if (targetType === sourceType) {
		// targetType == sourceType != undefined

		switch (sourceType) {
			case ValueType.AsIs:
				return source as Returned;
			case ValueType.Array: {
				const targetArray = target as unknown[];
				switch (opts.array) {
					case 'replace':
						return source as Returned;
					case 'concat-tail':
						targetArray.push(...(source as unknown[]));
						break;
					case 'concat-head':
						targetArray.unshift(...(source as unknown[]));
						break;
					case 'union': {
						const set = new Set(targetArray);
						for (const value of source as unknown[]) {
							if (!set.has(value)) {
								set.add(value);
								targetArray.push(value);
							}
						}
						break;
					}
					default:
						throw new Error(`Unreachable`);
				}
				return target as Returned;
			}
			case ValueType.Object: {
				// deno-lint-ignore no-explicit-any
				const anyTarget = target as any;
				for (const key in source) {
					anyTarget[key] = overwrite(anyTarget[key], source[key], options);
				}
				return target as Returned;
			}
			default:
				throw new Error(`Unreachable`);
		}
	} else {
		return source as Returned;
	}
}
