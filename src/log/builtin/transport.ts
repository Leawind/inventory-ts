import type { Awaitable } from '@leawind/inventory/types'
import { BaseTransport, type LogEntry } from '../api.ts'
import { Logger } from '../logger.ts'

export class CliTransport extends BaseTransport {
  public stderrThreshold = Logger.levelNumberOf('error')

  public constructor() {
    super()
  }

  override log(entry: LogEntry): Awaitable<void> {
    const level = Logger.levelNumberOf(entry.level)
    const formatted = this.getFormatted(entry)
    if (formatted !== null) {
      if (level <= this.stderrThreshold) {
        Deno.stderr.writeSync(new TextEncoder().encode(formatted + '\n'))
      } else {
        Deno.stdout.writeSync(new TextEncoder().encode(formatted + '\n'))
      }
    }
  }
}
