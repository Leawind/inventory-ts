import { expect } from 'lay-sing'
import type { LEVEL_REGISTRY, LevelLike, LevelName, LevelNameOf, LevelOf } from './api.ts'

{
  expect<LEVEL_REGISTRY['info']>().to.be<0>().pass
  expect<LEVEL_REGISTRY['info' | 'warn']>().to.be<0 | 10>().pass
}
{
  expect<LevelNameOf<'info'>>().to.be<'info'>().pass

  expect<LevelNameOf<0>>().to.be<'info'>().pass
  expect<LevelNameOf<10>>().to.be<'warn'>().pass

  expect<LevelNameOf<0 | 10>>().to.be<'info' | 'warn'>().pass

  expect<LevelNameOf<5>>().to.be<5>().pass
  expect<LevelNameOf<0 | 5>>().to.be<'info' | 5>().pass
  expect<LevelNameOf<LevelLike>>().to.be<LevelLike>().pass
}
{
  expect<LevelOf<123>>().to.be<123>().pass
  expect<LevelOf<'info'>>().to.be<LEVEL_REGISTRY['info']>().pass
  expect<LevelOf<LevelName>>().to.be<LEVEL_REGISTRY[LevelName]>().pass
  expect<LevelOf<LevelName>>().to.be<LEVEL_REGISTRY[LevelName]>().pass

  expect<LevelOf<never>>().to.be.never
}
