import { makeDirectoryStructure } from './operate.ts'
import { withTempDirSync } from './temp.ts'
import { assertEquals } from '@std/assert'

Deno.test('test makeDirectoryStructure', () => {
  withTempDirSync((tempDir) => {
    makeDirectoryStructure(tempDir, {
      'file1.txt': 'content1',
      dir1: {
        'file2.txt': 'content2',
      },
      dir2: {
        dir3: {
          'file4.txt': 'content4',
        },
      },
    })
    assertEquals(Deno.readFileSync(tempDir + '/file1.txt'), new TextEncoder().encode('content1'))
    assertEquals(Deno.readFileSync(tempDir + '/dir1/file2.txt'), new TextEncoder().encode('content2'))
    assertEquals(Deno.readFileSync(tempDir + '/dir2/dir3/file4.txt'), new TextEncoder().encode('content4'))
  })
})
