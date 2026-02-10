import { expect } from 'lay-sing'
import type {
  CharUnion,
  IdStart,
  IsChar,
  JoinString,
  SplitAsChars,
  SplitString,
  Stringable,
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
  expect<CharUnion<'abc'>>().to.be<'a' | 'b' | 'c'>().pass
  expect<'a'>().to.extend<CharUnion<'abc'>>().pass
}

{
  expect<IdStart>().to.extend<string>().pass
  expect<'a'>().to.extend<IdStart>().pass
}

{
  expect<SplitAsChars<''>>().to.equal<[]>().pass
  expect<SplitAsChars<'abc'>>().to.equal<['a', 'b', 'c']>().pass
  expect<SplitAsChars<'a/b/c'>>().to.equal<['a', '/', 'b', '/', 'c']>().pass

  expect<SplitAsChars<never>>().to.be.never
}

{
  expect<SplitString<'', '/'>>().to.equal<[]>().pass
  expect<SplitString<'/', '/'>>().to.equal<['', '']>().pass
  expect<SplitString<'123/', '/'>>().to.equal<['123', '']>().pass
  expect<SplitString<'/123', '/'>>().to.equal<['', '123']>().pass
  expect<SplitString<'123/456/', '/'>>().to.equal<['123', '456', '']>().pass
  expect<SplitString<'src/main/index.ts', '/'>>().to.equal<['src', 'main', 'index.ts']>().pass

  expect<SplitString<'abc', ''>>().to.equal<['a', 'b', 'c']>().pass
  expect<SplitString<'', ''>>().to.equal<[]>().pass
  expect<SplitString<'a', ''>>().to.equal<['a']>().pass
}

{
  expect<JoinString<[], '/'>>().to.equal<''>().pass
  expect<JoinString<['1', '2', '3'], ', '>>().to.equal<'1, 2, 3'>().pass
  expect<JoinString<['a'], '/'>>().to.equal<'a'>().pass
  expect<JoinString<['a', 'b'], '/'>>().to.equal<'a/b'>().pass
  expect<JoinString<['src', 'main', 'index.ts'], '/'>>().to.equal<'src/main/index.ts'>().pass
}
