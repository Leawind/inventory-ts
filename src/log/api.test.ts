import { expect } from 'lay-sing/test-utils'
import type { LEVEL_REGISTRY, LevelLike, LevelName, LevelNameOf, LevelOf } from './api.ts'

{
  expect<LEVEL_REGISTRY['info']>().toBe<0>().success
  expect<LEVEL_REGISTRY['info' | 'warn']>().toBe<0 | 10>().success
}
{
  expect<LevelNameOf<'info'>>().toBe<'info'>().success

  expect<LevelNameOf<0>>().toBe<'info'>().success
  expect<LevelNameOf<10>>().toBe<'warn'>().success

  expect<LevelNameOf<0 | 10>>().toBe<'info' | 'warn'>().success

  expect<LevelNameOf<5>>().toBe<5>().success
  expect<LevelNameOf<0 | 5>>().toBe<'info' | 5>().success
  expect<LevelNameOf<LevelLike>>().toBe<LevelLike>().success
}
{
  expect<LevelOf<123>>().toBe<123>().success
  expect<LevelOf<'info'>>().toBe<LEVEL_REGISTRY['info']>().success
  expect<LevelOf<LevelName>>().toBe<LEVEL_REGISTRY[LevelName]>().success
  expect<LevelOf<LevelName>>().toBe<LEVEL_REGISTRY[LevelName]>().success

  expect<LevelOf<never>>().toBeNever
}
