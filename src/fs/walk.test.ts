import * as fs from './index.ts'
import { walkFile, walkFileSync } from './walk.ts'
import { withTempDir, withTempDirSync } from './temp.ts'

Deno.test('test walkFile', async () => {
  await withTempDir(async (dir) => {
    await fs.touch(fs.P`${dir}/test.ts`.str)

    for await (const file of walkFile(dir, /\.ts$/)) {
      console.log(file)
    }
  })
})

Deno.test('test walkFileSync', () => {
  withTempDirSync((dir) => {
    fs.touchSync(fs.P`${dir}/test.ts`.str)

    for (const file of walkFileSync(dir, /\.ts$/)) {
      console.log(file)
    }
  })
})
