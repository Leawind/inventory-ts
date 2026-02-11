import { assert, assertEquals, assertStrictEquals } from '@std/assert'
import { Path, type PathAsync, type PathSync } from './path.ts'
import { existsSync } from './basic.ts'
import { p } from './utils.ts'
import { expect } from 'lay-sing'
import { withTempDirSync } from './temp.ts'

{
  type RemoveSuffix<S extends string, Suffix extends string> = S extends `${infer Prefix}${Suffix}` ? Prefix : S

  type PathInstKeysSync = { [K in keyof Path]: K extends `${string}Sync` ? K : never }[keyof Path]
  expect<`${RemoveSuffix<PathInstKeysSync, 'Sync'>}Async`>().toExtend<keyof Path>().success

  type PathInstKeysAsync = { [K in keyof Path]: K extends `${string}Async` ? K : never }[keyof Path]
  expect<`${RemoveSuffix<PathInstKeysAsync, 'Async'>}Sync`>().toExtend<keyof Path>().success
}
// sync/async switch
{
  const p = Path.from('/some/path')
  // Keys
  {
    expect(p).toHaveKey<'absolute'>().success
    expect(p).toHaveKey<'isFile'>().fail
    expect(p).toHaveKey<'isFileSync'>().success
    expect(p).toHaveKey<'isFileAsync'>().success

    const ps = p.sync
    expect(ps).toHaveKey<'absolute'>().success
    expect(ps).toHaveKey<'isFile'>().success
    expect(ps).toHaveKey<'isFileSync'>().fail
    expect(ps).toHaveKey<'isFileAsync'>().fail

    const pa = p.async
    expect(pa).toHaveKey<'absolute'>().success
    expect(pa).toHaveKey<'isFile'>().success
    expect(pa).toHaveKey<'isFileSync'>().fail
    expect(pa).toHaveKey<'isFileAsync'>().fail
  }
  // Return types
  {
    expect<ReturnType<typeof p.sync.absolute>>().toBe<PathSync>().success
    expect<ReturnType<typeof p.async.absolute>>().toBe<PathAsync>().success
    expect<ReturnType<typeof p.sync.relative>>().toBe<PathSync>().success
    expect<ReturnType<typeof p.async.relative>>().toBe<PathAsync>().success

    expect<ReturnType<typeof p.sync.moveTo>>().toBe<PathSync>().success
    expect<ReturnType<typeof p.async.moveTo>>().toBe<Promise<PathAsync>>().success
  }
}

Deno.test('fs/path: Path basic construction and conversion', async (t) => {
  const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' })

  try {
    await t.step('Path constructor creates instance with given path', () => {
      const path = new Path('/some/path')
      assertStrictEquals(path.path, '/some/path')
    })

    await t.step('Path.from creates new instance from string', () => {
      const path = Path.from('/some/path')
      assertStrictEquals(path.path, '/some/path')
    })

    await t.step('Path.from returns same instance if passed a Path', () => {
      const original = new Path('/some/path')
      const result = Path.from(original)
      assertStrictEquals(result, original)
    })

    await t.step('toString returns the path', () => {
      const path = new Path('/some/path')
      assertEquals(path.toString(), '/some/path')
    })

    await t.step('Symbol.toPrimitive returns the path', () => {
      const path = new Path('/some/path')
      assertEquals(`${path}`, '/some/path')
    })

    await t.step('get str returns the path', () => {
      const path = new Path('/some/path')
      assertEquals(path.str, '/some/path')
    })
  } finally {
    await Deno.remove(tempDir, { recursive: true })
  }
})

Deno.test('fs/path: Path properties and methods', async (t) => {
  const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' })

  try {
    await t.step('name property returns basename', () => {
      const path = new Path('/some/path/file.txt')
      assertEquals(path.name, 'file.txt')
    })

    await t.step('dotext property returns extension with dot', () => {
      const path = new Path('/some/path/file.txt')
      assertEquals(path.dotext, '.txt')

      const path2 = new Path('/some/path/.hidden')
      assertEquals(path2.dotext, '.hidden')
    })

    await t.step('ext property returns extension without dot', () => {
      const path = new Path('/some/path/file.txt')
      assertEquals(path.ext, 'txt')

      const path2 = new Path('/some/path/file.tar.gz')
      assertEquals(path2.ext, 'gz')
    })

    await t.step('isAbsolute property identifies absolute paths', () => {
      const absPathUnix = new Path('/some/absolute/path')
      const absPathWin = new Path('C:\\some\\windows\\path')
      const relPath = new Path('./some/relative/path')

      assert(absPathUnix.isAbsolute)
      assert(absPathWin.isAbsolute)
      assert(!relPath.isAbsolute)
    })

    await t.step('isRelative property identifies relative paths', () => {
      const absPathUnix = new Path('/some/absolute/path')
      const relPath = new Path('./some/relative/path')
      const relPath2 = new Path('../another/relative/path')

      assert(!absPathUnix.isRelative)
      assert(relPath.isRelative)
      assert(relPath2.isRelative)
    })

    await t.step('absolute method converts to absolute path', () => {
      const relPath = new Path('./some/relative/path')
      const absPath = relPath.absolute()
      assert(absPath.isAbsolute)
    })

    await t.step('relative method creates relative path from base', () => {
      const basePath = new Path('/base/path')
      const targetPath = new Path('/base/path/target/subpath')
      const relative = targetPath.relative(basePath)
      assertEquals(p`${relative}`, p`target/subpath`)
    })

    await t.step('getParent returns parent directory', () => {
      const path = new Path('/some/path/file.txt')
      const parent = path.getParent()
      assertEquals(p`${parent}`, p`/some/path`)
    })

    await t.step('join combines paths', () => {
      const basePath = new Path('/some/path')
      const joined = basePath.join('sub', 'folder', 'file.txt')
      assertEquals(p`${joined}`, p`/some/path/sub/folder/file.txt`)
    })
  } finally {
    await Deno.remove(tempDir, { recursive: true })
  }
})

Deno.test('fs/path: Path type checking methods', async (t) => {
  const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' })

  try {
    await t.step('existsSync checks if path exists synchronously', () => {
      const existingPath = new Path(tempDir)
      const nonExistingPath = new Path(`${tempDir}/non-existing-file`)

      assert(existingPath.existsSync())
      assert(!nonExistingPath.existsSync())
    })

    await t.step('exists checks if path exists asynchronously', async () => {
      const existingPath = new Path(tempDir)
      const nonExistingPath = new Path(`${tempDir}/non-existing-file`)

      assertEquals(await existingPath.existsAsync(), true)
      assertEquals(await nonExistingPath.existsAsync(), false)
    })

    await t.step('isDirectorySync checks if path is directory synchronously', () => {
      const dirPath = new Path(tempDir)
      const filePath = new Path(`${tempDir}/test-file.txt`)
      Deno.writeTextFileSync(filePath.path, 'test content')

      assert(dirPath.isDirectorySync())
      assert(!filePath.isDirectorySync())
    })

    await t.step('isDirectory checks if path is directory asynchronously', async () => {
      const dirPath = new Path(tempDir)
      const filePath = new Path(`${tempDir}/test-file-async.txt`)
      Deno.writeTextFileSync(filePath.path, 'test content')

      assertEquals(await dirPath.isDirectoryAsync(), true)
      assertEquals(await filePath.isDirectoryAsync(), false)
    })

    await t.step('isFileSync checks if path is file synchronously', () => {
      const dirPath = new Path(tempDir)
      const filePath = new Path(`${tempDir}/test-file-sync.txt`)
      Deno.writeTextFileSync(filePath.path, 'test content')

      assert(!dirPath.isFileSync())
      assert(filePath.isFileSync())
    })

    await t.step('isFile checks if path is file asynchronously', async () => {
      const dirPath = new Path(tempDir)
      const filePath = new Path(`${tempDir}/test-file-async-2.txt`)
      Deno.writeTextFileSync(filePath.path, 'test content')

      assertEquals(await dirPath.isFileAsync(), false)
      assertEquals(await filePath.isFileAsync(), true)
    })

    await t.step('isSymlinkSync checks if path is symlink synchronously', () => {
      const dirPath = new Path(tempDir)
      const filePath = new Path(`${tempDir}/test-symlink-sync.txt`)
      Deno.writeTextFileSync(filePath.path, 'test content')

      assert(!dirPath.isSymlinkSync())
      assert(!filePath.isSymlinkSync())
    })

    await t.step('isSymlink checks if path is symlink asynchronously', async () => {
      const dirPath = new Path(tempDir)
      const filePath = new Path(`${tempDir}/test-symlink-async.txt`)
      Deno.writeTextFileSync(filePath.path, 'test content')

      assertEquals(await dirPath.isSymlinkAsync(), false)
      assertEquals(await filePath.isSymlinkAsync(), false)
    })
  } finally {
    await Deno.remove(tempDir, { recursive: true })
  }
})

Deno.test('fs/path: Path type detection methods', async (t) => {
  const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' })

  try {
    await t.step('typeSync detects file type', () => {
      const filePath = new Path(`${tempDir}/test-file.txt`)
      Deno.writeTextFileSync(filePath.path, 'test content')

      assertEquals(filePath.typeSync(), 'file')
    })

    await t.step('typeSync detects directory type', () => {
      const dirPath = new Path(tempDir)

      assertEquals(dirPath.typeSync(), 'dir')
    })

    await t.step('typeSync detects void path type', () => {
      const voidPath = new Path(`${tempDir}/nonexistent`)

      assertEquals(voidPath.typeSync(), 'void')
    })

    await t.step('type detects file type', async () => {
      const filePath = new Path(`${tempDir}/test-file-type.txt`)
      Deno.writeTextFileSync(filePath.path, 'test content')
      assertEquals(await filePath.typeAsync(), 'file')
    })

    await t.step('type detects directory type', async () => {
      const dirPath = new Path(tempDir)

      assertEquals(await dirPath.typeAsync(), 'dir')
    })

    await t.step('type detects void path type', async () => {
      const voidPath = new Path(`${tempDir}/nonexistent-type`)

      assertEquals(await voidPath.typeAsync(), 'void')
    })
  } finally {
    await Deno.remove(tempDir, { recursive: true })
  }
})

Deno.test('fs/path: Path file information methods', async (t) => {
  const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' })

  try {
    await t.step('lstatSync returns file info without following symlinks', () => {
      const filePath = new Path(`${tempDir}/test-lstatsync.txt`)
      Deno.writeTextFileSync(filePath.path, 'test content')

      const fileInfo = filePath.lstatSync()
      assert(fileInfo.isFile)
    })

    await t.step('lstat returns file info without following symlinks asynchronously', async () => {
      const filePath = new Path(`${tempDir}/test-lstat.txt`)
      Deno.writeTextFileSync(filePath.path, 'test content')

      const fileInfo = await filePath.lstatAsync()
      assert(fileInfo.isFile)
    })

    await t.step('statSync returns file info following symlinks', () => {
      const filePath = new Path(`${tempDir}/test-statsync.txt`)
      Deno.writeTextFileSync(filePath.path, 'test content')

      const fileInfo = filePath.statSync()
      assert(fileInfo.isFile)
    })

    await t.step('stat returns file info following symlinks asynchronously', async () => {
      const filePath = new Path(`${tempDir}/test-stat.txt`)
      Deno.writeTextFileSync(filePath.path, 'test content')

      const fileInfo = await filePath.statAsync()
      assert(fileInfo.isFile)
    })
  } finally {
    await Deno.remove(tempDir, { recursive: true })
  }
})

Deno.test('fs/path: Path static factory methods', async (t) => {
  const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' })

  try {
    await t.step('Path.str returns string representation of PathLike', () => {
      const pathStr = '/some/test/path'
      const pathObj = new Path(pathStr)

      assertEquals(Path.str(pathStr), pathStr)
      assertEquals(Path.str(pathObj), pathStr)
    })
  } finally {
    await Deno.remove(tempDir, { recursive: true })
  }
})

Deno.test('fs/path: Path removal and moving operations', async (t) => {
  const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' })

  try {
    await t.step('Path removeSync removes file', () => {
      const filePath = new Path(`${tempDir}/to-be-removed-sync.txt`)
      Deno.writeTextFileSync(filePath.path, 'will be removed')

      assert(existsSync(filePath.path)) // File exists initially

      filePath.removeSync()

      assert(!existsSync(filePath.path)) // File should be removed
    })

    await t.step('Path remove removes file asynchronously', async () => {
      const filePath = new Path(`${tempDir}/to-be-removed-async.txt`)
      await Deno.writeTextFile(filePath.path, 'will be removed')

      assert(existsSync(filePath.path)) // File exists initially

      await filePath.removeAsync()

      assert(!existsSync(filePath.path)) // File should be removed
    })

    await t.step('Path removeSync removes directory', () => {
      const dirPath = new Path(`${tempDir}/dir-to-be-removed-sync`)
      Deno.mkdirSync(dirPath.path)

      assert(existsSync(dirPath.path)) // Directory exists initially

      dirPath.removeSync({ recursive: true })

      assert(!existsSync(dirPath.path)) // Directory should be removed
    })

    await t.step('Path remove removes directory asynchronously', async () => {
      const dirPath = new Path(`${tempDir}/dir-to-be-removed-async`)
      await Deno.mkdir(dirPath.path)

      assert(existsSync(dirPath.path)) // Directory exists initially

      await dirPath.removeAsync({ recursive: true })

      assert(!existsSync(dirPath.path)) // Directory should be removed
    })

    await t.step('Path moveTo moves file to new location', async () => {
      const sourcePath = new Path(`${tempDir}/source-move.txt`)
      const destPath = new Path(`${tempDir}/dest-move.txt`)

      Deno.writeTextFileSync(sourcePath.path, 'moving file')

      assert(existsSync(sourcePath.path)) // Source file exists
      assert(!existsSync(destPath.path)) // Destination doesn't exist yet

      await sourcePath.moveToAsync(destPath)

      assert(!existsSync(sourcePath.path)) // Source file no longer exists
      assert(existsSync(destPath.path)) // Destination file now exists
    })

    await t.step('Path moveToSync moves directory to new location', () => {
      const sourceDir = new Path(`${tempDir}/source-dir-sync`)
      const destDir = new Path(`${tempDir}/dest-dir-sync`)

      Deno.mkdirSync(sourceDir.path)
      Deno.writeTextFileSync(`${sourceDir.path}/test-file.txt`, 'test content')

      assert(existsSync(sourceDir.path)) // Source directory exists
      assert(!existsSync(destDir.path)) // Destination doesn't exist yet

      sourceDir.moveToSync(destDir)

      assert(!existsSync(sourceDir.path)) // Source directory no longer exists
      assert(existsSync(destDir.path)) // Destination directory now exists
    })
  } finally {
    await Deno.remove(tempDir, { recursive: true })
  }
})

Deno.test('fs/path: Path creation operations', async (t) => {
  const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' })

  try {
    await t.step('Path mkdir creates directory', async () => {
      const voidPath = new Path(`${tempDir}/new-dir`)
      const dirPath = await voidPath.mkdirAsync()

      assert(existsSync(dirPath.path))
    })

    await t.step('Path mkdirSync creates directory synchronously', () => {
      const voidPath = new Path(`${tempDir}/new-dir-sync`)
      const dirPath = voidPath.mkdirSync()

      assert(existsSync(dirPath.path))
    })

    await t.step('Path touch creates file', async () => {
      const voidPath = new Path(`${tempDir}/new-file.txt`)
      const filePath = await voidPath.touchAsync()

      assert(existsSync(filePath.path))
    })

    await t.step('Path touchSync creates file synchronously', () => {
      const voidPath = new Path(`${tempDir}/new-file-sync.txt`)
      const filePath = voidPath.touchSync()

      assert(existsSync(filePath.path))
    })

    await t.step('Path write creates and writes to file', async () => {
      const voidPath = new Path(`${tempDir}/write-test.txt`)
      await voidPath.writeAsync('Hello, World!')

      const content = await Deno.readTextFile(voidPath.path)
      assertEquals(content, 'Hello, World!')
    })

    await t.step('Path writeSync creates and writes to file synchronously', () => {
      const voidPath = new Path(`${tempDir}/write-test-sync.txt`)
      voidPath.writeSync('Hello, Sync World!')

      const content = Deno.readTextFileSync(voidPath.path)
      assertEquals(content, 'Hello, Sync World!')
    })

    await t.step('Path linkToSync creates hard link', () => {
      const filePath = `${tempDir}/original-file.txt`
      const linkPath = `${tempDir}/hard-link-sync.txt`

      Deno.writeTextFileSync(filePath, 'original content')

      const voidPath = new Path(linkPath)
      voidPath.linkToSync(filePath)

      assert(existsSync(linkPath)) // Link was created
    })

    await t.step('Path linkTo creates hard link asynchronously', async () => {
      const filePath = `${tempDir}/original-file-async.txt`
      const linkPath = `${tempDir}/hard-link-async.txt`

      await Deno.writeTextFile(filePath, 'original content')

      const voidPath = new Path(linkPath)
      await voidPath.linkToAsync(filePath)

      assert(existsSync(linkPath)) // Link was created
    })
  } finally {
    await Deno.remove(tempDir, { recursive: true })
  }
})

Deno.test('fs/path: Path file operations', async (t) => {
  const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' })

  try {
    await t.step('Path readSync reads file content as bytes', () => {
      const filePath = `${tempDir}/read-test.txt`
      const testData = 'Hello, Read Test!'
      Deno.writeTextFileSync(filePath, testData)

      const fileObj = new Path(filePath)
      const bytes = fileObj.readSync()
      const content = new TextDecoder().decode(bytes)

      assertEquals(content, testData)
    })

    await t.step('Path read reads file content as bytes asynchronously', async () => {
      const filePath = `${tempDir}/read-test-async.txt`
      const testData = 'Hello, Async Read Test!'
      await Deno.writeTextFile(filePath, testData)

      const fileObj = new Path(filePath)
      const bytes = await fileObj.readAsync()
      const content = new TextDecoder().decode(bytes)

      assertEquals(content, testData)
    })

    await t.step('Path readTextSync reads file content as string', () => {
      const filePath = `${tempDir}/read-text-test.txt`
      const testData = 'Hello, Read Text Test!'
      Deno.writeTextFileSync(filePath, testData)

      const fileObj = new Path(filePath)
      const content = fileObj.readTextSync()

      assertEquals(content, testData)
    })

    await t.step('Path readText reads file content as string asynchronously', async () => {
      const filePath = `${tempDir}/read-text-test-async.txt`
      const testData = 'Hello, Async Read Text Test!'
      await Deno.writeTextFile(filePath, testData)

      const fileObj = new Path(filePath)
      const content = await fileObj.readTextAsync()

      assertEquals(content, testData)
    })

    await t.step('Path writeSync updates file content', () => {
      const filePath = `${tempDir}/write-update-test.txt`
      const initialData = 'Initial content'
      Deno.writeTextFileSync(filePath, initialData)

      const fileObj = new Path(filePath)
      fileObj.writeSync('Updated content')

      const content = Deno.readTextFileSync(filePath)
      assertEquals(content, 'Updated content')
    })

    await t.step('Path write updates file content asynchronously', async () => {
      const filePath = `${tempDir}/write-update-test-async.txt`
      const initialData = 'Initial content'
      await Deno.writeTextFile(filePath, initialData)

      const fileObj = new Path(filePath)
      await fileObj.writeAsync('Updated content async')

      const content = await Deno.readTextFile(filePath)
      assertEquals(content, 'Updated content async')
    })
  } finally {
    await Deno.remove(tempDir, { recursive: true })
  }
})

Deno.test('fs/path: Path directory operations', async (t) => {
  const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' })

  try {
    await t.step('Path listSync returns directory entries', () => {
      // Create some test files
      Deno.writeTextFileSync(`${tempDir}/file1.txt`, 'content1')
      Deno.writeTextFileSync(`${tempDir}/file2.txt`, 'content2')
      Deno.mkdirSync(`${tempDir}/subdir`)

      const dirObj = new Path(tempDir)
      const entries = dirObj.listSync()

      assertEquals(entries.length, 3) // file1.txt, file2.txt, subdir

      const entryNames = entries.map((entry) => entry.name).sort()
      assertEquals(entryNames, ['file1.txt', 'file2.txt', 'subdir'].sort())
    })

    await t.step('Path list returns directory entries asynchronously', async () => {
      // Create a subdirectory for this test
      const testSubDir = `${tempDir}/async-list-test`
      Deno.mkdirSync(testSubDir)

      // Create some test files in the subdirectory
      Deno.writeTextFileSync(`${testSubDir}/async-file1.txt`, 'content1')
      Deno.writeTextFileSync(`${testSubDir}/async-file2.txt`, 'content2')
      Deno.mkdirSync(`${testSubDir}/async-subdir`)

      const dirObj = new Path(testSubDir)
      const entries = await dirObj.listAsync()

      assertEquals(entries.length, 3) // async-file1.txt, async-file2.txt, async-subdir

      const entryNames = entries.map((entry) => entry.name).sort()
      assertEquals(entryNames, ['async-file1.txt', 'async-file2.txt', 'async-subdir'].sort())
    })
  } finally {
    await Deno.remove(tempDir, { recursive: true })
  }
})

Deno.test('fs/path: Path symlink operations', async (t) => {
  const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' })

  try {
    await t.step('Path targetSync returns link target', () => {
      const targetPath = `${tempDir}/target.txt`
      const linkPath = `${tempDir}/link.txt`

      Deno.writeTextFileSync(targetPath, 'target content')
      Deno.symlinkSync(targetPath, linkPath)

      const symlinkObj = new Path(linkPath)
      const target = symlinkObj.targetSync()

      assertEquals(p`${target.path}`, p`${targetPath}`)
    })

    await t.step('Path target returns link target asynchronously', async () => {
      const targetPath = `${tempDir}/target-async.txt`
      const linkPath = `${tempDir}/link-async.txt`

      Deno.writeTextFileSync(targetPath, 'target content')
      await Deno.symlink(targetPath, linkPath)

      const symlinkObj = new Path(linkPath)
      const target = await symlinkObj.targetAsync()

      assertEquals(p`${target.path}`, p`${targetPath}`)
    })
  } catch (error) {
    // Skip symlink tests on Windows if not running with elevated privileges
    if (!(error instanceof Deno.errors.PermissionDenied && Deno.build.os === 'windows')) {
      throw error
    }
  } finally {
    await Deno.remove(tempDir, { recursive: true })
  }
})

Deno.test('fs/path: Path static helper methods', async (t) => {
  const tempDir = await Deno.makeTempDir({ prefix: 'test-inventory-ts-' })

  try {
    await t.step('Path.cwd returns current working directory as Path', () => {
      const cwd = Path.cwd()
      assert(cwd.isAbsolute)
    })
  } finally {
    await Deno.remove(tempDir, { recursive: true })
  }
})

Deno.test('fs/path: sync/async switch', () => {
  withTempDirSync(async (tempDir) => {
    const p = Path.from(tempDir)
    const ps = p.sync

    ps.list()

    const pa = p.async
    await pa.list()
  })
})
