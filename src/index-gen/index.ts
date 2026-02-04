import log from '../log/index.ts'
import type { DirPath, FilePath, PathLike } from '../fs/index.ts'
import { Path } from '../fs/index.ts'
import { r } from '../tstr/index.ts'

export type Options = {
  depth: number
  check: boolean
  startLine: string
  endLine: string
  startLinePattern?: RegExp
  endLinePattern?: RegExp
  exportStatement(path: string): string
  fileFilter: (path: FilePath) => boolean
  dirFilter: (path: DirPath) => boolean
}
/**
 * Recursively generates or validates index.ts files in a directory structure.
 *
 * @param path - The root directory to process
 * @param options - Configuration options for the index generation
 * @returns Array of outdated index files (when in check mode)
 */
export async function genIndex(path: PathLike, options: Partial<Options>): Promise<FilePath[]> {
  const opts: Options = Object.assign({
    depth: 0,
    check: true,
    startLine: `// Index start >>>>>>>>>>>>>>>>`,
    endLine: `// <<<<<<<<<<<<<<<<   Index end`,
    startLinePattern: /^\/\/ +Index start +>>>>>>>>>>>>>>>> *$/,
    endLinePattern: /^\/\/ +<<<<<<<<<<<<<<<< +Index end *$/,
    exportStatement: (path: string) => `export * from '${path}'`,
    fileFilter: (path: FilePath) => /.*\.ts$/.test(path.name) && !/(^index\.ts$)|(.*\.test\.ts$)/.test(path.name),
    dirFilter: (path: DirPath) => !/^(\..*)|(test)$/.test(path.name),
  }, options)

  const indent = '  '.repeat(opts.depth)
  const dir = await Path.dir(path)

  const indexFile = await dir.join('index.ts').asFile(false)
  log.trace(indent + indexFile)

  const statements: string[] = []
  const outdatedFiles: FilePath[] = []

  const children = (await dir.list())
    .filter((path: Path) => path.matchSync({ file: opts.fileFilter, dir: opts.dirFilter }))
    .sort((a, b) => a.path.localeCompare(b.path))
  for (const child of children) {
    await child.match({
      file(path) {
        const statement = opts.exportStatement(`./${path.name}`)
        log.trace(indent + statement)
        statements.push(statement)
      },
      async dir(path) {
        if ((await path.list()).length > 0) {
          const statement = opts.exportStatement(`./${path.name}/index.ts`)
          log.trace(indent + statement)
          statements.push(statement)
          outdatedFiles.push(...await genIndex(path, Object.assign({}, opts, { depth: opts.depth + 1 })))
        }
      },
    })
  }

  const content = await indexFile.isFile() ? await indexFile.readText() : ''

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
      await indexFile.write(replaced)
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
