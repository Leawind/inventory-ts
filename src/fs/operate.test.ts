import { copy, copySync, makeDirectoryStructure } from './operate.ts'
import { Path } from './path.ts'
import { withTempDir, withTempDirSync } from './temp.ts'
import { assertEquals } from '@std/assert'

Deno.test('test makeDirectoryStructure', () => {
  withTempDirSync((tempDir) => {
    const temp = Path.from(tempDir)
    makeDirectoryStructure(temp, {
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

    assertEquals(temp.join('file1.txt').readTextSync(), 'content1')
    assertEquals(temp.join('dir1/file2.txt').readTextSync(), 'content2')
    assertEquals(temp.join('dir2/dir3/file4.txt').readTextSync(), 'content4')
  })
})

Deno.test('test copy file', async () => {
  await withTempDir(async (tempDir) => {
    const temp = Path.from(tempDir)

    // Create source file
    const srcFile = temp.join('source.txt')
    srcFile.writeSync('Hello World')

    // Copy file
    const destFile = temp.join('destination.txt')
    await copy(srcFile, destFile)

    // Verify copy
    assertEquals(destFile.readTextSync(), 'Hello World')
  })
})

Deno.test('test copySync file', () => {
  withTempDirSync((tempDir) => {
    const temp = Path.from(tempDir)
    // Create source file
    const srcFile = temp.join('source.txt')
    srcFile.writeSync('Hello World Sync')

    // Copy file
    const destFile = temp.join('destination.txt')
    copySync(srcFile, destFile)

    // Verify copy
    assertEquals(destFile.readTextSync(), 'Hello World Sync')
  })
})

Deno.test('test copy directory recursively', async () => {
  await withTempDir(async (tempDir) => {
    const temp = Path.from(tempDir)
    // Create source directory structure
    const srcDir = temp.join('source')
    makeDirectoryStructure(srcDir, {
      'file1.txt': 'content1',
      dir1: {
        'file2.txt': 'content2',
        'file3.txt': 'content3',
      },
      dir2: {
        dir3: {
          'file4.txt': 'content4',
        },
      },
    })

    // Copy directory
    const destDir = temp.join('destination')
    await copy(srcDir, destDir)

    // Verify copy
    assertEquals(destDir.join('file1.txt').readTextSync(), 'content1')
    assertEquals(destDir.join('dir1/file2.txt').readTextSync(), 'content2')
    assertEquals(destDir.join('dir1/file3.txt').readTextSync(), 'content3')
    assertEquals(destDir.join('dir2/dir3/file4.txt').readTextSync(), 'content4')
  })
})

Deno.test('test copySync directory recursively', () => {
  withTempDirSync((tempDir) => {
    const temp = Path.from(tempDir)
    // Create source directory structure
    const srcDir = temp.join('source')
    makeDirectoryStructure(srcDir, {
      'file1.txt': 'content1',
      dir1: {
        'file2.txt': 'content2',
        'file3.txt': 'content3',
      },
      dir2: {
        dir3: {
          'file4.txt': 'content4',
        },
      },
    })

    // Copy directory
    const destDir = temp.join('destination')
    copySync(srcDir, destDir)

    // Verify copy
    assertEquals(destDir.join('file1.txt').readTextSync(), 'content1')
    assertEquals(destDir.join('dir1/file2.txt').readTextSync(), 'content2')
    assertEquals(destDir.join('dir1/file3.txt').readTextSync(), 'content3')
    assertEquals(destDir.join('dir2/dir3/file4.txt').readTextSync(), 'content4')
  })
})

Deno.test('test copy to nested directory', async () => {
  await withTempDir(async (tempDir) => {
    const temp = Path.from(tempDir)
    // Create source file
    const srcFile = temp.join('source.txt')
    srcFile.writeSync('Nested Content')

    // Copy to nested directory
    const destFile = temp.join('nested/dir/destination.txt')
    await copy(srcFile, destFile)

    // Verify copy
    assertEquals(destFile.readTextSync(), 'Nested Content')
  })
})

Deno.test('test copySync to nested directory', () => {
  withTempDirSync((tempDir) => {
    const temp = Path.from(tempDir)
    // Create source file
    const srcFile = temp.join('source.txt')
    srcFile.writeSync('Nested Content Sync')

    // Copy to nested directory
    const destFile = temp.join('nested/dir/destination.txt')
    copySync(srcFile, destFile)

    // Verify copy
    assertEquals(destFile.readTextSync(), 'Nested Content Sync')
  })
})
