import type { AssertExtends, Exact } from 'lay-sing/utils'

export type ReplaceExact<T, Old, New> = T extends any ? (
    Exact<T, Old> extends true ? New
      : T extends Promise<infer U> ? Promise<ReplaceExact<U, Old, New>>
      : T extends Map<infer K, infer V> ? Map<ReplaceExact<K, Old, New>, ReplaceExact<V, Old, New>>
      : T extends Set<infer U> ? Set<ReplaceExact<U, Old, New>>
      : T extends WeakMap<infer K, infer V>
        ? WeakMap<AssertExtends<ReplaceExact<K, Old, New>, WeakKey>, ReplaceExact<V, Old, New>>
      : T extends WeakSet<infer U> ? WeakSet<AssertExtends<ReplaceExact<U, Old, New>, WeakKey>>
      : T extends (...args: infer P extends any[]) => infer R
        ? (...args: AssertExtends<ReplaceExact<P, Old, New>, any[]>) => ReplaceExact<R, Old, New>
      : T extends object ? { [K in keyof T]: ReplaceExact<T[K], Old, New> }
      : T
  )
  : never
