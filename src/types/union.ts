export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never

type LastOfUnion<U> = UnionToIntersection<U extends any ? () => U : never> extends () => infer R ? R : never

export type UnionToTuple<U, Last = LastOfUnion<U>> = [U] extends [never] ? []
  : [...UnionToTuple<Exclude<U, Last>>, Last]
