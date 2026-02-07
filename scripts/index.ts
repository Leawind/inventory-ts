import { program } from 'npm:commander'
import { fs } from '@/index.ts'

program
  .name('index')
  .description('Generate or check root index files')
  .option('-c, --check', 'Check if index files are prepared', false)
  .action(async (options: { check: boolean }) => {
    type ExportedItem = {
      id: string
      export: string
      import: string
    }

    type BinItem = {
      id: string
      path: string
    }

    function normalizeName(name: string) {
      return name.replace(/[^a-zA-Z0-9_$]/g, '_')
    }

    function isValidBinName(name: string): boolean {
      return /^\p{ID_Start}\p{ID_Continue}*$/u.test(name)
    }

    function writeIfDifferentSync(path: string, content: string) {
      if (fs.existsSync(path)) {
        const existing = Deno.readTextFileSync(path)
        if (existing === content) {
          return
        }
        if (options.check) {
          console.error(`File is not prepared: ${path}`)
          Deno.exit(1)
        } else {
          Deno.writeTextFileSync(path, content)
        }
      }
    }

    const exporteds: ExportedItem[] = []
    Deno.readDirSync(fs.p`./src`)
      .forEach((entry) => {
        if (entry.isFile) {
          if (
            !entry.name.endsWith('.ts')
            || entry.name === 'index.ts'
            || entry.name === 'mod.ts'
          ) {
            return
          }

          const name = entry.name.replace(/\.ts$/, '')

          exporteds.push({
            id: normalizeName(name),
            import: `@/${entry.name}`,
            export: `./src/${entry.name}`,
          })
        } else if (entry.isDirectory) {
          const name = entry.name

          // For subdirectories, we always assume they have an index.ts
          // The actual generation of these index.ts files is handled by scripts/gen-index.ts
          exporteds.push({
            id: normalizeName(name),
            import: `@/${name}/index.ts`,
            export: `./src/${name}/index.ts`,
          })
        }
      })

    exporteds.sort((a, b) => a.id.localeCompare(b.id))

    {
      // Write src/index.ts
      const lines: string[] = exporteds.map((item) => `export * as ${item.id} from '${item.import}'`)
      writeIfDifferentSync('./src/index.ts', lines.join('\n') + '\n')
    }

    {
      // Write deno.json
      const manifest = JSON.parse(Deno.readTextFileSync(fs.p`./deno.json`))

      // Exports
      {
        manifest.exports = exporteds.reduce<Record<string, string>>((exports, item) => {
          exports[`./${item.id}`] = item.export
          return exports
        }, {})

        manifest.exports['.'] = './src/index.ts'
      }

      writeIfDifferentSync(fs.p`./deno.json`, JSON.stringify(manifest, null, '  ') + '\n')
    }

    if (options.check) {
      console.log(`Good.`)
    }
  })
  .parse([Deno.execPath(), ...Deno.args])
