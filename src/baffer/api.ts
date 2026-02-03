import type { Baffer } from './index.ts'

type IorU = 'I' | 'U'

type NumberBits = 16 | 24 | 32 | 40 | 48
type NumberKeys = `${IorU}8` | `${IorU}${NumberBits}${'LE' | 'BE'}`

type BigIntBits = 56 | 64
type BigIntKeys = `${IorU}${BigIntBits}${'LE' | 'BE'}`

export type BytesProvider = NumberReaderBaffer | ArrayBufferLike

export type NumberReaderBaffer =
  & {
    [K in `get${NumberKeys}`]: (index: number) => number
  }
  & { [K in `get${BigIntKeys}`]: (index: number) => bigint }
  & {
    [K in `read${NumberKeys}`]: () => number
  }
  & { [K in `read${BigIntKeys}`]: () => bigint }

export type NumberWriterBaffer =
  & {
    [K in `set${NumberKeys}`]: (index: number, value: number) => number
  }
  & { [K in `set${BigIntKeys}`]: (index: number, value: bigint) => number }
  & {
    [K in `write${NumberKeys}`]: (value: number) => Baffer
  }
  & { [K in `write${BigIntKeys}`]: (value: bigint) => Baffer }
