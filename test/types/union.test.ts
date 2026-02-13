import { expect } from 'lay-sing'
import type { UnionToIntersection, UnionToTuple } from '../../src/types/union.ts'

type A = { a: string; b: number }
type B = { a: number; b: number; c: symbol }
type C = { b: number; c: boolean }

{
  expect<UnionToIntersection<3 | 4 | 5>>().to.be<3 & 4 & 5>().pass
  expect<UnionToIntersection<A | B | C>>().to.be<A & B & C>().pass
  expect<UnionToIntersection<A | C>>().to.be<A & C>().pass
}

{
  expect<UnionToTuple<never>>().to.be<[]>().pass
  expect<UnionToTuple<any>>().to.be<[any]>().pass
  expect<UnionToTuple<unknown>>().to.be<[unknown]>().pass

  expect<UnionToTuple<3 | 4 | 5>>().to.be<[3, 4, 5]>().pass
  expect<UnionToTuple<string | number>>().to.be<[string, number]>().pass
  expect<UnionToTuple<number | string>>().to.be<[string, number]>().pass

  expect<UnionToTuple<A | B | C>>().to.be<[A, B, C]>().pass
  expect<UnionToTuple<C | B | A>>().to.be<[A, B, C]>().pass
  expect<UnionToTuple<A | A>>().to.be<[A]>().pass
}
