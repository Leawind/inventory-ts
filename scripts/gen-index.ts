import { program } from 'npm:commander@^14.0'
import { FilePath, Path } from '@/fs/index.ts'
import log from '@/log/index.ts'
import { genIndex } from '@/index-gen/index.ts'

type CliOptions = {
  check: boolean
  quiet: boolean
  verbose: boolean
}

if (import.meta.main) {
  program
    .name('gen-index')
    .description(`Recursively generates or validates index.ts files in a directory`)
    .argument('<dir>', 'Directory to process index files in')
    .option('-c, --check', 'Validate index files without making changes', false)
    .option('-q, --quiet', 'Suppress all output except errors', false)
    .option('-v, --verbose', 'Enable detailed logging', false)
    .action(async (dir: string, options: CliOptions) => {
      if (options.quiet && options.verbose) {
        log.error('ERROR: --quiet and --verbose options cannot be used simultaneously')
        Deno.exit(1)
      }
      log.api.setLevel(options.verbose ? 'trace' : options.quiet ? 'none' : 'info')

      const outdatedFiles: FilePath[] = []
      const rootDir = await Path.dir(dir)
      for await (const entry of await rootDir.list()) {
        if (await entry.isDirectory()) {
          const outdates = await genIndex(entry, { check: options.check })
          outdatedFiles.push(...outdates)
          if (outdates.length > 0) {
            log.warn(`BAD: ${entry}`)
          } else {
            log.info(`GOOD: ${entry}`)
          }
        }
      }

      if (outdatedFiles.length > 0) {
        log.error('FAILURE: The following index files are outdated:')
        outdatedFiles.forEach((file) => log.error('  ' + file))
        Deno.exit(1)
      } else {
        log.info('SUCCESS: All index files are up to date')
      }
    })
    .parse([Deno.execPath(), ...Deno.args])
}
