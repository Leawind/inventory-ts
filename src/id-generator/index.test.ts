import { assertEquals, assertThrows } from '@std/assert'
import { IdGenerator } from './index.ts'

Deno.test('IDGenerator - Basic Functionality', async (t) => {
  await t.step('should generate the next value using nextGetter', () => {
    const generator = new IdGenerator(
      0,
      (last) => last + 10, // nextGetter: 加10
      Infinity,
      () => true, // available: 总是可用
    )

    assertEquals(generator.next(), 10)
    assertEquals(generator.next(), 20)
    assertEquals(generator.next(), 30)
  })

  await t.step('should respect the available condition', () => {
    const generator = new IdGenerator(
      0,
      (last) => last + 1, // nextGetter: 递增1
      Infinity,
      (id) => id % 2 === 0, // available: 只允许偶数
    )

    assertEquals(generator.next(), 2) // 1 被过滤，2 是第一个可用的偶数
    assertEquals(generator.next(), 4) // 3 被过滤，4 是下一个可用的偶数
    assertEquals(generator.next(), 6)
  })

  await t.step('should handle complex available conditions', () => {
    const usedIds = new Set([5, 8, 12])
    const generator = new IdGenerator(
      0,
      (last) => last + 1,
      Infinity,
      (id) => !usedIds.has(id) && id <= 15, // 可用：未被使用且 <= 15
    )

    assertEquals(generator.next(), 1)
    assertEquals(generator.next(), 2)
    assertEquals(generator.next(), 3)
    assertEquals(generator.next(), 4)
    // 5 is in usedIds, skipped
    assertEquals(generator.next(), 6)
    assertEquals(generator.next(), 7)
    // 8 is in usedIds, skipped
    assertEquals(generator.next(), 9)
    // ... continues until 15
    for (let i = 10; i <= 15; i++) {
      if (i === 12) { continue // Skip 12 as it's used
       }
      assertEquals(generator.next(), i)
    }
    // After 15, no number satisfies id <= 15 and not used. This would loop infinitely.
    // In a real scenario, you'd need a condition that guarantees termination.
    // For testing, we assume valid conditions are provided by users.
  })
})

Deno.test('IDGenerator - State Management', async (t) => {
  await t.step('should maintain state between calls to next', () => {
    const generator = new IdGenerator(
      'A',
      (last) => String.fromCharCode(last.charCodeAt(0) + 1), // A -> B -> C ...
      Infinity,
      () => true,
    )

    assertEquals(generator.next(), 'B')
    assertEquals(generator.next(), 'C')
    assertEquals(generator.next(), 'D')
  })

  await t.step('should allow setting the last value with setLast', () => {
    const generator = new IdGenerator(
      0,
      (last) => last + 1,
      Infinity,
      () => true,
    )

    assertEquals(generator.next(), 1)
    assertEquals(generator.next(), 2)

    generator.setLast(10)
    assertEquals(generator.next(), 11)
    assertEquals(generator.next(), 12)
  })

  await t.step('should revoke to the previous value', () => {
    const generator = new IdGenerator(
      0,
      (last) => last + 1,
      Infinity,
      () => true,
    )

    assertEquals(generator.next(), 1)
    assertEquals(generator.next(), 2)

    assertEquals(generator.next(), 3)

    generator.revoke()
    assertEquals(generator.next(), 3) // Should return to the previous value
  })

  await t.step('should throw error when revoking without previous value', () => {
    const generator = new IdGenerator(
      0,
      (last) => last + 1,
      Infinity,
      () => true,
    )

    assertThrows(
      () => {
        generator.revoke()
      },
      Error,
    )
  })
})

Deno.test('IDGenerator - Static ranged method', async (t) => {
  await t.step('should create a cyclic ID generator within the specified range', () => {
    const generator = IdGenerator.ranged(1, 5) // low=1, high=5 -> range [1, 4] (high excluded in modulo)

    // The logic in ranged: ((i - low + 1) % (high - low)) + low
    // (high - low) = 4
    // Sequence: 1 -> ( (1-1+1)%4 +1 ) = (1%4)+1 = 1+1 = 2
    //           2 -> ( (2-1+1)%4 +1 ) = (2%4)+1 = 2+1 = 3
    //           3 -> ( (3-1+1)%4 +1 ) = (3%4)+1 = 3+1 = 4
    //           4 -> ( (4-1+1)%4 +1 ) = (4%4)+1 = 0+1 = 1 (cycles back)
    assertEquals(generator.next(), 2)
    assertEquals(generator.next(), 3)
    assertEquals(generator.next(), 4)
    assertEquals(generator.next(), 1) // Cycled back to start
    assertEquals(generator.next(), 2)
  })

  await t.step('should respect the condition in ranged generator', () => {
    const generator = IdGenerator.ranged(
      1,
      5,
      Infinity,
      (id) => id !== 3,
    ) // Exclude 3

    assertEquals(generator.next(), 2)
    // 3 is excluded, so after 2, it tries 3 (excluded), then 4 (available)
    assertEquals(generator.next(), 4)
    // After 4, cycles to 1 (available)
    assertEquals(generator.next(), 1)
    // After 1, goes to 2 (available)
    assertEquals(generator.next(), 2)
    // After 2, tries 3 (excluded), then 4 (available)
    assertEquals(generator.next(), 4)
  })

  await t.step('should handle single value range', () => {
    // If low == high, (high - low) = 0, modulo by 0! But let's see the intended behavior.
    // The current implementation would cause a divide-by-zero error in modulo.
    // A robust implementation might handle this, but the current code doesn't.
    // This test expects it to work for ranges where high > low.
    const generator = IdGenerator.ranged(5, 6) // Effectively only value 5
    assertEquals(generator.next(), 5)
    assertEquals(generator.next(), 5) // Should stay at 5
  })

  await t.step('should create a ranged generator with maxTries', () => {
    const generator = IdGenerator.ranged(1, 3, 5) // low=1, high=3, maxTries=5

    assertEquals(generator.next(), 2)
    assertEquals(generator.next(), 1) // Cycles back to 1
    assertEquals(generator.next(), 2)
  })

  await t.step('should create a ranged generator with filter', () => {
    const generator = IdGenerator.ranged(1, 5, (id) => id !== 2) // low=1, high=5, exclude 2

    assertEquals(generator.next(), 3) // 2 is filtered out, so 3 comes first
    assertEquals(generator.next(), 4)
    assertEquals(generator.next(), 1) // Cycles back but skips 2
    assertEquals(generator.next(), 3) // Goes to 2, filtered, then 3
  })

  await t.step('should create a ranged generator with maxTries and filter', () => {
    const generator = IdGenerator.ranged(1, 3, 10, (id) => id !== 2) // low=1, high=3, maxTries=10, exclude 2

    assertEquals(generator.next(), 1)
    assertEquals(generator.next(), 1)
    assertEquals(generator.next(), 1)
  })
})

Deno.test('IDGenerator - Edge Cases', async (t) => {
  await t.step('should work with string IDs', () => {
    const generator = new IdGenerator(
      'id-0',
      (last) => `id-${parseInt(last.split('-')[1]) + 1}`,
      Infinity,
      (id) => parseInt(id.split('-')[1]) < 3,
    )

    assertEquals(generator.next(), 'id-1')
    assertEquals(generator.next(), 'id-2')
    // id-3 fails condition, so it stops here. Next call would fail (infinite loop).
    // Assuming user provides terminating condition or handles exhaustion.
  })

  await t.step('should work with object IDs (though unusual)', () => {
    const generator = new IdGenerator(
      { val: 0 },
      (last) => ({ val: last.val + 1 }),
      Infinity,
      (obj) => obj.val % 2 === 1, // Only odd values
    )

    const result1 = generator.next()
    assertEquals(result1.val, 1)

    const result2 = generator.next()
    assertEquals(result2.val, 3)
  })

  await t.step('should throw error when maxTries exceeded', () => {
    const generator = new IdGenerator(
      0,
      (last) => last + 1,
      3, // maxTries = 3
      () => false, // Filter that never passes, forcing maxTries to be exceeded
    )

    assertThrows(
      () => {
        generator.next()
      },
      Error,
    )
  })

  await t.step('should handle invalid argument in ranged method', () => {
    assertThrows(
      () => {
        // @ts-ignore - Testing invalid input intentionally
        IdGenerator.ranged(1, 5, 'invalid')
      },
      Error,
    )
  })
})
