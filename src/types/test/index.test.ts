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
