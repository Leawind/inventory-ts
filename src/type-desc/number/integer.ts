import { expect } from 'lay-sing'
import type { CharToDigit, Digit, DigitAdd, DigitChar } from './digit.ts'
import type { StringJoin } from '../string/index.ts'

export type IsIntegerString<T extends `${number}`> = T extends `${string}.${string}` ? false : true
{
  expect<IsIntegerString<'123'>>().to.be.true

  expect<IsIntegerString<'0'>>().to.be.true
  expect<IsIntegerString<'1'>>().to.be.true
  expect<IsIntegerString<'000'>>().to.be.true
  expect<IsIntegerString<'0123'>>().to.be.true

  expect<IsIntegerString<'.0'>>().to.be.false
  expect<IsIntegerString<'0.'>>().to.be.false
  expect<IsIntegerString<'0.0'>>().to.be.false
  expect<IsIntegerString<'.1'>>().to.be.false
  expect<IsIntegerString<'123.'>>().to.be.false
  expect<IsIntegerString<'123.456'>>().to.be.false
  expect<IsIntegerString<'123.456'>>().to.be.false
}

export type IntegerToDigitCharTuple<I extends `${number}`> = I extends DigitChar ? [I]
  : I extends `${infer A extends DigitChar}${infer Rest extends `${number}`}` ? [A, ...IntegerToDigitCharTuple<Rest>]
  : []
{
  expect<IntegerToDigitCharTuple<'1'>>().to.be<['1']>().pass
  expect<IntegerToDigitCharTuple<'123'>>().to.be<['1', '2', '3']>().pass
  expect<IntegerToDigitCharTuple<'123456'>>().to.be<['1', '2', '3', '4', '5', '6']>().pass
}

export type DigitCharTupleToDigitTuple<I extends readonly DigitChar[]> = I extends
  [infer A extends DigitChar, ...infer Rest extends readonly DigitChar[]]
  ? [CharToDigit<A>, ...DigitCharTupleToDigitTuple<Rest>]
  : []
{
  expect<DigitCharTupleToDigitTuple<[]>>().to.be<[]>().pass
  expect<DigitCharTupleToDigitTuple<['1']>>().to.be<[1]>().pass
  expect<DigitCharTupleToDigitTuple<['1', '2']>>().to.be<[1, 2]>().pass
  expect<DigitCharTupleToDigitTuple<['1', '2', '3']>>().to.be<[1, 2, 3]>().pass
}

export type IntegerToDigitTuple<I extends number> = DigitCharTupleToDigitTuple<IntegerToDigitCharTuple<`${I}`>>
{
  expect<IntegerToDigitTuple<0>>().to.be<[0]>().pass
  expect<IntegerToDigitTuple<1>>().to.be<[1]>().pass
  expect<IntegerToDigitTuple<123>>().to.be<[1, 2, 3]>().pass
  expect<IntegerToDigitTuple<123456>>().to.be<[1, 2, 3, 4, 5, 6]>().pass
}

type IsTupleLongerThan1<T extends readonly unknown[]> = T['length'] extends 0 ? false
  : T['length'] extends 1 ? false
  : true
{
  expect<IsTupleLongerThan1<[]>>().to.be.false
  expect<IsTupleLongerThan1<[1]>>().to.be.false

  expect<IsTupleLongerThan1<[1, 2]>>().to.be.true
  expect<IsTupleLongerThan1<[1, 2, 3]>>().to.be.true
  expect<IsTupleLongerThan1<[1, 2, 3, 4]>>().to.be.true
}

type GetPaddingTo<
  A extends readonly Digit[],
  B extends readonly Digit[],
> = A extends [Digit, ...infer ARest extends readonly Digit[]]
  ? (B extends [Digit, ...infer BRest extends readonly Digit[]] ? GetPaddingTo<ARest, BRest> : [])
  : (B extends [Digit, ...infer BRest extends readonly Digit[]] ? [0, ...GetPaddingTo<[], BRest>] : [])
{
  expect<GetPaddingTo<[], []>>().to.be<[]>().pass
  expect<GetPaddingTo<[0], [1]>>().to.be<[]>().pass
  expect<GetPaddingTo<[0, 1], [2, 1]>>().to.be<[]>().pass

  expect<GetPaddingTo<[], [1]>>().to.be<[0]>().pass
  expect<GetPaddingTo<[], [1, 2]>>().to.be<[0, 0]>().pass
  expect<GetPaddingTo<[1], [2, 3, 4]>>().to.be<[0, 0]>().pass
  expect<GetPaddingTo<[1, 2, 3], []>>().to.be<[]>().pass
  expect<GetPaddingTo<[1, 2, 3], [9, 8]>>().to.be<[]>().pass
  expect<GetPaddingTo<[1, 2, 3], [2, 3, 4]>>().to.be<[]>().pass
}

export type AlignDigitTupleTo<
  A extends readonly Digit[],
  B extends readonly Digit[],
> = [...GetPaddingTo<A, B>, ...A]
{
  // Same length
  {
    expect<AlignDigitTupleTo<[], []>>().to.be<[]>().pass
    expect<AlignDigitTupleTo<[0], [1]>>().to.be<[0]>().pass
    expect<AlignDigitTupleTo<[0, 1], [2, 1]>>().to.be<[0, 1]>().pass
    expect<AlignDigitTupleTo<[0, 1, 2], [3, 4, 5]>>().to.be<[0, 1, 2]>().pass
  }
  // A.length = 0
  {
    expect<AlignDigitTupleTo<[], []>>().to.be<[]>().pass
    expect<AlignDigitTupleTo<[], [1]>>().to.be<[0]>().pass
    expect<AlignDigitTupleTo<[], [1, 2]>>().to.be<[0, 0]>().pass
    expect<AlignDigitTupleTo<[], [1, 2, 3]>>().to.be<[0, 0, 0]>().pass
  }
  // A.length = 1
  {
    expect<AlignDigitTupleTo<[1], []>>().to.be<[1]>().pass
    expect<AlignDigitTupleTo<[1], [2]>>().to.be<[1]>().pass
    expect<AlignDigitTupleTo<[1], [2, 3]>>().to.be<[0, 1]>().pass
    expect<AlignDigitTupleTo<[1], [2, 3, 4]>>().to.be<[0, 0, 1]>().pass
    expect<AlignDigitTupleTo<[1], [2, 3, 4, 5]>>().to.be<[0, 0, 0, 1]>().pass
    expect<AlignDigitTupleTo<[1], [2, 3, 4, 5, 6]>>().to.be<[0, 0, 0, 0, 1]>().pass
  }
  // A.length = 2
  {
    expect<AlignDigitTupleTo<[1, 2], []>>().to.be<[1, 2]>().pass
    expect<AlignDigitTupleTo<[1, 2], [3]>>().to.be<[1, 2]>().pass
    expect<AlignDigitTupleTo<[1, 2], [3, 4]>>().to.be<[1, 2]>().pass
    expect<AlignDigitTupleTo<[1, 2], [3, 4, 5]>>().to.be<[0, 1, 2]>().pass
    expect<AlignDigitTupleTo<[1, 2], [3, 4, 5, 6]>>().to.be<[0, 0, 1, 2]>().pass
  }
  // A.length = 3
  {
    expect<AlignDigitTupleTo<[1, 2, 3], []>>().to.be<[1, 2, 3]>().pass
    expect<AlignDigitTupleTo<[1, 2, 3], [4]>>().to.be<[1, 2, 3]>().pass
    expect<AlignDigitTupleTo<[1, 2, 3], [4, 5]>>().to.be<[1, 2, 3]>().pass
    expect<AlignDigitTupleTo<[1, 2, 3], [4, 5, 6]>>().to.be<[1, 2, 3]>().pass
    expect<AlignDigitTupleTo<[1, 2, 3], [4, 5, 6, 7]>>().to.be<[0, 1, 2, 3]>().pass
    expect<AlignDigitTupleTo<[1, 2, 3], [4, 5, 6, 7, 8]>>().to.be<[0, 0, 1, 2, 3]>().pass
    expect<AlignDigitTupleTo<[1, 2, 3], [4, 5, 6, 7, 8, 9]>>().to.be<[0, 0, 0, 1, 2, 3]>().pass
  }
  // A.length is big
  {
    expect<AlignDigitTupleTo<[1, 2, 3, 4, 5, 6, 7, 8, 9], []>>().to.be<[1, 2, 3, 4, 5, 6, 7, 8, 9]>().pass
  }
}

type AlignDigitTuple<
  A extends readonly Digit[],
  B extends readonly Digit[],
> = [
  AlignDigitTupleTo<A, B>,
  AlignDigitTupleTo<B, A>,
]
{
  expect<AlignDigitTuple<[0], [1]>>().to.be<[[0], [1]]>().pass
  expect<AlignDigitTuple<[0, 1], [2, 1]>>().to.be<[[0, 1], [2, 1]]>().pass

  expect<AlignDigitTuple<[1, 2], [1]>>().to.be<[[1, 2], [0, 1]]>().pass
  expect<AlignDigitTuple<[1], [1, 2, 3]>>().to.be<[[0, 0, 1], [1, 2, 3]]>().pass
}

type RemovePrefixZero<T extends readonly Digit[]> = T extends [0, ...infer U extends readonly Digit[]]
  ? RemovePrefixZero<U>
  : T

type AlignedDigitTupleAdd<
  A extends readonly Digit[],
  B extends readonly Digit[],
  Adv extends Digit = 0,
  Result extends readonly Digit[] = [],
> = A extends [] ? (Adv extends 0 ? Result : [1, ...Result])
  : A extends [...infer ARest extends readonly Digit[], infer ALast extends Digit]
    ? B extends [...infer BRest extends readonly Digit[], infer BLast extends Digit]
      ? DigitAdd<ALast, BLast, Adv> extends [infer RAdv extends Digit, infer RAdd extends Digit]
        ? AlignedDigitTupleAdd<ARest, BRest, RAdv, [RAdd, ...Result]>
      : never
    : never
  : never
{
  {
    expect<AlignedDigitTupleAdd<[], [], 1, [0]>>()
    expect<AlignedDigitTupleAdd<[], []>>().to.be<[]>().pass
    expect<AlignedDigitTupleAdd<[], [], 0, [1]>>().to.be<[1]>().pass
    expect<AlignedDigitTupleAdd<[], [], 1, [1]>>().to.be<[1, 1]>().pass
    expect<AlignedDigitTupleAdd<[], [], 0, [1, 2]>>().to.be<[1, 2]>().pass
  }

  expect<AlignedDigitTupleAdd<[0], [0]>>().to.be<[0]>().pass
  expect<AlignedDigitTupleAdd<[1], [1]>>().to.be<[2]>().pass
  expect<AlignedDigitTupleAdd<[3], [4]>>().to.be<[7]>().pass
  expect<AlignedDigitTupleAdd<[1], [9]>>().to.be<[1, 0]>().pass
  expect<AlignedDigitTupleAdd<[7], [4]>>().to.be<[1, 1]>().pass
  expect<AlignedDigitTupleAdd<[9], [9]>>().to.be<[1, 8]>().pass

  expect<AlignedDigitTupleAdd<[0, 0, 0], [1, 2, 3]>>().to.be<[1, 2, 3]>().pass
  expect<AlignedDigitTupleAdd<[0], [0], 1>>().to.be<[1]>().pass
  expect<AlignedDigitTupleAdd<[9], [9], 1>>().to.be<[1, 9]>().pass

  expect<AlignedDigitTupleAdd<[0, 0], [2, 1]>>().to.be<[2, 1]>().pass
  expect<AlignedDigitTupleAdd<[1, 2], [3, 4]>>().to.be<[4, 6]>().pass
  expect<AlignedDigitTupleAdd<[2, 7], [5, 8]>>().to.be<[8, 5]>().pass
  expect<AlignedDigitTupleAdd<[1, 2, 3], [4, 5, 6]>>().to.be<[5, 7, 9]>().pass
  expect<AlignedDigitTupleAdd<[0, 0, 7], [1, 9, 8]>>().to.be<[1, 0, 5]>().pass
  expect<AlignedDigitTupleAdd<[5, 6, 7], [7, 9, 8]>>().to.be<[1, 3, 6, 5]>().pass
}

export type IntegerAdd<
  A extends number,
  B extends number,
> = AlignDigitTuple<
  IntegerToDigitTuple<A>,
  IntegerToDigitTuple<B>
> extends [
  infer A extends readonly Digit[],
  infer B extends readonly Digit[],
] ? StringJoin<AlignedDigitTupleAdd<A, B>> extends `${infer N extends number}` ? N : never
  : never
{
  expect<IntegerAdd<1, 2>>().to.be<3>().pass
  expect<IntegerAdd<1, 3>>().to.be<4>().pass
  expect<IntegerAdd<3, 4>>().to.be<7>().pass
  expect<IntegerAdd<5, 5>>().to.be<10>().pass
  expect<IntegerAdd<123, 42423>>().to.be<42546>().pass
}
