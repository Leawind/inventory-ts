import { expect } from 'lay-sing'
import type { ReplaceExact } from '../../src/types/index.ts'

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
  expect<ReplaceExact<123, number, string>>().toBe<string>().fail
  expect<ReplaceExact<number, 123, string>>().toBe<string>().fail

  // self
  expect<ReplaceExact<123, 123, string>>().toBe<string>().success
  // array
  expect<ReplaceExact<23[], 23, 90>>().toBe<90[]>().success
  // tuple
  expect<ReplaceExact<[1, 2, 3], 3, 9>>().toBe<[1, 2, 9]>().success
  // function return type
  expect<ReplaceExact<(a: 1) => 2, 2, 9>>().toBe<(a: 1) => 9>().success
  // function params type
  expect<ReplaceExact<(a: 1, b: 2) => 3, 2, 10>>().toBe<(a: 1, b: 10) => 3>().success
  expect<ReplaceExact<(...args: [1, 2, 3]) => 4, 3, 10>>().toBe<(...args: [1, 2, 10]) => 4>().success
  // function params and return type
  expect<ReplaceExact<(a: 1, b: 2) => 2, 2, 9>>().toBe<(a: 1, b: 9) => 9>().success

  // object value
  expect<ReplaceExact<{ a: 1; b: 2 }, 2, 9>>().toBe<{ a: 1; b: 9 }>().success
  // object method
  expect<ReplaceExact<{ a: 1; b: 2; greet(): 2 }, 2, 9>>().toBe<{ a: 1; b: 9; greet(): 9 }>().success

  // Special
  {
    // Promise
    expect<ReplaceExact<Promise<2>, 2, 9>>().toBe<Promise<9>>().success
    // Map
    expect<ReplaceExact<Map<2, 3>, 2, 9>>().toBe<Map<9, 3>>().success
    // Set
    expect<ReplaceExact<Set<2>, 2, 9>>().toBe<Set<9>>().success
    // WeakMap
    expect<ReplaceExact<WeakMap<{ a: 2 }, 3>, 2, 9>>().toBe<WeakMap<{ a: 9 }, 3>>().success
    // WeakSet
    expect<ReplaceExact<WeakSet<{ a: 2 }>, 2, 9>>().toBe<WeakSet<{ a: 9 }>>().success
  }
}
