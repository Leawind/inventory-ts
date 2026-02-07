import { expect } from 'lay-sing/test-utils'
import type { IntersectOf, UnionOf } from 'lay-sing'

type A = { a: string; b: number }
type B = { a: number; b: number; c: symbol }
type C = { b: number; c: boolean }
{
  expect<IntersectOf<[A, B]>>().toBe<A & B>().success
  expect<IntersectOf<[B, C]>>().toBe<B & C>().success
  expect<IntersectOf<[A, C]>>().toBe<A & C>().success

  expect<IntersectOf<[A, B, C]>>().toBe<A & B & C>().success
  expect<IntersectOf<never>>().toBeNever
}
{
  expect<UnionOf<[A, B]>>().toBe<A | B>().success
  expect<UnionOf<[B, C]>>().toBe<B | C>().success
  expect<UnionOf<[A, C]>>().toBe<A | C>().success

  expect<UnionOf<[A, B, C]>>().toBe<A | B | C>().success
  expect<UnionOf<never>>().toBeNever

  expect<UnionOf<[A, B] | [A, C]>>().toBe<A | B | C>().success
}
