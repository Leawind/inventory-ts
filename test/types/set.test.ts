import { expect } from 'lay-sing'
import type { IntersectionOf, UnionOf } from '../../src/types/index.ts'

type A = { a: string; b: number }
type B = { a: number; b: number; c: symbol }
type C = { b: number; c: boolean }
{
  expect<IntersectionOf<[]>>().toBeUnknown
  expect<IntersectionOf<[A]>>().toBe<A>().success

  expect<IntersectionOf<[A, B]>>().toBe<A & B>().success
  expect<IntersectionOf<[B, C]>>().toBe<B & C>().success
  expect<IntersectionOf<[A, C]>>().toBe<A & C>().success

  expect<IntersectionOf<[A, B, C]>>().toBe<A & B & C>().success
  expect<IntersectionOf<never>>().toBeNever
}
{
  expect<UnionOf<[]>>().toBeNever

  expect<UnionOf<[A]>>().toBe<A>().success

  expect<UnionOf<[A, B]>>().toBe<A | B>().success
  expect<UnionOf<[B, C]>>().toBe<B | C>().success
  expect<UnionOf<[A, C]>>().toBe<A | C>().success

  expect<UnionOf<[A, B, C]>>().toBe<A | B | C>().success
  expect<UnionOf<never>>().toBeNever

  expect<UnionOf<[A, B] | [A, C]>>().toBe<A | B | C>().success
}
