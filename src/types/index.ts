export type AnyFunction<R = any, Params extends any[] = any[]> = (...args: Params) => R

export type Constructor<Inst = any, Params extends any[] = any[]> = new (...args: Params) => Inst

export type Awaitable<T> = Promise<T> | T

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

export type DeepRequire<T> = {
  [P in keyof T]-?: T[P] extends object ? DeepRequire<T[P]> : T[P]
}

// Index start >>>>>>>>>>>>>>>>
export * from './alias.ts'
export * from './non-distributive.ts'
export * from './object.ts'
export * from './set.ts'
// <<<<<<<<<<<<<<<<   Index end
