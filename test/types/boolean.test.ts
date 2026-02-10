import { expect } from 'lay-sing'
import type { And, Not, Or } from '../../src/types/index.ts'

// Not
{
  expect<Not<true>>().to.be.false
  expect<Not<false>>().to.be.true

  expect<Not<never>>().to.be.never
  expect<Not<boolean>>().to.be<boolean>().pass
  expect<Not<any>>().to.be<boolean>().pass
}
// Both
{
  // Basic
  {
    expect<And<true, true>>().to.be.true
    expect<And<true, false>>().to.be.false
    expect<And<false, true>>().to.be.false
    expect<And<false, false>>().to.be.false
  }
  // true, false, boolean, any, never
  {
    expect<And<true, true>>().to.be.true
    expect<And<true, false>>().to.be.false
    expect<And<true, boolean>>().to.be<boolean>().pass
    expect<And<true, any>>().to.be<boolean>().pass
    expect<And<true, never>>().to.be.never
  }
  {
    expect<And<false, true>>().to.be.false
    expect<And<false, false>>().to.be.false
    expect<And<false, boolean>>().to.be.false
    expect<And<false, any>>().to.be.false
    expect<And<false, never>>().to.be.never
  }
  {
    expect<And<boolean, true>>().to.be<boolean>().pass
    expect<And<boolean, false>>().to.be.false
    expect<And<boolean, boolean>>().to.be<boolean>().pass
    expect<And<boolean, any>>().to.be<boolean>().pass
    expect<And<boolean, never>>().to.be.never
  }
  {
    expect<And<any, true>>().to.be<boolean>().pass
    expect<And<any, false>>().to.be.false
    expect<And<any, boolean>>().to.be<boolean>().pass
    expect<And<any, any>>().to.be<boolean>().pass
    expect<And<any, never>>().to.be.never
  }
  {
    expect<And<never, true>>().to.be.never
    expect<And<never, false>>().to.be.never
    expect<And<never, boolean>>().to.be.never
    expect<And<never, any>>().to.be.never
    expect<And<never, never>>().to.be.never
  }
}
// Or
{
  // Basic
  {
    expect<Or<true, true>>().to.be.true
    expect<Or<true, false>>().to.be.true
    expect<Or<false, true>>().to.be.true
    expect<Or<false, false>>().to.be.false
  }

  // true, false, boolean, any, never
  {
    expect<Or<true, true>>().to.be.true
    expect<Or<true, false>>().to.be.true

    expect<Or<true, boolean>>().to.be<boolean>().pass
    expect<Or<true, any>>().to.be<boolean>().pass
    expect<Or<true, never>>().to.be.never
  }
  {
    expect<Or<false, true>>().to.be.true
    expect<Or<false, false>>().to.be.false
    expect<Or<false, boolean>>().to.be<boolean>().pass
    expect<Or<false, any>>().to.be<boolean>().pass
    expect<Or<false, never>>().to.be.never
  }
  {
    expect<Or<boolean, true>>().to.be<boolean>().pass
    expect<Or<boolean, false>>().to.be<boolean>().pass
    expect<Or<boolean, boolean>>().to.be<boolean>().pass
    expect<Or<boolean, any>>().to.be<boolean>().pass
    expect<Or<boolean, never>>().to.be.never
  }
  {
    expect<Or<any, true>>().to.be<boolean>().pass
    expect<Or<any, false>>().to.be<boolean>().pass
    expect<Or<any, boolean>>().to.be<boolean>().pass
    expect<Or<any, any>>().to.be<boolean>().pass
    expect<Or<any, never>>().to.be.never
  }
  {
    expect<Or<never, true>>().to.be.never
    expect<Or<never, false>>().to.be.never
    expect<Or<never, boolean>>().to.be.never
    expect<Or<never, any>>().to.be.never
    expect<Or<never, never>>().to.be.never
  }
}

// Combinations
{
  // Or
  {
    expect<Not<And<Not<true>, Not<true>>>>().to.be.true
    expect<Not<And<Not<true>, Not<false>>>>().to.be.true
    expect<Not<And<Not<false>, Not<true>>>>().to.be.true
    expect<Not<And<Not<false>, Not<false>>>>().to.be.false
  }
  // And
  {
    expect<Not<Or<Not<true>, Not<true>>>>().to.be.true
    expect<Not<Or<Not<true>, Not<false>>>>().to.be.false
    expect<Not<Or<Not<false>, Not<true>>>>().to.be.false
    expect<Not<Or<Not<false>, Not<false>>>>().to.be.false
  }
}
