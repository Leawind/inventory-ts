import * as fs from './index.ts'
import { walkFile } from './walk.ts'
import { withTempDir } from './temp.ts'

Deno.test('test walkFile', async () => {
  await withTempDir(async (dir) => {
    await fs.touch(fs.P`${dir}/test.ts`.toString())

    for await (const file of walkFile(dir, /\.ts$/)) {
      console.log(file)
    }
  })
})
