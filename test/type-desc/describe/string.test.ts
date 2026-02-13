import { expect } from 'lay-sing'
import type { DescribeString } from '../../../src/type-desc/describe/string.ts'

expect<DescribeString<'a string'>>().to.be<"'a string'">().pass
expect<DescribeString<'a string', '"'>>().to.be<'"a string"'>().pass

// escape
expect<DescribeString<"a string with 'quote'">>().to.be<`'a string with \\'quote\\''`>().pass
expect<DescribeString<'a string with "quote"'>>().to.be<`'a string with "quote"'`>().pass

expect<DescribeString<'a string with \n'>>().to.be<`'a string with \\n'`>().pass
expect<DescribeString<'a string with \r'>>().to.be<`'a string with \\r'`>().pass
expect<DescribeString<'a string with \t'>>().to.be<`'a string with \\t'`>().pass
