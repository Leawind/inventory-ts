import { StaticResourceManager } from '@/static-resource/index.ts'
import { assertStrictEquals } from '@std/assert'

Deno.test('Test static resource', async () => {
  const srm = StaticResourceManager.at(import.meta.dirname!)

  assertStrictEquals(await srm.fetch('readme.md'), 'hello\n')

  const steveData = await srm.fetch('data.json')
  assertStrictEquals(steveData.name, 'Steve')

  assertStrictEquals(await srm.fetch('name.txt'), 'Steve\n')
})
