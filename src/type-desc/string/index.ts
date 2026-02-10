export type IsChar<T extends string> = T extends `${string}${infer Rest}` ? Rest extends '' ? true
  : false
  : false

export type Stringable = string | number | bigint | boolean | null | undefined

export type CharUnion<S extends string> = S extends `${infer C}${infer Rest}` ? C | CharUnion<Rest> : never

export type IdStart = Exclude<string, CharUnion<`0123456789\r\n\t\s~\`!@#%^&*()_-+={}[]|\\;:"',.<>/?`>>

export type SplitAsChars<Str extends string> = Str extends '' ? []
  : Str extends `${infer C}${infer Rest}` ? [C, ...SplitAsChars<Rest>]
  : [Str]

export type SplitString<
  Str extends string,
  Sep extends Stringable,
> = Sep extends '' ? SplitAsChars<Str>
  : (Str extends '' ? []
    : Str extends `${Sep}` ? ['', '']
    : Str extends `${infer Before}${Sep}` ? [...SplitString<Before, Sep>, '']
    : Str extends `${infer Before}${Sep}${infer After}` ? [Before, ...SplitString<After, Sep>]
    : [Str])

export type JoinString<
  Tuple extends readonly Stringable[],
  Sep extends Stringable = '',
> = Tuple extends [] ? ''
  : Tuple extends [infer First extends Stringable] ? `${First}`
  : Tuple extends [infer First extends Stringable, infer Rest extends Stringable] ? `${First}${Sep}${Rest}`
  : Tuple extends [infer First extends Stringable, ...infer Rest extends Stringable[]]
    ? `${First}${Sep}${JoinString<Rest, Sep>}`
  : never
