import { expect } from '@leawind/lay-sing/test-utils'
import type { Replace } from '../index.ts'

Deno.test('list fields', () => {
  type Keys<T, U extends (keyof T)[]> = Exclude<keyof T, U[number]> extends never ? U
    : U & ['Missing key: ', Exclude<keyof T, U[number]>]

  function listKeys<T>(): <U extends (keyof T)[]>(...keys: Keys<T, U>) => Keys<T, U> {
    return (...keys) => keys
  }

  type RemoteObj = {
    name: string
    description: string
    bornMs: number
    friends: RemoteObj[]
    greet(): string
    getAgeMs(): number
  }
  const _RemoteObjFields = listKeys<RemoteObj>()(
    'name',
    'description',
    'bornMs',
    'friends',
    'greet',
    'getAgeMs',
  )
})

{
  expect<Replace<123, number, string>>().toBe<string>().fail
  expect<Replace<number, 123, string>>().toBe<string>().fail

  // self
  expect<Replace<123, 123, string>>().toBe<string>().success
  // array
  expect<Replace<23[], 23, 90>>().toBe<90[]>().success
  // tuple
  expect<Replace<[1, 2, 3], 3, 9>>().toBe<[1, 2, 9]>().success
  // function return type
  expect<Replace<(a: 1) => 2, 2, 9>>().toBe<(a: 1) => 9>().success
  // function params type
  expect<Replace<(a: 1, b: 2) => 3, 2, 10>>().toBe<(a: 1, b: 10) => 3>().success
  expect<Replace<(...args: [1, 2, 3]) => 4, 3, 10>>().toBe<(...args: [1, 2, 10]) => 4>().success
  // function params and return type
  expect<Replace<(a: 1, b: 2) => 2, 2, 9>>().toBe<(a: 1, b: 9) => 9>().success

  // object value
  expect<Replace<{ a: 1; b: 2 }, 2, 9>>().toBe<{ a: 1; b: 9 }>().success
  // object method
  expect<Replace<{ a: 1; b: 2; greet(): 2 }, 2, 9>>().toBe<{ a: 1; b: 9; greet(): 9 }>().success

  // Special
  {
    // Promise
    expect<Replace<Promise<2>, 2, 9>>().toBe<Promise<9>>().success
    // Map
    expect<Replace<Map<2, 3>, 2, 9>>().toBe<Map<9, 3>>().success
    // Set
    expect<Replace<Set<2>, 2, 9>>().toBe<Set<9>>().success
    // WeakMap
    expect<Replace<WeakMap<{ a: 2 }, 3>, 2, 9>>().toBe<WeakMap<{ a: 9 }, 3>>().success
    // WeakSet
    expect<Replace<WeakSet<{ a: 2 }>, 2, 9>>().toBe<WeakSet<{ a: 9 }>>().success
  }

  // class
  {
    class _A {
      a!: 1
      m(_a: 2): 3 {
        return 3
      }
    }
    expect<Replace<_A, 2, 9>>().T
  }
}
