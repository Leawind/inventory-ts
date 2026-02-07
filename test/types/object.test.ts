import { compare, expect } from 'lay-sing/test-utils'
import type { Access, DeepPartial, DeepRequire, InverseAccess, Patch } from '../../src/types/index.ts'

// DeepPartial
{
  type MyObject = { a: string; b?: number; c: boolean }
  expect<DeepPartial<MyObject>>().toBe<{ a?: string; b?: number; c?: boolean }>().success
}
// DeepRequire
{
  expect<DeepRequire<{ a?: 1; b?: 2 }>>().toBe<{ a: 1; b: 2 }>().success
  expect<DeepRequire<{ a: 1 | undefined; b?: 2 }>>().toBe<{ a: 1 | undefined; b: 2 }>().success

  expect<DeepRequire<{ _?: 1 }>>().toBe<{ _: 1 }>().success
  expect<DeepRequire<{ _?: { _?: 1 } }>>().toBe<{ _: { _: 1 } }>().success
  expect<DeepRequire<{ _?: { _?: { _?: 1 } } }>>().toBe<{ _: { _: { _: 1 } } }>().success

  type NestedType = { a?: string; b: number; nested?: { c?: string } }
  expect<DeepRequire<NestedType>['nested']>().toBe<{ c: string }>().success
}
{
  type A = { a: string; b?: number; c: boolean }
  type B = { a: bigint; b?: symbol; c: string }

  expect<Access<A, 'a'>>().toBe<string>().success
  expect<Access<A, 'b'>>().toBe<number | undefined>().success
  expect<Access<A, 'x', 'default'>>().toBe<'default'>().success

  expect<Access<A, 'a' | 'b'>>().toBe<string | number | undefined>().success
  expect<Access<A, 'a' | 'c'>>().toBe<string | boolean>().success

  expect<Access<A | B, 'a'>>().toBe<string | bigint>().success
  expect<Access<A | B, 'a' | 'c'>>().toBe<string | bigint | boolean>().success
}

{
  type A = {
    a: 1
    b: 2
    c: 3
  }

  type M<K extends keyof A> = A[K]
  type W<V> = InverseAccess<A, V>
  {
    expect<M<'a'>>().toBe<1>().success
    expect<M<'b'>>().toBe<2>().success
    expect<M<'c'>>().toBe<3>().success
  }
  {
    expect<W<1>>().toBe<'a'>().success
    expect<W<2>>().toBe<'b'>().success
    expect<W<3>>().toBe<'c'>().success

    expect<W<1 | 2>>().toBe<'a' | 'b'>().success

    expect<W<4>>().toBeNever
    expect<W<'a'>>().toBeNever
    expect<W<never>>().toBeNever
    expect<W<unknown>>().toBe<'a' | 'b' | 'c'>().success
    expect<W<any>>().toBe<'a' | 'b' | 'c'>().success
  }
}

{
  compare<
    Patch<
      { a: 1; b: 2 },
      { b: string; c: 3 }
    >,
    { a: 1; b: string; c: 3 }
  >().mutuallyAssignable

  {
    type A = { a: 1; b: 2; c: 3 }
    type B = { b: 4; c: 5; d: 6 }

    expect<Patch<A, B>>().toBe<{ a: 1 } & { b: 4; c: 5; d: 6 }>().success
    expect<Patch<A, B>>().toEqual<{ a: 1; b: 4; c: 5; d: 6 }>().success
    expect<Patch<A, A>>().toEqual<A>().success

    expect<Patch<A, unknown>>().toBe<A>().success
    expect<Patch<A, any>>().toBeAny
    expect<Patch<A, never>>().toBeNever
  }

  {
    // Test with empty objects
    expect<Patch<{}, {}>>().toEqual<{}>().success
    expect<Patch<{ a: 1 }, {}>>().toEqual<{ a: 1 }>().success
    expect<Patch<{}, { a: 1 }>>().toEqual<{ a: 1 }>().success

    // Test with optional properties
    type WithOptional = { a?: string; b: number }
    type SourceWithOptional = { a: boolean; c?: string }
    expect<Patch<WithOptional, SourceWithOptional>>()
      .toEqual<{ a: boolean; b: number; c?: string }>().success

    // Test with function types
    type WithFunction = { fn(): string; x: number }
    type SourceWithFunction = { fn(): number; y: boolean }
    expect<Patch<WithFunction, SourceWithFunction>>()
      .toEqual<{ fn(): number; x: number; y: boolean }>().success

    // Test with nested objects
    type Nested = { a: string; nested: { x: number; y: string } }
    type SourceNested = { b: boolean; nested: { x: boolean; z: number } }
    expect<Patch<Nested, SourceNested>>()
      .toEqual<{ a: string; b: boolean; nested: { x: boolean; z: number } }>().success

    // Test with union types
    type UnionTarget = { a: string | number; b: boolean }
    type UnionSource = { a: bigint; c: symbol }
    expect<Patch<UnionTarget, UnionSource>>()
      .toEqual<{ a: bigint; b: boolean; c: symbol }>().success

    // Test with generic types
    type GenericTarget<T> = { value: T; id: string }
    type GenericSource<U> = { value: U; extra: boolean }
    expect<Patch<GenericTarget<number>, GenericSource<string>>>()
      .toEqual<{ value: string; id: string; extra: boolean }>().success

    // Test with intersection types
    type IntersectionSource = { a: number } & { b: string }
    expect<Patch<{ c: boolean }, IntersectionSource>>()
      .toEqual<{ c: boolean } & { a: number; b: string }>().success

    // Test with indexed access types
    type IndexedTarget = { a: string; b: number }
    type KeyFromTarget = keyof IndexedTarget
    expect<Patch<IndexedTarget, { [K in Exclude<KeyFromTarget, 'a'>]: boolean }>>()
      .toEqual<{ a: string; b: boolean }>().success
  }
}
