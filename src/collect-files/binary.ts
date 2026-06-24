/**
 * Heuristically detect whether a file is binary by checking for null bytes
 * in the first 8192 bytes of its content.
 */
export function isBinary(content: Uint8Array): boolean {
  const limit = Math.min(content.length, 8192)
  for (let i = 0; i < limit; i++) {
    if (content[i] === 0) {
      return true
    }
  }
  return false
}
