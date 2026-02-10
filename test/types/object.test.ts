import { expect } from 'lay-sing'
import type { Access, DeepPartial, DeepRequire, InverseAccess, Patch } from '../../src/types/index.ts'

// DeepPartial
{
  type MyObject = { a: string; b?: number; c: boolean }
  expect<DeepPartial<MyObject>>().to.be<{ a?: string; b?: number; c?: boolean }>().pass
}
// DeepRequire
{
  expect<DeepRequire<{ a?: 1; b?: 2 }>>().to.be<{ a: 1; b: 2 }>().pass
  expect<DeepRequire<{ a: 1 | undefined; b?: 2 }>>().to.be<{ a: 1 | undefined; b: 2 }>().pass

  expect<DeepRequire<{ _?: 1 }>>().to.be<{ _: 1 }>().pass
  expect<DeepRequire<{ _?: { _?: 1 } }>>().to.be<{ _: { _: 1 } }>().pass
  expect<DeepRequire<{ _?: { _?: { _?: 1 } } }>>().to.be<{ _: { _: { _: 1 } } }>().pass

  type NestedType = { a?: string; b: number; nested?: { c?: string } }
  expect<DeepRequire<NestedType>['nested']>().to.be<{ c: string }>().pass
}
{
  type A = { a: string; b?: number; c: boolean }
  type B = { a: bigint; b?: symbol; c: string }

  expect<Access<A, 'a'>>().to.be<string>().pass
  expect<Access<A, 'b'>>().to.be<number | undefined>().pass
  expect<Access<A, 'x', 'default'>>().to.be<'default'>().pass

  expect<Access<A, 'a' | 'b'>>().to.be<string | number | undefined>().pass
  expect<Access<A, 'a' | 'c'>>().to.be<string | boolean>().pass

  expect<Access<A | B, 'a'>>().to.be<string | bigint>().pass
  expect<Access<A | B, 'a' | 'c'>>().to.be<string | bigint | boolean>().pass
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
    expect<M<'a'>>().to.be<1>().pass
    expect<M<'b'>>().to.be<2>().pass
    expect<M<'c'>>().to.be<3>().pass
  }
  {
    expect<W<1>>().to.be<'a'>().pass
    expect<W<2>>().to.be<'b'>().pass
    expect<W<3>>().to.be<'c'>().pass

    expect<W<1 | 2>>().to.be<'a' | 'b'>().pass

    expect<W<4>>().to.be.never
    expect<W<'a'>>().to.be.never
    expect<W<never>>().to.be.never
    expect<W<unknown>>().to.be<'a' | 'b' | 'c'>().pass
    expect<W<any>>().to.be<'a' | 'b' | 'c'>().pass
  }
}

{
  expect<Patch<{ a: 1; b: 2 }, { b: string; c: 3 }>>()
    .to.equal<{ a: 1; b: string; c: 3 }>().pass

  {
    type A = { a: 1; b: 2; c: 3 }
    type B = { b: 4; c: 5; d: 6 }

    expect<Patch<A, B>>().to.be<{ a: 1 } & { b: 4; c: 5; d: 6 }>().pass
    expect<Patch<A, B>>().to.equal<{ a: 1; b: 4; c: 5; d: 6 }>().pass
    expect<Patch<A, A>>().to.equal<A>().pass

    expect<Patch<A, unknown>>().to.be<A>().pass
    expect<Patch<A, any>>().to.be.any
    expect<Patch<A, never>>().to.be.never
  }

  {
    // Test with empty objects
    expect<Patch<{}, {}>>().to.equal<{}>().pass
    expect<Patch<{ a: 1 }, {}>>().to.equal<{ a: 1 }>().pass
    expect<Patch<{}, { a: 1 }>>().to.equal<{ a: 1 }>().pass

    // Test with optional properties
    type WithOptional = { a?: string; b: number }
    type SourceWithOptional = { a: boolean; c?: string }
    expect<Patch<WithOptional, SourceWithOptional>>()
      .to.equal<{ a: boolean; b: number; c?: string }>().pass

    // Test with function types
    type WithFunction = { fn(): string; x: number }
    type SourceWithFunction = { fn(): number; y: boolean }
    expect<Patch<WithFunction, SourceWithFunction>>()
      .to.equal<{ fn(): number; x: number; y: boolean }>().pass

    // Test with nested objects
    type Nested = { a: string; nested: { x: number; y: string } }
    type SourceNested = { b: boolean; nested: { x: boolean; z: number } }
    expect<Patch<Nested, SourceNested>>()
      .to.equal<{ a: string; b: boolean; nested: { x: boolean; z: number } }>().pass

    // Test with union types
    type UnionTarget = { a: string | number; b: boolean }
    type UnionSource = { a: bigint; c: symbol }
    expect<Patch<UnionTarget, UnionSource>>()
      .to.equal<{ a: bigint; b: boolean; c: symbol }>().pass

    // Test with generic types
    type GenericTarget<T> = { value: T; id: string }
    type GenericSource<U> = { value: U; extra: boolean }
    expect<Patch<GenericTarget<number>, GenericSource<string>>>()
      .to.equal<{ value: string; id: string; extra: boolean }>().pass

    // Test with intersection types
    type IntersectionSource = { a: number } & { b: string }
    expect<Patch<{ c: boolean }, IntersectionSource>>()
      .to.equal<{ c: boolean } & { a: number; b: string }>().pass

    // Test with indexed access types
    type IndexedTarget = { a: string; b: number }
    type KeyFromTarget = keyof IndexedTarget
    expect<Patch<IndexedTarget, { [K in Exclude<KeyFromTarget, 'a'>]: boolean }>>()
      .to.equal<{ a: string; b: boolean }>().pass
  }
}
