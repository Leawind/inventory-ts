import log from '../log/index.ts'
import type { PathLike } from '../fs/index.ts'
import { Path } from '../fs/index.ts'
import { r } from '../tstr/index.ts'

export type Options = {
  maxDepth: number
  check: boolean
  startLine: string
  endLine: string
  startLinePattern?: RegExp
  endLinePattern?: RegExp
  exportStatements(path: string, name: string): string[]
  fileFilter: (path: Path) => boolean
  dirFilter: (path: Path) => boolean

  onEntry?: (filePath: Path, name: string) => void
}
/**
 * Recursively generates or validates index.ts files in a directory structure.
 *
 * @param path - The root directory to process
 * @param options - Configuration options for the index generation
 * @returns Array of outdated index files (when in check mode)
 */
export async function generateIndex(path: PathLike, options: Partial<Options>, depth: number = 0): Promise<Path[]> {
  const opts: Options = Object.assign({
    maxDepth: Infinity,
    check: true,
    startLine: `// Index start >>>>>>>>>>>>>>>>`,
    endLine: `// <<<<<<<<<<<<<<<<   Index end`,
    startLinePattern: /^\/\/ +Index start +>>>>>>>>>>>>>>>> *$/,
    endLinePattern: /^\/\/ +<<<<<<<<<<<<<<<< +Index end *$/,
    exportStatements: (path: string, _name: string) => [`export * from '${path}'`],
    fileFilter: (path: Path) => /.*\.ts$/.test(path.name) && !/(^index\.ts$)|(.*\.test\.ts$)/.test(path.name),
    dirFilter: (path: Path) => !/^(\..*)|(test)$/.test(path.name),
  }, options)

  if (opts.maxDepth < 0) {
    log.warn(r`Max depth must be >= 0, but got ${opts.maxDepth}`)
  }

  const indent = '  '.repeat(depth)
  const dir = Path.from(path)

  const indexFile = dir.join('index.ts')
  log.trace(indent + indexFile)

  const statements: string[] = []
  const outdatedFiles: Path[] = []

  const children = (await dir.listAsync())
    .filter((path: Path) => path.matchSync({ file: opts.fileFilter, dir: opts.dirFilter }))
    .sort((a, b) => a.path.localeCompare(b.path))
  for (const child of children) {
    await child.matchAsync({
      file(path) {
        opts.onEntry?.(path, path.nameNoExt)

        opts.exportStatements(`./${path.name}`, path.nameNoExt)
          .forEach((statement) => {
            log.trace(indent + statement)
            statements.push(statement)
          })
      },
      async dir(path) {
        if ((await path.listAsync()).length > 0) {
          opts.onEntry?.(path.join('index.ts'), path.name)

          opts.exportStatements(`./${path.name}/index.ts`, path.name)
            .forEach((statement) => {
              log.trace(indent + statement)
              statements.push(statement)
            })

          if (opts.maxDepth > 0) {
            outdatedFiles.push(
              ...await generateIndex(
                path,
                Object.assign({}, opts, { maxDepth: opts.maxDepth - 1 }),
                depth + 1,
              ),
            )
          }
        }
      },
    })
  }

  const content = await indexFile.isFileAsync() ? await indexFile.readTextAsync() : ''

  // Find start and end lines using string or regex matching
  const lines = content.split('\n')

  const matcher: (pattern: string | RegExp) => (line: string) => boolean = (pattern: string | RegExp) => {
    if (pattern instanceof RegExp) {
      return (line: string) => pattern.test(line)
    }
    return (line: string) => line === pattern
  }

  const startIndex = lines.findIndex(matcher(opts.startLinePattern ?? opts.startLine))
  const endIndex = startIndex >= 0
    ? lines.slice(startIndex).findIndex(matcher(opts.endLinePattern ?? opts.endLine))
    : -1

  if (startIndex === -1) {
    log.trace(indent + `${indexFile.path} ...Skipping: Index markers not found`)
    return outdatedFiles
  }

  const newIndexContent = [opts.startLine, ...statements, opts.endLine].join('\n')

  if (endIndex === -1) {
    lines.splice(startIndex, Infinity, newIndexContent)
  } else {
    lines.splice(startIndex, endIndex + 1, newIndexContent)
  }

  let replaced = lines.join('\n')
  if (!replaced.endsWith('\n')) {
    replaced += '\n'
  }

  if (content.trim() !== replaced.trim()) {
    log.trace(`${indexFile.path} ...Updating content:\n${newIndexContent}`)
    if (opts.check) {
      log.trace(indent + c(91)`${indexFile.path} ...Outdated`)
      return [...outdatedFiles, indexFile]
    } else {
      await indexFile.writeAsync(replaced)
      log.trace(indent + c(92)`${indexFile.path} ...Updated`)
      return []
    }
  }

  log.trace(indent + c(92)`${indexFile.path} ...Up to date`)
  return outdatedFiles

  function c(id: number) {
    return (strs: TemplateStringsArray, ...args: unknown[]): string => {
      return `\x1b[${id}m${r(strs, ...args)}\x1b[0m`
    }
  }
}
