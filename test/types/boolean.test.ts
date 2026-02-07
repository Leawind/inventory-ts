import { expect } from 'lay-sing/test-utils'
import type { And, Not, Or } from '../../src/types/index.ts'

// Not
{
  expect<Not<true>>().toBeFalse
  expect<Not<false>>().toBeTrue

  expect<Not<never>>().toBeNever
  expect<Not<boolean>>().toBe<boolean>().success
  expect<Not<any>>().toBe<boolean>().success
}
// Both
{
  // Basic
  {
    expect<And<true, true>>().toBeTrue
    expect<And<true, false>>().toBeFalse
    expect<And<false, true>>().toBeFalse
    expect<And<false, false>>().toBeFalse
  }
  // true, false, boolean, any, never
  {
    expect<And<true, true>>().toBeTrue
    expect<And<true, false>>().toBeFalse
    expect<And<true, boolean>>().toBe<boolean>().success
    expect<And<true, any>>().toBe<boolean>().success
    expect<And<true, never>>().toBeNever
  }
  {
    expect<And<false, true>>().toBeFalse
    expect<And<false, false>>().toBeFalse
    expect<And<false, boolean>>().toBeFalse
    expect<And<false, any>>().toBeFalse
    expect<And<false, never>>().toBeNever
  }
  {
    expect<And<boolean, true>>().toBe<boolean>().success
    expect<And<boolean, false>>().toBeFalse
    expect<And<boolean, boolean>>().toBe<boolean>().success
    expect<And<boolean, any>>().toBe<boolean>().success
    expect<And<boolean, never>>().toBeNever
  }
  {
    expect<And<any, true>>().toBe<boolean>().success
    expect<And<any, false>>().toBeFalse
    expect<And<any, boolean>>().toBe<boolean>().success
    expect<And<any, any>>().toBe<boolean>().success
    expect<And<any, never>>().toBeNever
  }
  {
    expect<And<never, true>>().toBeNever
    expect<And<never, false>>().toBeNever
    expect<And<never, boolean>>().toBeNever
    expect<And<never, any>>().toBeNever
    expect<And<never, never>>().toBeNever
  }
}
// Or
{
  // Basic
  {
    expect<Or<true, true>>().toBeTrue
    expect<Or<true, false>>().toBeTrue
    expect<Or<false, true>>().toBeTrue
    expect<Or<false, false>>().toBeFalse
  }

  // true, false, boolean, any, never
  {
    expect<Or<true, true>>().toBeTrue
    expect<Or<true, false>>().toBeTrue

    expect<Or<true, boolean>>().toBe<boolean>().success
    expect<Or<true, any>>().toBe<boolean>().success
    expect<Or<true, never>>().toBeNever
  }
  {
    expect<Or<false, true>>().toBeTrue
    expect<Or<false, false>>().toBeFalse
    expect<Or<false, boolean>>().toBe<boolean>().success
    expect<Or<false, any>>().toBe<boolean>().success
    expect<Or<false, never>>().toBeNever
  }
  {
    expect<Or<boolean, true>>().toBe<boolean>().success
    expect<Or<boolean, false>>().toBe<boolean>().success
    expect<Or<boolean, boolean>>().toBe<boolean>().success
    expect<Or<boolean, any>>().toBe<boolean>().success
    expect<Or<boolean, never>>().toBeNever
  }
  {
    expect<Or<any, true>>().toBe<boolean>().success
    expect<Or<any, false>>().toBe<boolean>().success
    expect<Or<any, boolean>>().toBe<boolean>().success
    expect<Or<any, any>>().toBe<boolean>().success
    expect<Or<any, never>>().toBeNever
  }
  {
    expect<Or<never, true>>().toBeNever
    expect<Or<never, false>>().toBeNever
    expect<Or<never, boolean>>().toBeNever
    expect<Or<never, any>>().toBeNever
    expect<Or<never, never>>().toBeNever
  }
}

// Combinations
{
  // Or
  {
    expect<Not<And<Not<true>, Not<true>>>>().toBeTrue
    expect<Not<And<Not<true>, Not<false>>>>().toBeTrue
    expect<Not<And<Not<false>, Not<true>>>>().toBeTrue
    expect<Not<And<Not<false>, Not<false>>>>().toBeFalse
  }
  // And
  {
    expect<Not<Or<Not<true>, Not<true>>>>().toBeTrue
    expect<Not<Or<Not<true>, Not<false>>>>().toBeFalse
    expect<Not<Or<Not<false>, Not<true>>>>().toBeFalse
    expect<Not<Or<Not<false>, Not<false>>>>().toBeFalse
  }
}
