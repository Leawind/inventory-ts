import * as std_path from '@std/path'
import { r } from '../tstr/index.ts'
import { Path } from './path.ts'

/**
 * Path string template
 *
 * ### Example
 *
 * ```ts
 * p`C:\Windows\System32`;      // 'C:\\Windows\\System32'
 * p`C:\\Windows\\System32`;    // 'C:\\Windows\\System32'
 * ```
 */
export function p(strs: TemplateStringsArray, ...args: unknown[]): string {
  return std_path.normalize(r(strs, ...args))
}

export function P(strs: TemplateStringsArray, ...args: unknown[]): Path {
  return new Path(std_path.normalize(r(strs, ...args)))
}
