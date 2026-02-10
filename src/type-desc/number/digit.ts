import { expect } from 'lay-sing'

export type Digit = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9
export type DigitChar = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9'
type DigitCharNum = { '0': 0; '1': 1; '2': 2; '3': 3; '4': 4; '5': 5; '6': 6; '7': 7; '8': 8; '9': 9 }

export type CharToDigit<C extends string> = C extends keyof DigitCharNum ? DigitCharNum[C] : never
{
  expect<CharToDigit<'0'>>().to.be<0>().pass
  expect<CharToDigit<'1' | '2'>>().to.be<1 | 2>().pass
}

type DIGIT_COMPARE_RESULT = [
  [0, -1, -1, -1, -1, -1, -1, -1, -1, -1], // A = 0
  [1, 0, -1, -1, -1, -1, -1, -1, -1, -1], // A = 1
  [1, 1, 0, -1, -1, -1, -1, -1, -1, -1], // A = 2
  [1, 1, 1, 0, -1, -1, -1, -1, -1, -1], // A = 3
  [1, 1, 1, 1, 0, -1, -1, -1, -1, -1], // A = 4
  [1, 1, 1, 1, 1, 0, -1, -1, -1, -1], // A = 5
  [1, 1, 1, 1, 1, 1, 0, -1, -1, -1], // A = 6
  [1, 1, 1, 1, 1, 1, 1, 0, -1, -1], // A = 7
  [1, 1, 1, 1, 1, 1, 1, 1, 0, -1], // A = 8
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 0], // A = 9
]
export type CompareDigit<A extends Digit, B extends Digit> = DIGIT_COMPARE_RESULT[A][B]
{
  expect<CompareDigit<0, 0>>().to.be<0>().pass
  expect<CompareDigit<9, 9>>().to.be<0>().pass

  expect<CompareDigit<1, 0>>().to.be<1>().pass
  expect<CompareDigit<9, 8>>().to.be<1>().pass

  expect<CompareDigit<0, 1>>().to.be<-1>().pass
  expect<CompareDigit<8, 9>>().to.be<-1>().pass
}

type DIGIT_ADD_RESULT = [
  [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [0, 9]],
  [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [0, 9], [1, 0]],
  [[0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [0, 9], [1, 0], [1, 1]],
  [[0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [0, 9], [1, 0], [1, 1], [1, 2]],
  [[0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [0, 9], [1, 0], [1, 1], [1, 2], [1, 3]],
  [[0, 5], [0, 6], [0, 7], [0, 8], [0, 9], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4]],
  [[0, 6], [0, 7], [0, 8], [0, 9], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5]],
  [[0, 7], [0, 8], [0, 9], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6]],
  [[0, 8], [0, 9], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7]],
  [[0, 9], [1, 0], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [1, 6], [1, 7], [1, 8]],
]
export type DigitAdd<
  A extends Digit,
  B extends Digit,
  Adv extends Digit = 0,
> = Adv extends 0 ? DIGIT_ADD_RESULT[A][B]
  : Adv extends 1 ? (DIGIT_ADD_RESULT[A][B] extends [infer a, infer b extends Digit] ? [a, DigitAdd<b, 1>[1]] : never)
  : never
{
  {
    expect<DigitAdd<0, 0>>().to.be<[0, 0]>().pass

    expect<DigitAdd<0, 1>>().to.be<[0, 1]>().pass
    expect<DigitAdd<0, 5>>().to.be<[0, 5]>().pass

    expect<DigitAdd<1, 0>>().to.be<[0, 1]>().pass
    expect<DigitAdd<2, 0>>().to.be<[0, 2]>().pass

    expect<DigitAdd<1, 5>>().to.be<[0, 6]>().pass
    expect<DigitAdd<1, 5>>().to.be<[0, 6]>().pass
    expect<DigitAdd<1, 2>>().to.be<[0, 3]>().pass

    expect<DigitAdd<5, 5>>().to.be<[1, 0]>().pass
    expect<DigitAdd<5, 6>>().to.be<[1, 1]>().pass
    expect<DigitAdd<5, 7>>().to.be<[1, 2]>().pass
    expect<DigitAdd<9, 9>>().to.be<[1, 8]>().pass
  }
  {
    expect<DigitAdd<0, 0, 1>>().to.be<[0, 1]>().pass
    expect<DigitAdd<0, 1, 1>>().to.be<[0, 2]>().pass
    expect<DigitAdd<5, 6, 1>>().to.be<[1, 2]>().pass
    expect<DigitAdd<9, 9, 1>>().to.be<[1, 9]>().pass
  }
}

type DIGIT_MULTIPLY_RESULT = [
  [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
  [[0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [0, 9]],
  [[0, 0], [0, 2], [0, 4], [0, 6], [0, 8], [1, 0], [1, 2], [1, 4], [1, 6], [1, 8]],
  [[0, 0], [0, 3], [0, 6], [0, 9], [1, 2], [1, 5], [1, 8], [2, 1], [2, 4], [2, 7]],
  [[0, 0], [0, 4], [0, 8], [1, 2], [1, 6], [2, 0], [2, 4], [2, 8], [3, 2], [3, 6]],
  [[0, 0], [0, 5], [1, 0], [1, 5], [2, 0], [2, 5], [3, 0], [3, 5], [4, 0], [4, 5]],
  [[0, 0], [0, 6], [1, 2], [1, 8], [2, 4], [3, 0], [3, 6], [4, 2], [4, 8], [5, 4]],
  [[0, 0], [0, 7], [1, 4], [2, 1], [2, 8], [3, 5], [4, 2], [4, 9], [5, 6], [6, 3]],
  [[0, 0], [0, 8], [1, 6], [2, 4], [3, 2], [4, 0], [4, 8], [5, 6], [6, 4], [7, 2]],
  [[0, 0], [0, 9], [1, 8], [2, 7], [3, 6], [4, 5], [5, 4], [6, 3], [7, 2], [8, 1]],
]
export type DigitMultiply<A extends Digit, B extends Digit> = DIGIT_MULTIPLY_RESULT[A][B]
