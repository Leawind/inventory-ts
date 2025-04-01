// deno-lint-ignore-file ban-types

// Unique symbol for storing metadata about the imagined object's access chain
export const META = Symbol('meta');

/**
 * Base type for imagined objects containing primitive conversion and metadata
 */
export type ImagineInternalType = {
	[Symbol.toPrimitive](): string;
	[META]: ImagineMeta;
};

/**
 * Metadata structure tracking object access path
 */
export type ImagineMeta = {
	/**
	 * Access chain record:
	 * - `string`: Property access (field name)
	 * - `unknown[]`: Method call (arguments array)
	 */
	chain: (string | unknown[])[];
};

/**
 * Converts primitive types to their object wrapper equivalents recursively
 */
export type ImaginePrimitive<T> = T extends number ? Number
	: T extends string ? String
	: T extends bigint ? BigInt
	: T extends boolean ? Boolean
	: T extends symbol ? Symbol
	: T extends Array<infer U> ? Array<ImaginePrimitive<U>>
	: T;

/**
 * Recursive type that wraps all properties/methods of T with Imagined behavior
 */
export type Imagined<T> =
	& ImagineInternalType // Base metadata capabilities
	& {
		// Process each property/method of T
		[key in keyof T]: T[key] extends (...args: infer ArgsType) => infer ReturnType ?
				& ImagineInternalType // Add metadata to methods
				& ((
					// Allow both original and wrapped arguments
					...args: { [K in keyof ArgsType]: ArgsType[K] | Imagined<ArgsType[K]> }
				) => Imagined<ImaginePrimitive<ReturnType>>) // Return wrapped return type
			: Imagined<ImaginePrimitive<T[key]>>; // Wrap non-method properties recursively
	};

/**
 * Factory function creating proxied objects with access tracking
 */
export function imagine<T>(parent?: Imagined<T>): Imagined<T> {
	const internal = (() => {}) as unknown as ImagineInternalType;
	internal[Symbol.toPrimitive] = () => 'Imagined';
	internal[META] = {
		chain: parent === undefined ? [] : [...parent[META].chain],
	};

	const imagined = new Proxy(internal, {
		get(_target, key) {
			switch (typeof key) {
				case 'number':
				case 'string': {
					const newImagined = imagine<T>(imagined);
					newImagined[META].chain.push(key);
					return newImagined;
				}
				case 'symbol':
					return internal[key as keyof typeof internal];
			}
		},
		apply(_target, _thisArg, args) {
			const newImagined = imagine<T>(imagined);
			newImagined[META].chain.push(args);
			return newImagined;
		},
	}) as Imagined<T>;
	return imagined;
}
