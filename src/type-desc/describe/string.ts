import type { StringMappingReplace } from '../string/index.ts'

type REPLACE_MAP_SINGLE_QUOTE = {
  "'": "\\'"

  '\n': '\\n'
  '\r': '\\r'
  '\t': '\\t'

  '\\': '\\\\'
}

type DecsribeStringSingleQuote<S extends string> = `'${StringMappingReplace<S, REPLACE_MAP_SINGLE_QUOTE>}'`

type REPLACE_MAP_DOUBLE_QUOTE = {
  '"': '\\"'
  '\n': '\\n'
  '\r': '\\r'
  '\t': '\\t'

  '\\': '\\\\'
}

type DecsribeStringDoubleQuote<S extends string> = `"${StringMappingReplace<S, REPLACE_MAP_DOUBLE_QUOTE>}"`

export type DescribeString<
  S extends string,
  Quote extends '"' | "'" = "'",
> = Quote extends "'" ? DecsribeStringSingleQuote<S> : DecsribeStringDoubleQuote<S>
