import { assert, assertStrictEquals } from '@std/assert'
import { existsSync } from './basic.ts'
import { withTempDir, withTempDirSync, withTempFile, withTempFileSync } from './temp.ts'

Deno.test('fs/temp: Comprehensive temp file and directory tests', async (t) => {
  const parentDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' })

  try {
    // Synchronous directory tests
    await t.step('withTempDirSync basic functionality', () => {
      withTempDirSync((dirPath) => {
        // Check that the directory exists
        assert(existsSync(dirPath), 'Temporary directory should exist')

        // Check that we can write a file inside the directory
        const filePath = `${dirPath}/test.txt`
        Deno.writeTextFileSync(filePath, 'test content')
        const content = Deno.readTextFileSync(filePath)
        assertStrictEquals(content, 'test content')
      }, { parent: parentDir })
    })

    await t.step('withTempDirSync with options', () => {
      withTempDirSync((dirPath) => {
        // Check that the directory exists
        assert(existsSync(dirPath), 'Temporary directory should exist')

        // Check that it has the right prefix
        const dirName = dirPath.replace(/.*[\/\\]/g, '')
        assert(dirName.startsWith('test-prefix'), 'Directory should have the specified prefix')

        // Check that it has the right suffix
        assert(dirName.endsWith('-test-suffix'), 'Directory should have the specified suffix')
      }, {
        prefix: 'test-prefix',
        suffix: '-test-suffix',
        parent: parentDir,
      })
    })

    await t.step('withTempDirSync curried form', () => {
      const withCustomTempDir = withTempDirSync({
        prefix: 'custom-',
        suffix: '-dir',
        parent: parentDir,
      })

      withCustomTempDir((dirPath) => {
        // Check that the directory exists
        assert(existsSync(dirPath), 'Temporary directory should exist')

        // Check that it has the right prefix and suffix
        const dirName = dirPath.replace(/.*[\/\\]/g, '')
        assert(
          dirName.startsWith('custom-') && dirName.endsWith('-dir'),
          'Directory should have the specified prefix and suffix',
        )
      })
    })

    // Asynchronous directory tests
    await t.step('withTempDir basic functionality', async () => {
      await withTempDir(async (dirPath) => {
        // Check that the directory exists
        assert(existsSync(dirPath), 'Temporary directory should exist')

        // Check that we can write a file inside the directory
        const filePath = `${dirPath}/test.txt`
        await Deno.writeTextFile(filePath, 'test content')
        const content = await Deno.readTextFile(filePath)
        assertStrictEquals(content, 'test content')
      }, { parent: parentDir })
    })

    await t.step('withTempDir with options', async () => {
      await withTempDir((dirPath) => {
        // Check that the directory exists
        assert(existsSync(dirPath), 'Temporary directory should exist')

        // Check that it has the right prefix
        const dirName = dirPath.replace(/.*[\/\\]/g, '')
        assert(dirName.startsWith('async-prefix'), 'Directory should have the specified prefix')

        // Check that it has the right suffix
        assert(dirName.endsWith('-async-suffix'), 'Directory should have the specified suffix')
      }, {
        prefix: 'async-prefix',
        suffix: '-async-suffix',
        parent: parentDir,
      })
    })

    await t.step('withTempDir curried form', async () => {
      const withCustomTempDir = withTempDir({
        prefix: 'async-custom-',
        suffix: '-dir',
        parent: parentDir,
      })

      await withCustomTempDir((dirPath) => {
        // Check that the directory exists
        assert(existsSync(dirPath), 'Temporary directory should exist')

        // Check that it has the right prefix and suffix
        const dirName = dirPath.replace(/.*[\/\\]/g, '')
        assert(
          dirName.startsWith('async-custom-') && dirName.endsWith('-dir'),
          'Directory should have the specified prefix and suffix',
        )
      })
    })

    // Synchronous file tests
    await t.step('withTempFileSync basic functionality', () => {
      withTempFileSync((filePath) => {
        // Check that the file exists
        assert(existsSync(filePath), 'Temporary file should exist')

        // Check that we can write content to the file
        Deno.writeTextFileSync(filePath, 'test content')
        const content = Deno.readTextFileSync(filePath)
        assertStrictEquals(content, 'test content')
      }, { parent: parentDir })
    })

    await t.step('withTempFileSync with options', () => {
      withTempFileSync((filePath) => {
        // Check that the file exists
        assert(existsSync(filePath), 'Temporary file should exist')

        // Check that it has the right prefix
        const fileName = filePath.replace(/.*[\/\\]/g, '')
        assert(fileName.startsWith('file-prefix'), 'File should have the specified prefix')

        // Check that it has the right suffix
        assert(fileName.endsWith('-file-suffix'), 'File should have the specified suffix')
      }, {
        prefix: 'file-prefix',
        suffix: '-file-suffix',
        parent: parentDir,
      })
    })

    await t.step('withTempFileSync curried form', () => {
      const withCustomTempFile = withTempFileSync({
        prefix: 'custom-file-',
        suffix: '.tmp',
        parent: parentDir,
      })

      withCustomTempFile((filePath) => {
        // Check that the file exists
        assert(existsSync(filePath), 'Temporary file should exist')

        // Check that it has the right prefix and suffix
        const fileName = filePath.replace(/.*[\/\\]/g, '')
        assert(
          fileName.startsWith('custom-file-') && fileName.endsWith('.tmp'),
          'File should have the specified prefix and suffix',
        )
      })
    })

    // Asynchronous file tests
    await t.step('withTempFile basic functionality', async () => {
      await withTempFile(async (filePath) => {
        // Check that the file exists
        assert(existsSync(filePath), 'Temporary file should exist')

        // Check that we can write content to the file
        await Deno.writeTextFile(filePath, 'test content')
        const content = await Deno.readTextFile(filePath)
        assertStrictEquals(content, 'test content')
      }, { parent: parentDir })
    })

    await t.step('withTempFile with options', async () => {
      await withTempFile((filePath) => {
        // Check that the file exists
        assert(existsSync(filePath), 'Temporary file should exist')

        // Check that it has the right prefix
        const fileName = filePath.replace(/.*[\/\\]/g, '')
        assert(fileName.startsWith('async-file-prefix'), 'File should have the specified prefix')

        // Check that it has the right suffix
        assert(fileName.endsWith('-async-file-suffix'), 'File should have the specified suffix')
      }, {
        prefix: 'async-file-prefix',
        suffix: '-async-file-suffix',
        parent: parentDir,
      })
    })

    await t.step('withTempFile curried form', async () => {
      const withCustomTempFile = withTempFile({
        prefix: 'async-file-',
        suffix: '.log',
        parent: parentDir,
      })

      await withCustomTempFile((filePath) => {
        // Check that the file exists
        assert(existsSync(filePath), 'Temporary file should exist')

        // Check that it has the right prefix and suffix
        const fileName = filePath.replace(/.*[\/\\]/g, '')
        assert(
          fileName.startsWith('async-file-') && fileName.endsWith('.log'),
          'File should have the specified prefix and suffix',
        )
      })
    })

    // Cleanup verification tests
    await t.step('temporary resources are cleaned up after use', () => {
      let tempPath: string | undefined

      // Create a temp directory and capture its path
      withTempDirSync((dirPath) => {
        tempPath = dirPath
        assert(existsSync(dirPath), 'Directory should exist during callback')
      }, { parent: parentDir })

      // After the callback, the directory should be removed
      assert(!existsSync(tempPath!), 'Directory should be removed after callback completes')
    })

    await t.step('temporary files are cleaned up after use', () => {
      let tempPath: string | undefined

      // Create a temp file and capture its path
      withTempFileSync((filePath) => {
        tempPath = filePath
        assert(existsSync(filePath), 'File should exist during callback')
      }, { parent: parentDir })

      // After the callback, the file should be removed
      assert(!existsSync(tempPath!), 'File should be removed after callback completes')
    })

    await t.step('temp file/dir cleanup after exception', () => {
      let tempPath: string | undefined

      try {
        withTempDirSync((dirPath) => {
          tempPath = dirPath
          throw new Error('Simulated error')
        }, { parent: parentDir })
      } catch (e) {
        // Expected to throw
        assert(e instanceof Error, 'Should throw an error')
        assert(e.message === 'Simulated error', 'Should rethrow the error')
      }

      assert(!existsSync(tempPath!), 'Directory should be removed even after an error in the callback')
    })
  } finally {
    await Deno.remove(parentDir, { recursive: true })
  }
})
