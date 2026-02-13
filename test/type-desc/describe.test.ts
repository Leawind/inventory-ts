import { expect } from 'lay-sing'
import type { DescribeType } from '../../src/type-desc/describe/index.ts'

expect<DescribeType<1.2>>().to.be<'1.2'>().pass
expect<DescribeType<123>>().to.be<'123'>().pass
expect<DescribeType<false>>().to.be<'false'>().pass
expect<DescribeType<'a'>>().to.be<"'a'">().pass

expect<DescribeType<boolean>>().to.be<'boolean'>().pass
expect<DescribeType<true | false>>().to.be<'boolean'>().pass
// expect<DescribeType<1 | 2>>().to.be<'1 | 2'>().pass

expect<DescribeType<number>>().to.be<'number'>().pass
expect<DescribeType<string>>().to.be<'string'>().pass
expect<DescribeType<number>>().to.be<'number'>().pass

{
  expect<any[]>().to.extend<readonly any[]>().pass
  expect<unknown[]>().to.extend<readonly any[]>().pass
  expect<never[]>().to.extend<readonly any[]>().pass
  expect<void[]>().to.extend<readonly any[]>().pass

  expect<any[]>().to.extend<readonly unknown[]>().pass
  expect<unknown[]>().to.extend<readonly unknown[]>().pass
  expect<never[]>().to.extend<readonly unknown[]>().pass
  expect<void[]>().to.extend<readonly unknown[]>().pass

  expect<DescribeType<readonly unknown[]>>().to.be<'readonly unknown[]'>().pass

  expect<DescribeType<number[]>>().to.be<'number[]'>().pass
  expect<DescribeType<readonly number[]>>().to.be<'readonly number[]'>().pass

  expect<DescribeType<string[]>>().to.be<'string[]'>().pass

  expect<DescribeType<readonly []>>().to.be<'readonly []'>().pass
  expect<DescribeType<readonly [1, 2]>>().to.be<'readonly [1, 2]'>().pass
}
{
  expect<DescribeType<[1, 2]>>().to.be<'[1, 2]'>().pass
}
{
  // expect<DescribeType<{ name: string }>>().to.be<'{ name: string }'>().pass
}
