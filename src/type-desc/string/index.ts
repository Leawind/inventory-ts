export type IsChar<T extends string> = T extends `${string}${infer Rest}` ? Rest extends '' ? true
  : false
  : false

export type Stringable = string | number | bigint | boolean | null | undefined

export type StringAsCharUnion<S extends string> = S extends `${infer C}${infer Rest}` ? C | StringAsCharUnion<Rest>
  : never

export type IdStart = Exclude<string, StringAsCharUnion<`0123456789\r\n\t\s~\`!@#%^&*()_-+={}[]|\\;:"',.<>/?`>>

export type StringSplitAsChars<Str extends string> = Str extends '' ? []
  : Str extends `${infer C}${infer Rest}` ? [C, ...StringSplitAsChars<Rest>]
  : [Str]

export type StringSplit<
  Str extends string,
  Sep extends Stringable,
> = Sep extends '' ? StringSplitAsChars<Str>
  : (Str extends '' ? []
    : Str extends `${Sep}` ? ['', '']
    : Str extends `${infer Before}${Sep}` ? [...StringSplit<Before, Sep>, '']
    : Str extends `${infer Before}${Sep}${infer After}` ? [Before, ...StringSplit<After, Sep>]
    : [Str])

export type StringJoin<
  Tuple extends readonly Stringable[],
  Sep extends Stringable = '',
> = Tuple extends [] ? ''
  : Tuple extends [infer First extends Stringable] ? `${First}`
  : Tuple extends [infer First extends Stringable, infer Rest extends Stringable] ? `${First}${Sep}${Rest}`
  : Tuple extends [infer First extends Stringable, ...infer Rest extends Stringable[]]
    ? `${First}${Sep}${StringJoin<Rest, Sep>}`
  : never
