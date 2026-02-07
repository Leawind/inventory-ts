import { levenshtein } from '../levenshtein/index.ts'
import { assertEquals } from '@std/assert'

Deno.test('Levenshtein distance - empty strings', () => {
  assertEquals(levenshtein('', ''), 0)
  assertEquals(levenshtein('', 'abc'), 3)
  assertEquals(levenshtein('abc', ''), 3)
})

Deno.test('Levenshtein distance - equal strings', () => {
  assertEquals(levenshtein('abc', 'abc'), 0)
  assertEquals(levenshtein('kitten', 'kitten'), 0)
})

Deno.test('Levenshtein distance - simple insertions', () => {
  assertEquals(levenshtein('a', 'ab'), 1)
  assertEquals(levenshtein('abc', 'abcd'), 1)
  assertEquals(levenshtein('', 'xyz'), 3)
})

Deno.test('Levenshtein distance - simple deletions', () => {
  assertEquals(levenshtein('ab', 'a'), 1)
  assertEquals(levenshtein('abcd', 'abc'), 1)
  assertEquals(levenshtein('xyz', ''), 3)
})

Deno.test('Levenshtein distance - simple substitutions', () => {
  assertEquals(levenshtein('a', 'b'), 1)
  assertEquals(levenshtein('abc', 'adc'), 1)
  assertEquals(levenshtein('kitten', 'sitten'), 1)
})

Deno.test('Levenshtein distance - adjacent swaps', () => {
  assertEquals(levenshtein('main', 'mian'), 1)
  assertEquals(levenshtein('print', 'pritn'), 1)
  assertEquals(levenshtein('ab', 'ba'), 1)
  assertEquals(levenshtein('abc', 'acb'), 1)
  assertEquals(levenshtein('kitten', 'ikttne'), 2)
})

Deno.test('Levenshtein distance - complex cases', () => {
  assertEquals(levenshtein('saturday', 'sunday'), 3)
  assertEquals(levenshtein('kitten', 'sitting'), 3)
  assertEquals(levenshtein('intention', 'execution'), 5)
})

Deno.test('Levenshtein distance - with custom costs', () => {
  // Higher replace cost
  assertEquals(levenshtein('a', 'b', { delete: 1, insert: 1, replace: 2, swap: 1 }), 2)

  // Higher swap cost
  assertEquals(levenshtein('ab', 'ba', { delete: 1, insert: 1, replace: 1, swap: 2 }), 2)
})

Deno.test('Levenshtein distance - unicode characters', () => {
  assertEquals(levenshtein('申公豹', '申公公'), 1)
  assertEquals(levenshtein('😊', '😢'), 1)
  assertEquals(levenshtein(' café', 'café'), 1)
})
