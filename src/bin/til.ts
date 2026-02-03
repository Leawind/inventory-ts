import { Wash } from '@/wash/index.ts'

const wash = Wash.default()

const exe = wash.findExecutableFile(Deno.args[0])

if (!exe) {
  console.error(`Could not find executable for '${Deno.args[0]}'`)
  Deno.exit(1)
}

let code: number

do {
  const command = new Deno.Command(exe, {
    args: Deno.args.slice(1),
    stdin: 'inherit',
    stdout: 'inherit',
    stderr: 'inherit',
  })

  const proc = command.spawn()
  code = (await proc.status).code
  console.info(`[til.ts] Exited with code ${code}`)
} while (true)
