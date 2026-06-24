import { minimatch } from 'minimatch'

/** Default glob patterns to ignore when collecting project files. */
export const DEFAULT_IGNORE_PATTERNS: readonly string[] = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.git/**',
  '**/target/**',
  '**/bin/**',
  '**/*.class',
  '**/*.jar',
  '**/*.war',
  '**/*.ear',
  '**/*.png',
  '**/*.jpg',
  '**/*.jpeg',
  '**/*.gif',
  '**/*.ico',
  '**/*.svg',
  '**/*.woff',
  '**/*.woff2',
  '**/*.ttf',
  '**/*.eot',
  '**/*.zip',
  '**/*.tar',
  '**/*.gz',
  '**/*.exe',
  '**/*.dll',
  '**/*.so',
  '**/*.dylib',
  '**/src/test/**',
]

/**
 * Create a filter function that returns `true` when the given path matches
 * any of the provided ignore patterns.
 *
 * If `patterns` is empty or not provided, {@link DEFAULT_IGNORE_PATTERNS} is used.
 */
export function createIgnoreFilter(patterns?: readonly string[]): (relativePath: string) => boolean {
  const effective = patterns && patterns.length > 0 ? patterns : DEFAULT_IGNORE_PATTERNS
  return (relativePath: string) => effective.some((p) => minimatch(relativePath, p))
}
