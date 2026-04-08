import { program } from 'npm:commander@^14.0'
import { Path } from '../src/fs/index.ts'
import log from '../src/log/index.ts'
import { generateIndex } from '../src/index-gen/index.ts'

const DIR_SOURCE = Path.from('./src')
const FILE_DENO_JSON = Path.from('./deno.json')

type CliOptions = {
  check: boolean
  quiet: boolean
  verbose: boolean
}

if (import.meta.main) {
  program
    .name('gen-index')
    .option('-c, --check', 'Validate index files without making changes', false)
    .option('-q, --quiet', 'Suppress all output except errors', false)
    .option('-v, --verbose', 'Enable detailed logging', false)
    .action(async (opts: CliOptions) => {
      if (opts.quiet && opts.verbose) {
        log.error('ERROR: --quiet and --verbose options cannot be used simultaneously')
        Deno.exit(1)
      }
      log.api.setLevel(opts.verbose ? 'trace' : opts.quiet ? 'none' : 'info')

      const outdatedFiles: Path[] = []

      for await (const entry of await DIR_SOURCE.list()) {
        if (await entry.isDirectory()) {
          const outdates = await generateIndex(entry, { check: opts.check })
          outdatedFiles.push(...outdates)
          if (outdates.length > 0) {
            log.warn(`BAD: ${entry}`)
          } else {
            log.info(`GOOD: ${entry}`)
          }
        }
      }

      const exporteds: [string, string][] = []

      outdatedFiles.push(
        ...await generateIndex(DIR_SOURCE, {
          check: opts.check,
          maxDepth: 0,
          exportStatements: (path: string, name: string) => [
            // `export * from './${path}'`,
            `export * as ${name.replace(/-/g, '_')} from '${path}'`,
          ],

          onEntry: (path: Path, name: string) => {
            exporteds.push(['./' + name, './' + path.relative('.').str])
          },
        }),
      )

      // update deno.json
      {
        const manifest = JSON.parse(await FILE_DENO_JSON.readText())

        for (const [name, path] of exporteds) {
          manifest.exports[name] = path
        }

        // sort by key
        const entries = Object.entries(manifest.exports)
          .sort((a, b) => a[0].localeCompare(b[0]))
        manifest.exports = Object.fromEntries(entries)

        outdatedFiles.push(
          ...await writeIfDifferent(FILE_DENO_JSON, JSON.stringify(manifest, null, 2) + '\n', opts.check),
        )
      }

      if (opts.check && outdatedFiles.length > 0) {
        log.error('FAILURE: The following index files are outdated:')
        outdatedFiles.forEach((file) => log.error('  ' + file))
        Deno.exit(1)
      } else {
        log.info('SUCCESS: All index files are up to date')
      }
    })
    .parse([Deno.execPath(), ...Deno.args])
}

async function writeIfDifferent(path: Path, content: string, checkOnly: boolean = false): Promise<Path[]> {
  const existing = await path.readText()
  if (existing === content) {
    return []
  }

  log.info(`Update to:\n${content}`)

  if (!checkOnly) {
    await path.write(content)
  }
  return [path]
}
