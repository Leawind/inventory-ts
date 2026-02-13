import type { Case, SwitchExact } from 'lay-sing/utils'
import type { DescribeArrayOrTuple } from './tuple.ts'
import type { DescribeString } from './string.ts'

/**
 * Non-distributive
 */
export type DescribeType<T> = SwitchExact<
  T,
  [
    Case<any, 'any'>,
    Case<unknown, 'unknown'>,
    Case<never, 'never'>,

    Case<true, 'true'>,
    Case<false, 'false'>,

    Case<boolean, 'boolean'>,
    Case<number, 'number'>,
    Case<string, 'string'>,
    Case<bigint, 'bigint'>,
    Case<symbol, 'symbol'>,

    Case<null, 'null'>,
    Case<undefined, 'undefined'>,

    Case<object, 'object'>,
  ],
  T extends number ? `${T}`
    : T extends readonly any[] ? DescribeArrayOrTuple<T>
    : T extends string ? DescribeString<T>
    : T extends object ? '{}'
    : 'todo'
>
