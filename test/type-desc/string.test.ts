import { expect } from 'lay-sing'
import type {
  IdStart,
  IsChar,
  Stringable,
  StringAsCharUnion,
  StringJoin,
  StringSplit,
  StringSplitAsChars,
} from '../../src/type-desc/string/index.ts'

{
  expect<IsChar<''>>().to.be.false
  expect<IsChar<'a'>>().to.be.true
  expect<IsChar<' '>>().to.be.true
  expect<IsChar<'ab'>>().to.be.false

  expect<IsChar<'a' | ''>>().to.be<boolean>().pass
}

{
  expect<123>().to.extend<Stringable>().pass
  expect<1.2>().to.extend<Stringable>().pass
  expect<'a string'>().to.extend<Stringable>().pass
  expect<123n>().to.extend<Stringable>().pass
  expect<boolean>().to.extend<Stringable>().pass
  expect<null>().to.extend<Stringable>().pass
  expect<undefined>().to.extend<Stringable>().pass

  expect<never>().to.extend<Stringable>().pass
  expect<any>().to.extend<Stringable>().pass
  expect<unknown>().to.extend<Stringable>().fail
  expect<void>().to.extend<Stringable>().fail

  expect<symbol>().to.extend<Stringable>().fail
  expect<{}>().to.extend<Stringable>().fail
}

{
  expect<StringAsCharUnion<'abc'>>().to.be<'a' | 'b' | 'c'>().pass
  expect<'a'>().to.extend<StringAsCharUnion<'abc'>>().pass
}

{
  expect<IdStart>().to.extend<string>().pass
  expect<'a'>().to.extend<IdStart>().pass
}

{
  expect<StringSplitAsChars<''>>().to.equal<[]>().pass
  expect<StringSplitAsChars<'abc'>>().to.equal<['a', 'b', 'c']>().pass
  expect<StringSplitAsChars<'a/b/c'>>().to.equal<['a', '/', 'b', '/', 'c']>().pass

  expect<StringSplitAsChars<never>>().to.be.never
}

{
  expect<StringSplit<'', '/'>>().to.equal<[]>().pass
  expect<StringSplit<'/', '/'>>().to.equal<['', '']>().pass
  expect<StringSplit<'123/', '/'>>().to.equal<['123', '']>().pass
  expect<StringSplit<'/123', '/'>>().to.equal<['', '123']>().pass
  expect<StringSplit<'123/456/', '/'>>().to.equal<['123', '456', '']>().pass
  expect<StringSplit<'src/main/index.ts', '/'>>().to.equal<['src', 'main', 'index.ts']>().pass

  expect<StringSplit<'abc', ''>>().to.equal<['a', 'b', 'c']>().pass
  expect<StringSplit<'', ''>>().to.equal<[]>().pass
  expect<StringSplit<'a', ''>>().to.equal<['a']>().pass
}

{
  expect<StringJoin<[], '/'>>().to.equal<''>().pass
  expect<StringJoin<['1', '2', '3'], ', '>>().to.equal<'1, 2, 3'>().pass
  expect<StringJoin<['a'], '/'>>().to.equal<'a'>().pass
  expect<StringJoin<['a', 'b'], '/'>>().to.equal<'a/b'>().pass
  expect<StringJoin<['src', 'main', 'index.ts'], '/'>>().to.equal<'src/main/index.ts'>().pass
}
