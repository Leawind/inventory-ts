import * as path from '@std/path'
import { getGitNonIgnoredFiles } from './git.ts'
import { isBinary } from './binary.ts'
import { createIgnoreFilter } from './ignore.ts'

/** Options for collecting files. */
export interface CollectOptions {
  /** Whether to include binary file contents as text (best-effort decode). Default: false. */
  includeBinary?: boolean
  /** Glob patterns to ignore. If omitted, {@link DEFAULT_IGNORE_PATTERNS} is used. */
  ignorePatterns?: readonly string[]
}

/** A single collected file result. */
export interface CollectedFile {
  /** Path relative to the source directory. */
  relativePath: string
  /** Decoded text content (may be empty for unreadable/binary files). */
  content: string
  /** Whether the file was detected as binary. */
  binary: boolean
  /** Error message when the file could not be read, or undefined on success. */
  error?: string
}

/**
 * Collect all files under `sourceDir` that are not excluded by .gitignore,
 * returning their contents.
 *
 * Files matching `options.ignorePatterns` (or the built-in default list) are
 * skipped. Binary files are skipped unless `options.includeBinary` is true.
 */
export async function collectFiles(sourceDir: string, options?: CollectOptions): Promise<CollectedFile[]> {
  const stat = await Deno.stat(sourceDir)
  if (!stat.isDirectory) {
    throw new Error(`${sourceDir} is not a directory`)
  }

  const tracked = await getGitNonIgnoredFiles(sourceDir)
  const isIgnored = createIgnoreFilter(options?.ignorePatterns)

  const filtered = tracked.filter((f) => !isIgnored(f))
  const results: CollectedFile[] = []

  for (const relativePath of filtered) {
    const fullPath = path.join(sourceDir, relativePath)

    try {
      const raw = await Deno.readFile(fullPath)
      const binary = isBinary(raw)

      if (binary && !options?.includeBinary) {
        continue
      }

      let content: string
      try {
        content = new TextDecoder('utf-8', binary ? { fatal: false } : {}).decode(raw)
      } catch {
        content = ''
      }

      results.push({ relativePath, content, binary })
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      results.push({ relativePath, content: '', binary: false, error: message })
    }
  }

  return results
}

/** Format collected files into a single text blob (suitable for writing to a file). */
export function formatCollected(files: CollectedFile[], separator: string = '-'.repeat(80) + '\n'): string {
  const parts: string[] = []
  for (const f of files) {
    if (f.error) {
      parts.push(`// [ERROR]: ${f.relativePath} - ${f.error}\n\n${separator}\n\n`)
    } else if (f.binary) {
      parts.push(`// [BINARY]: ${f.relativePath}\n\n${separator}\n\n`)
    } else {
      parts.push(`// Source: ${f.relativePath}\n\n${f.content}\n\n${separator}\n\n`)
    }
  }
  return parts.join('')
}
