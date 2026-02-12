import { expect } from 'lay-sing'
import type { DescribeType } from './index.ts'
import type { StringJoin } from '../string/index.ts'

type IsTuple<T extends readonly any[]> = number extends T['length'] ? false : true

{
  type A = number[] | [1, 2]

  expect<A['length']>().to.be

  expect<IsTuple<[number]>>().to.be.true
  expect<IsTuple<number[]>>().to.be.false

  expect<IsTuple<A>>().to.be.false
}

type IsReadonly<T extends readonly unknown[]> = T extends unknown[] ? false : true
{
  expect<IsReadonly<[]>>().to.be.false
  expect<IsReadonly<readonly []>>().to.be.true

  expect<IsReadonly<[readonly []]>>().to.be.false

  expect<IsReadonly<readonly 1[]>>().to.be.true
  expect<IsReadonly<readonly [[]]>>().to.be.true

  expect<IsReadonly<[1, 2]>>().to.be.false
  expect<IsReadonly<readonly [1, 2]>>().to.be.true
}

type WritableTuple<T extends readonly unknown[]> = T extends readonly [...infer E] ? [...E] : never
{
  expect<WritableTuple<1[]>>().to.equal<1[]>().pass
  expect<WritableTuple<[1, 2]>>().to.equal<[1, 2]>().pass

  expect<WritableTuple<readonly 1[]>>().to.equal<1[]>().pass
  expect<WritableTuple<readonly [1, 2]>>().to.equal<[1, 2]>().pass

  // nested
  expect<WritableTuple<(readonly 1[])[]>>().to.equal<(readonly 1[])[]>().pass
  expect<WritableTuple<[readonly 1[], readonly 2[]]>>().to.equal<[readonly 1[], readonly 2[]]>().pass

  expect<WritableTuple<readonly (readonly 1[])[]>>().to.equal<(readonly 1[])[]>().pass
  expect<WritableTuple<readonly [readonly 1[], readonly 2[]]>>().to.equal<[readonly 1[], readonly 2[]]>().pass
}

type DescribeArray<Arr extends readonly unknown[]> = Arr extends readonly (infer U)[] ? `${DescribeType<U>}[]` : never

type MapElements<T extends readonly unknown[]> = WritableTuple<T> extends [infer First, ...infer Rest extends unknown[]]
  ? [DescribeType<First>, ...MapElements<Rest>]
  : []
{
  expect<MapElements<[1, 2]>>().to.equal<['1', '2']>().pass
  expect<MapElements<readonly [1, 2]>>().to.equal<['1', '2']>().pass
}

type DescribeTuple<
  T extends readonly unknown[],
> = `[${StringJoin<MapElements<T>, ', '>}]`
{
  expect<DescribeTuple<[1, 2]>>().to.be<'[1, 2]'>().pass
  expect<DescribeTuple<readonly [1, 2]>>().to.be<'[1, 2]'>().pass
}

type DescribeReadonly<T extends readonly unknown[], S extends string> = IsReadonly<T> extends true ? `readonly ${S}` : S

export type DescribeArrayOrTuple<T extends readonly unknown[]> = DescribeReadonly<
  T,
  IsTuple<T> extends true ? DescribeTuple<T> : DescribeArray<T>
>

{
  expect<DescribeArrayOrTuple<number[]>>().to.be<'number[]'>().pass
  expect<DescribeArrayOrTuple<[1[], 2[][]]>>().to.be<'[1[], 2[][]]'>().pass

  expect<DescribeArrayOrTuple<[]>>().to.be<'[]'>().pass
  expect<DescribeArrayOrTuple<[][][][]>>().to.be<'[][][][]'>().pass
  expect<DescribeArrayOrTuple<[[], [[]], [[[]]]]>>().to.be<'[[], [[]], [[[]]]]'>().pass

  expect<DescribeArrayOrTuple<[1]>>().to.be<'[1]'>().pass
  expect<DescribeArrayOrTuple<[1, 2]>>().to.be<'[1, 2]'>().pass
  expect<DescribeArrayOrTuple<[1, 2, 3]>>().to.be<'[1, 2, 3]'>().pass

  expect<DescribeArrayOrTuple<[[1, 2]]>>().to.be<'[[1, 2]]'>().pass
  expect<DescribeArrayOrTuple<[1, [2, [3, [4, [5]]]]]>>().to.be<'[1, [2, [3, [4, [5]]]]]'>().pass
}
