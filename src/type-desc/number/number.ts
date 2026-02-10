import { expect } from 'lay-sing'

export type IsNumber<T> = T extends `${number}` ? true : false
{
  expect<IsNumber<'123'>>().to.be.true
}

export type ToNumber<T extends `${number}`> = T extends `${infer N extends number}` ? N : never
{
  expect<ToNumber<'123'>>().to.be<123>().pass
  expect<ToNumber<'3.14159'>>().to.be<3.14159>().pass
  {
    expect<ToNumber<'3.14159'>>().to.be<number>().fail.to.be<3.14159>().pass
    expect<ToNumber<'3.141592'>>().to.be<number>().fail
    expect<ToNumber<'3.1415926'>>().to.be<number>().fail
    expect<ToNumber<'3.14159265'>>().to.be<number>().fail.to.be<3.14159265>().pass
    expect<ToNumber<'3.141592653'>>().to.be<number>().fail
    expect<ToNumber<'3.1415926535'>>().to.be<number>().fail
    expect<ToNumber<'3.14159265358'>>().to.be<number>().fail.to.be<3.14159265358>().pass
    expect<ToNumber<'3.141592653589'>>().to.be<number>().fail
    expect<ToNumber<'3.1415926535897'>>().to.be<number>().fail
    expect<ToNumber<'3.141592653589793'>>().to.be<number>().fail.to.be<3.141592653589793>().pass
    expect<ToNumber<'3.1415926535897932'>>().to.be<number>().pass
  }
  {
    expect<ToNumber<'14159265358979323'>>().to.be<number>().pass
    expect<ToNumber<'1415926535897932'>>().to.be<number>().fail.to.be<1415926535897932>().pass
  }
}
