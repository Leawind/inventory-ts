import * as path from '@std/path'
import ignore from 'ignore'

/**
 * Get all file paths under the given directory that are not excluded by .gitignore.
 *
 * Walks the directory tree, reads .gitignore files at each level, and filters
 * out matching paths using the `ignore` package (implements .gitignore spec 2.22.1).
 */
export async function getGitNonIgnoredFiles(dir: string): Promise<string[]> {
  const results: string[] = []
  await walk(dir, '', ignore(), results)
  return results.sort()
}

async function walk(
  absoluteDir: string,
  relParent: string,
  parentIg: ReturnType<typeof ignore>,
  results: string[],
): Promise<void> {
  // Create a child ignore instance inheriting parent rules
  const ig = ignore()
  ig.add(parentIg as any)

  // Read .gitignore in this directory if it exists
  try {
    const content = await Deno.readTextFile(path.join(absoluteDir, '.gitignore'))
    ig.add(content)
  } catch {
    // No .gitignore file
  }

  for await (const entry of Deno.readDir(absoluteDir)) {
    const rel = relParent ? `${relParent}/${entry.name}` : entry.name

    // Always skip .git directory
    if (entry.name === '.git') { continue }

    // Use trailing slash for directories to match .gitignore semantics
    const testPath = entry.isDirectory ? `${rel}/` : rel
    if (ig.ignores(testPath)) { continue }

    if (entry.isDirectory) {
      await walk(path.join(absoluteDir, entry.name), rel, ig, results)
    } else {
      results.push(rel)
    }
  }
}
