import { expect } from 'lay-sing'
import type { IntersectionOf, UnionOf } from '../../src/types/index.ts'

type A = { a: string; b: number }
type B = { a: number; b: number; c: symbol }
type C = { b: number; c: boolean }
{
  expect<IntersectionOf<[]>>().to.be.unknown
  expect<IntersectionOf<[A]>>().to.be<A>().pass

  expect<IntersectionOf<[A, B]>>().to.be<A & B>().pass
  expect<IntersectionOf<[B, C]>>().to.be<B & C>().pass
  expect<IntersectionOf<[A, C]>>().to.be<A & C>().pass

  expect<IntersectionOf<[A, B, C]>>().to.be<A & B & C>().pass
  expect<IntersectionOf<never>>().to.be.never
}
{
  expect<UnionOf<[]>>().to.be.never

  expect<UnionOf<[A]>>().to.be<A>().pass

  expect<UnionOf<[A, B]>>().to.be<A | B>().pass
  expect<UnionOf<[B, C]>>().to.be<B | C>().pass
  expect<UnionOf<[A, C]>>().to.be<A | C>().pass

  expect<UnionOf<[A, B, C]>>().to.be<A | B | C>().pass
  expect<UnionOf<never>>().to.be.never

  expect<UnionOf<[A, B] | [A, C]>>().to.be<A | B | C>().pass
}
