// Unique symbol for storing metadata about the imagined object's access chain
export const META = Symbol('meta')

export type ImagineAccess =
  | { type: 'root'; identifier: string }
  | { type: 'get'; key: string }
  | { type: 'set'; key: string; value: any }
  | { type: 'invoke'; args: any[] }

/**
 * Metadata structure tracking object access path
 */
export type ImagineMeta<T, E> = {
  /**
   * Previous object in the access chain
   */
  previous?: Imagined<T, E>
  /**
   * Internal object reference
   */
  internal: Internal<T, E>
  /**
   * Access information for the current level
   */
  access: ImagineAccess
  /**
   * Access chain leading to the current level
   */
  get chain(): ImagineAccess[]
}

/**
 * Base type for imagined objects containing primitive conversion, metadata, and extended fields
 *
 * @template E - Extended type of the internal object
 */
export type Internal<T, E> =
  & {
    [Symbol.toPrimitive](): string
    [META]: ImagineMeta<T, E>
  }
  & { [K in symbol & keyof E]: E[K] }

/**
 * Converts primitive types to their object wrapper equivalents recursively
 *
 * @template T - Type of the input value
 */
export type ImaginePrimitive<T> = T extends number ? Number
  : T extends string ? String
  : T extends bigint ? BigInt
  : T extends boolean ? Boolean
  : T extends symbol ? Symbol
  : T extends Array<infer U> ? Array<ImaginePrimitive<U>>
  : T

/**
 * Recursive type that wraps all properties/methods of T with Imagined behavior
 *
 * @template T - Type of the imagined object
 * @template E - Extended type of the internal object
 */
export type Imagined<T, E> =
  & Internal<T, E>
  & {
    // Process each property/method of T
    [key in keyof T]: T[key] extends (...args: infer ArgsType) => infer ReturnType ?
        & Internal<T, E> // Add metadata to methods
        & ((
          // Allow both original and wrapped arguments
          ...args: { [K in keyof ArgsType]: ArgsType[K] | Imagined<ArgsType[K], E> }
        ) => Imagined<ImaginePrimitive<ReturnType>, E>) // Return wrapped return type
      : Imagined<ImaginePrimitive<T[key]>, E> // Wrap non-method properties recursively
  }

export type InternalExtender<T, E> = (extended: Internal<T, E>, internal: Internal<T, never>) => void

/**
 * Create proxied objects with access tracking
 *
 * @template T - Type of the imagined object
 * @template E - Extended type of the internal object
 *
 * @param extend - Function to extend the internal object
 * @param previous - Parent object for tracking access path
 * @param access - Access information for the current level
 *
 * @returns Imagined object with access tracking
 */
export function imagine<T, E = never>(
  extend?: undefined,
  access?: ImagineAccess,
  previous?: Imagined<T, E>,
): Imagined<T, E>
export function imagine<T, E>(
  extend: InternalExtender<T, E>,
  access?: ImagineAccess,
  previous?: Imagined<T, E>,
): Imagined<T, E>
export function imagine<T, E>(
  extend: InternalExtender<T, E> = (e) => e,
  access: ImagineAccess = { type: 'root', identifier: '' },
  previous?: Imagined<T, E>,
): Imagined<T, E> {
  const internal = (() => {}) as unknown as Internal<T, E>

  internal[Symbol.toPrimitive] = () => 'Imagined'
  internal[META] = {
    previous,
    internal,
    access,
    get chain(): ImagineAccess[] {
      const chain = [access]
      if (previous) {
        chain.unshift(...previous[META].chain)
      }
      return chain
    },
  }
  extend(internal, internal as Internal<T, never>)

  const imagined = new Proxy(internal, {
    get(target, key) {
      switch (typeof key) {
        case 'number':
        case 'string': {
          return imagine<T, E>(extend, { type: 'get', key }, imagined)
        }
        case 'symbol':
          return target[key as keyof typeof target]
      }
    },
    apply(_target, _thisArg, args) {
      return imagine<T, E>(extend, { type: 'invoke', args }, imagined)
    },
  }) as Imagined<T, E>

  return imagined
}
