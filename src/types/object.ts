/**
 * Patch `Source` into `Target`
 *
 * @template Target - The target object type to patch
 * @template Source - The source object type to patch from
 *
 * @example
 * ```ts
 * import { expect } from '@leawind/lay-sing/test-utils'
 *
 * type A = { a: 1; b: 2; }
 * type B = { b: string; c: 3 }
 * expect<Patch<A, B>>().toExtend<{ a: 1; b: string; c: 3 }>().success
 * ```
 */
export type Patch<Target, Source> = Omit<Target, keyof Source> & Source;
