import type { StringMappingReplace } from '../string/index.ts'

// type REPLACE_MAP_SINGLE_QUOTE = [
//   [`'`, `\\'`],

//   ['\n', '\\n'],
//   ['\r', '\\r'],
//   ['\t', '\\t'],

//   ['\\', '\\\\'],
// ]
type REPLACE_MAP_SINGLE_QUOTE = {
  "'": "\\'"

  '\n': '\\n'
  '\r': '\\r'
  '\t': '\\t'

  '\\': '\\\\'
}

export type DecsribeStringSingleQuote<S extends string> = `'${StringMappingReplace<S, REPLACE_MAP_SINGLE_QUOTE>}'`
