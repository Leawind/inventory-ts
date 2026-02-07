//! Template Strings

import * as std_path from '@std/path'

/**
 * Interleaves two arrays by alternating their elements.
 *
 * Takes elements from both arrays alternately, starting with the first array.
 * If one array is longer than the other, the remaining elements are appended to the result.
 *
 * ### Generic Type
 *
 * - `T` - The type of elements in the arrays
 *
 * ### Params
 *
 * - `a` The first array
 * - `b` The second array
 *
 * ### Returns
 *
 * A new array with elements interleaved from both input arrays
 *
 * ### Example
 *
 * ```ts
 * interleave([1, 3, 5], [2, 4, 6]); // [1, 2, 3, 4, 5, 6]
 * interleave(['a', 'c'], ['b', 'd', 'e']); // ['a', 'b', 'c', 'd', 'e']
 * interleave([], [1, 2, 3]); // [1, 2, 3]
 * ```
 */
export function interleave<T>(a: readonly T[], b: readonly T[]): T[] {
  const result: T[] = []

  const minLength = Math.min(a.length, b.length)
  for (let i = 0; i < minLength; i++) {
    result[i * 2] = a[i]
    result[i * 2 + 1] = b[i]
  }
  const c = a.length > minLength ? a : b
  for (let i = minLength; i < c.length; i++) {
    result[minLength * 2 + i - minLength] = c[i]
  }

  return result
}

/**
 * Raw string template
 *
 * ### Example
 *
 * ```ts
 * r`Hello, ${'World'}!`;        // 'Hello, World!'
 * r`C:\Windows\System32`;      // 'C:\\Windows\\System32'
 * r`C:\\Windows\\System32`;    // 'C:\\\\Windows\\\\System32'
 * ```
 */
export function r(strs: TemplateStringsArray, ...args: unknown[]): string {
  return interleave(strs.raw, args.map(String)).join('')
}

export function simple(strs: TemplateStringsArray, ...args: unknown[]): string {
  return interleave(strs, args.map(String)).join('')
}

export function I(strs: TemplateStringsArray, ...args: unknown[]): string {
  return simple(strs, args).replace(/\n\s+/msg, '\n').trim()
}

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
