import { assert, assertArrayIncludes, assertEquals, assertRejects, assertStringIncludes } from '@std/assert'
import * as path from '@std/path'
import { getGitNonIgnoredFiles } from './git.ts'
import { isBinary } from './binary.ts'
import { createIgnoreFilter } from './ignore.ts'
import { type CollectedFile, collectFiles, formatCollected } from './core.ts'

// ============= binary.ts =============

Deno.test('isBinary returns false for plain text', () => {
  const text = new TextEncoder().encode('hello world')
  assertEquals(isBinary(text), false)
})

Deno.test('isBinary returns true for content with null byte', () => {
  assertEquals(isBinary(new Uint8Array([0, 1, 2])), true)
})

Deno.test('isBinary returns true for null byte at end', () => {
  const buf = new Uint8Array(100)
  buf[99] = 0
  assertEquals(isBinary(buf), true)
})

Deno.test('isBinary returns false for empty content', () => {
  assertEquals(isBinary(new Uint8Array(0)), false)
})

Deno.test('isBinary checks first 8192 bytes only', () => {
  // Uint8Array is zero-initialised, so fill with non-zero first to avoid
  // hitting a null byte before the intended position
  const buf = new Uint8Array(8193).fill(1)
  buf[8192] = 0 // null at position just past the 8192-byte window
  assertEquals(isBinary(buf), false)

  // Null byte at position 8191 (within the first 8192 bytes)
  const buf2 = new Uint8Array(8192).fill(1)
  buf2[8191] = 0
  assertEquals(isBinary(buf2), true)
})

// ============= ignore.ts =============

Deno.test('createIgnoreFilter with default patterns ignores node_modules paths', () => {
  const filter = createIgnoreFilter()
  assertEquals(filter('node_modules/pkg/index.js'), true)
  assertEquals(filter('src/index.ts'), false)
})

Deno.test('createIgnoreFilter with default patterns ignores dist and build', () => {
  const filter = createIgnoreFilter()
  assertEquals(filter('dist/bundle.js'), true)
  assertEquals(filter('build/output.js'), true)
  assertEquals(filter('.git/HEAD'), true)
})

Deno.test('createIgnoreFilter with default patterns ignores binary extensions', () => {
  const filter = createIgnoreFilter()
  assertEquals(filter('images/logo.png'), true)
  assertEquals(filter('fonts/roboto.woff2'), true)
  assertEquals(filter('app.exe'), true)
  assertEquals(filter('archive.zip'), true)
})

Deno.test('createIgnoreFilter with default patterns ignores src/test/**', () => {
  const filter = createIgnoreFilter()
  assertEquals(filter('src/test/foo.ts'), true)
  assertEquals(filter('src/test/deep/bar.ts'), true)
  assertEquals(filter('src/test.ts'), false)
})

Deno.test('createIgnoreFilter with empty array falls back to defaults', () => {
  const filter = createIgnoreFilter([])
  assertEquals(filter('node_modules/pkg/index.js'), true)
  assertEquals(filter('src/index.ts'), false)
})

Deno.test('createIgnoreFilter with custom patterns overrides defaults', () => {
  const customs = ['*.log', 'build/**'] as const
  const filter = createIgnoreFilter(customs)
  // Custom patterns apply
  assertEquals(filter('error.log'), true)
  assertEquals(filter('build/output.js'), true)
  // Defaults no longer apply
  assertEquals(filter('node_modules/pkg/index.js'), false)
})

Deno.test('createIgnoreFilter handles edge cases', () => {
  const filter = createIgnoreFilter(['*.tmp'])
  assertEquals(filter('file.tmp'), true)
  assertEquals(filter('file.tmp2'), false)
  assertEquals(filter('tmp/file.txt'), false)
  assertEquals(filter(''), false)
})

Deno.test('createIgnoreFilter excludes custom directory and its sub-files', () => {
  const filter = createIgnoreFilter(['generated/**'])
  // Files directly under the directory
  assertEquals(filter('generated/api.ts'), true)
  // Files deeply nested
  assertEquals(filter('generated/sub/db/models.ts'), true)
  assertEquals(filter('generated/a/b/c/d/e/f/util.ts'), true)
  // The directory name itself (not a file path with slash)
  assertEquals(filter('generated'), false)
  // Files in other directories should not be affected
  assertEquals(filter('src/generated.ts'), false)
  assertEquals(filter('other/generated/file.ts'), false)
})

// ============= git.ts =============

Deno.test('getGitNonIgnoredFiles returns array of files from current repo', async () => {
  const files = await getGitNonIgnoredFiles(Deno.cwd())
  assert(files.length > 0, 'should have files')
  // Use files that are already committed in the repo
  assertArrayIncludes(files, ['src/index.ts'])
  assertArrayIncludes(files, ['src/fs/basic.ts'])
})

Deno.test('getGitNonIgnoredFiles returns sorted results', async () => {
  const files = await getGitNonIgnoredFiles(Deno.cwd())

  // Check that files are sorted alphabetically
  const copy = [...files].sort()
  assertEquals(files, copy)
})

Deno.test('getGitNonIgnoredFiles works on non-git directory', async () => {
  // Create a temp directory that is NOT a git repo
  const tempDir = await Deno.makeTempDir({ prefix: 'test-non-git-' })
  try {
    await Deno.writeTextFile(path.join(tempDir, 'hello.txt'), 'hi')
    const files = await getGitNonIgnoredFiles(tempDir)
    assertArrayIncludes(files, ['hello.txt'])
  } finally {
    await Deno.remove(tempDir, { recursive: true })
  }
})

// ============= core.ts (formatCollected) =============

const SEP = '-'.repeat(80) + '\n'

Deno.test('formatCollected returns empty string for empty array', () => {
  assertEquals(formatCollected([]), '')
})

Deno.test('formatCollected formats a text file', () => {
  const files: CollectedFile[] = [{ relativePath: 'src/a.ts', content: 'console.log(1)', binary: false }]
  const result = formatCollected(files)
  assertStringIncludes(result, '// Source: src/a.ts')
  assertStringIncludes(result, 'console.log(1)')
  assertStringIncludes(result, SEP)
})

Deno.test('formatCollected formats a binary file', () => {
  const files: CollectedFile[] = [{ relativePath: 'img/logo.png', content: '', binary: true }]
  const result = formatCollected(files)
  assertStringIncludes(result, '// [BINARY]: img/logo.png')
})

Deno.test('formatCollected formats an error entry', () => {
  const files: CollectedFile[] = [{
    relativePath: 'bad/file.txt',
    content: '',
    binary: false,
    error: 'Permission denied',
  }]
  const result = formatCollected(files)
  assertStringIncludes(result, '// [ERROR]: bad/file.txt - Permission denied')
})

Deno.test('formatCollected formats mixed entries', () => {
  const files: CollectedFile[] = [
    { relativePath: 'src/a.ts', content: 'code', binary: false },
    { relativePath: 'img/b.png', content: '', binary: true },
    { relativePath: 'err/c.ts', content: '', binary: false, error: 'Oops' },
  ]
  const result = formatCollected(files)
  assertStringIncludes(result, '// Source: src/a.ts')
  assertStringIncludes(result, '// [BINARY]: img/b.png')
  assertStringIncludes(result, '// [ERROR]: err/c.ts - Oops')
})

Deno.test('formatCollected uses custom separator', () => {
  const customSep = '===END===\n'
  const files: CollectedFile[] = [{ relativePath: 'a.txt', content: 'hi', binary: false }]
  const result = formatCollected(files, customSep)
  assertStringIncludes(result, customSep)
})

// ============= core.ts (collectFiles) =============

Deno.test('collectFiles throws for non-directory', async () => {
  const filePath = 'src/collect-files/binary.ts'
  await assertRejects(
    () => collectFiles(filePath),
    Error,
    'is not a directory',
  )
})

Deno.test('collectFiles returns files from current repo', async () => {
  const results = await collectFiles(Deno.cwd())
  assert(results.length > 0, 'should collect files')

  // Known tracked text file should appear
  const paths = results.map((f) => f.relativePath)
  assert(paths.includes('src/index.ts'), 'should include src/index.ts')

  // node_modules should be filtered out
  for (const r of results) {
    assert(!r.relativePath.startsWith('node_modules/'), `not expected: ${r.relativePath}`)
  }
})

Deno.test('collectFiles skips binary files by default', async () => {
  const results = await collectFiles(Deno.cwd())
  // Files that are binary should not appear (e.g., no .png or .class files)
  for (const r of results) {
    assert(!r.relativePath.endsWith('.png'), `binary .png should be skipped: ${r.relativePath}`)
  }
})

Deno.test('collectFiles has text files with non-empty content', async () => {
  const results = await collectFiles(Deno.cwd())
  const entry = results.find((f) => f.relativePath === 'src/index.ts')
  assert(entry, 'should find src/index.ts')
  assertEquals(entry.binary, false)
  assertEquals(entry.error, undefined)
  assert(entry.content.length > 0, 'content should not be empty')
  assertStringIncludes(entry.content, 'export')
})

Deno.test('collectFiles with includeBinary=true returns files', async () => {
  // Just sanity-check that the option doesn't break collection
  const results = await collectFiles(Deno.cwd(), { includeBinary: true })
  assert(results.length > 0)
  const paths = results.map((f) => f.relativePath)
  assert(paths.includes('src/index.ts'))
})

Deno.test('collectFiles with custom ignore patterns', async () => {
  // Collect all files except .ts files
  const results = await collectFiles(Deno.cwd(), { ignorePatterns: ['**/*.ts'] })
  // No .ts files should appear
  for (const r of results) {
    assert(!r.relativePath.endsWith('.ts'), `unexpected .ts file: ${r.relativePath}`)
  }
})

Deno.test('collectFiles with empty ignore patterns uses defaults', async () => {
  const results = await collectFiles(Deno.cwd(), { ignorePatterns: [] })
  // node_modules should still be filtered out by defaults
  for (const r of results) {
    assert(!r.relativePath.startsWith('node_modules/'), `not expected: ${r.relativePath}`)
  }
})
