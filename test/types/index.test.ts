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
  expect<ReplaceExact<123, number, string>>().to.be<string>().fail
  expect<ReplaceExact<number, 123, string>>().to.be<string>().fail

  // self
  expect<ReplaceExact<123, 123, string>>().to.be<string>().pass
  // array
  expect<ReplaceExact<23[], 23, 90>>().to.be<90[]>().pass
  // tuple
  expect<ReplaceExact<[1, 2, 3], 3, 9>>().to.be<[1, 2, 9]>().pass
  // function return type
  expect<ReplaceExact<(a: 1) => 2, 2, 9>>().to.be<(a: 1) => 9>().pass
  // function params type
  expect<ReplaceExact<(a: 1, b: 2) => 3, 2, 10>>().to.be<(a: 1, b: 10) => 3>().pass
  expect<ReplaceExact<(...args: [1, 2, 3]) => 4, 3, 10>>().to.be<(...args: [1, 2, 10]) => 4>().pass
  // function params and return type
  expect<ReplaceExact<(a: 1, b: 2) => 2, 2, 9>>().to.be<(a: 1, b: 9) => 9>().pass

  // object value
  expect<ReplaceExact<{ a: 1; b: 2 }, 2, 9>>().to.be<{ a: 1; b: 9 }>().pass
  // object method
  expect<ReplaceExact<{ a: 1; b: 2; greet(): 2 }, 2, 9>>().to.be<{ a: 1; b: 9; greet(): 9 }>().pass

  // Special
  {
    // Promise
    expect<ReplaceExact<Promise<2>, 2, 9>>().to.be<Promise<9>>().pass
    // Map
    expect<ReplaceExact<Map<2, 3>, 2, 9>>().to.be<Map<9, 3>>().pass
    // Set
    expect<ReplaceExact<Set<2>, 2, 9>>().to.be<Set<9>>().pass
    // WeakMap
    expect<ReplaceExact<WeakMap<{ a: 2 }, 3>, 2, 9>>().to.be<WeakMap<{ a: 9 }, 3>>().pass
    // WeakSet
    expect<ReplaceExact<WeakSet<{ a: 2 }>, 2, 9>>().to.be<WeakSet<{ a: 9 }>>().pass
  }
}
