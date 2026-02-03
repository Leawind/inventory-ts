import { assertEquals, assertThrows } from '@std/assert'
import { TimeSpan, TimeSpans, Timestamp, type TimestampLike } from './index.ts'

Deno.test('Test timestamp functions: stringifyMsToTime should convert positive milliseconds to time string', () => {
  assertEquals(Timestamp.str(1000), '00:00:01.000')
  assertEquals(Timestamp.str(61000), '00:01:01.000')
  assertEquals(Timestamp.str(3721000), '01:02:01.000')
})

Deno.test('Test timestamp functions: parseTimeToMs should parse hh:mm:ss,mmm format', () => {
  assertEquals(Timestamp.ms('00:00:01.000'), 1000)
  assertEquals(Timestamp.ms('00:01:01.000'), 61000)
  assertEquals(Timestamp.ms('01:02:01.000'), 3721000)
})

Deno.test('Test timestamp functions: parseTimeToMs should parse hh:mm:ss.mmm format', () => {
  assertEquals(Timestamp.ms('00:00:01.000'), 1000)
  assertEquals(Timestamp.ms('00:01:01.123'), 61123)
  assertEquals(Timestamp.ms('01:02:01.000'), 3721000)
})

Deno.test('Test timestamp functions: parseTimeToMs should parse mm:ss,mmm format', () => {
  assertEquals(Timestamp.ms('00:01.000'), 1000)
  assertEquals(Timestamp.ms('01:01.000'), 61000)
})

Deno.test('Test timestamp functions: parseTimeToMs should parse mm:ss format', () => {
  assertEquals(Timestamp.ms('00:01'), 1000)
  assertEquals(Timestamp.ms('01:01'), 61000)
})

Deno.test('Test timestamp functions: parseTimeToMs should parse hh:mm:ss format', () => {
  assertEquals(Timestamp.ms('00:00:01'), 1000)
  assertEquals(Timestamp.ms('00:01:01'), 61000)
  assertEquals(Timestamp.ms('01:02:01'), 3721000)
})

Deno.test('Test timestamp functions: parseTimeToMs should throw error for invalid format', () => {
  assertThrows(() => Timestamp.ms('invalid' as TimestampLike))
  assertThrows(() => Timestamp.ms('1' as TimestampLike))
  assertThrows(() => Timestamp.ms('1:' as TimestampLike))
})

Deno.test('Test timestamp functions: cross test', () => {
  const limit = Timestamp.ms('23:59:59.999')
  for (let ms = 0; ms <= limit; ms += 8191) {
    assertEquals(Timestamp.ms(Timestamp.str(ms)), ms)
  }
})

Deno.test('Test timestamp functions: should handle negative timestamps correctly', () => {
  assertEquals(Timestamp.str(-1000), '-00:00:01.000')
  assertEquals(Timestamp.str(-61000), '-00:01:01.000')
  assertEquals(Timestamp.str(-3721000), '-01:02:01.000')
})

Deno.test('Test timestamp functions: should parse negative time strings', () => {
  assertEquals(Timestamp.ms('-00:00:01.000'), -1000)
  assertEquals(Timestamp.ms('-00:01:01.000'), -61000)
  assertEquals(Timestamp.ms('-01:02:01.000'), -3721000)
})

Deno.test('Test timestamp functions: should correctly identify negative timestamps', () => {
  const negativeTs = Timestamp.from(-1000)
  assertEquals(negativeTs.isNegative(), true)
  assertEquals(negativeTs.sign, -1)

  const positiveTs = Timestamp.from(1000)
  assertEquals(positiveTs.isNegative(), false)
  assertEquals(positiveTs.sign, 1)
})

Deno.test('Test timestamp functions: should throw when ms out of range', () => {
  console.log('Timestamp.LIMIT_POS', Timestamp.LIMIT_POS.str)
  console.log('Timestamp.LIMIT_NEG', Timestamp.LIMIT_NEG.str)

  assertEquals(!!Timestamp.from(2 * Timestamp.MS_MAX), true)
  assertThrows(() => Timestamp.from(2 * Timestamp.MS_MAX + 1))
  assertEquals(!!Timestamp.from(0), true)
  assertThrows(() => Timestamp.from(-Timestamp.MS_MAX))
  assertThrows(() => Timestamp.from(-Timestamp.MS_MAX - 1))
})

Deno.test('Test timestamp functions: should support add operation', () => {
  assertEquals(Timestamp.from(2).add(Timestamp.from(3)).ms, 5)
  assertEquals(Timestamp.from(5).add(Timestamp.from(-2)).ms, 3)
  assertEquals(Timestamp.from(-2).add(Timestamp.from(-3)).ms, -5)
  assertEquals(Timestamp.from(-5).add(Timestamp.from(2)).ms, -3)

  assertEquals(Timestamp.BEGIN.add(Timestamp.from(3)).ms, 3)
  assertEquals(Timestamp.END.add(Timestamp.from(-3)).ms, -3)

  assertThrows(() => Timestamp.BEGIN.add(Timestamp.from(-3)))
  assertThrows(() => Timestamp.END.add(Timestamp.from(3)))

  assertEquals(Timestamp.END.add(Timestamp.BEGIN).isNegative(), true)
  assertEquals(Timestamp.BEGIN.add(Timestamp.END).isPositive(), true)
})

Deno.test('Test timestamp functions: should support sub operation', () => {
  assertEquals(Timestamp.from(5).sub(Timestamp.from(3)).ms, 2)
  assertEquals(Timestamp.from(-3).sub(Timestamp.from(-5)).ms, 2)

  assertThrows(() => Timestamp.END.sub(Timestamp.BEGIN))
  assertEquals(Timestamp.from('00:00:01.200').sub(Timestamp.BEGIN).ms, 1200)
  assertEquals(Timestamp.END.sub(Timestamp.from('-00:00:01.200')).ms, 1200)
})

Deno.test('Test timestamp functions: negate should flip sign of timestamp', () => {
  const posTs = Timestamp.from(1000)
  const negTs = posTs.negate()
  assertEquals(negTs.ms, -1000)

  const negOriginal = Timestamp.from(-1000)
  const posRestored = negOriginal.negate()
  assertEquals(posRestored.ms, 1000)
})

Deno.test('Test timestamp functions: isPositive should return true for positive timestamps', () => {
  assertEquals(Timestamp.from(1000).isPositive(), true)
  assertEquals(Timestamp.from(0).isPositive(), true)
  assertEquals(Timestamp.from(-1000).isPositive(), false)
})

Deno.test('Test timestamp functions: isEdge should return true for zero timestamp', () => {
  assertEquals(Timestamp.from(0).isEdge(), true)
  assertEquals(Timestamp.from(1000).isEdge(), false)
  assertEquals(Timestamp.from(-1000).isEdge(), false)
})

Deno.test('Test timestamp functions: clone should create a new instance with same values', () => {
  const original = Timestamp.from(1000)
  const cloned = original.clone()
  assertEquals(cloned.ms, original.ms)
  if (cloned === original) { throw new Error('clone should create a different instance') }
})

Deno.test('Test timestamp functions: msp getter should return internal millisecond representation', () => {
  assertEquals(Timestamp.from(1000).msp, 1000)
  assertEquals(Timestamp.from(0).msp, 0)
  assertEquals(Timestamp.from(-1000).msp, 2 * Timestamp.MS_MAX - 1000)
})

Deno.test('Test timestamp functions: static constants should have correct values', () => {
  assertEquals(Timestamp.BEGIN.ms, 0)
  assertEquals(Timestamp.END.ms, 0) // Because END is MS_MAX * 2 which wraps to 0
  assertEquals(Timestamp.LIMIT_POS.ms, Timestamp.MS_MAX)
  assertEquals(Timestamp.LIMIT_NEG.ms, 1 - Timestamp.MS_MAX)
})

Deno.test('Test TimeSpan: should create a TimeSpan', () => {
  const start = Timestamp.from('00:00:01.000')
  const duration = Timestamp.from('00:00:01.000')
  const timeSpan = TimeSpan.from({ ss: start, du: duration })
  if (!timeSpan) { throw new Error('TimeSpan should be defined') }
})

Deno.test('Test TimeSpan: should create a TimeSpan with "to" property', () => {
  const start = Timestamp.from('00:00:01.000')
  const end = Timestamp.from('00:00:03.000')
  const timeSpan = TimeSpan.from({ ss: start, to: end })
  if (!timeSpan) { throw new Error('TimeSpan should be defined') }
  assertEquals(timeSpan.ss.str, '00:00:01.000')
  assertEquals(timeSpan.to.str, '00:00:03.000')
})

Deno.test('Test TimeSpan: should create a TimeSpan with "du" property', () => {
  const start = Timestamp.from('00:00:01.000')
  const duration = Timestamp.from('00:00:02.000')
  const timeSpan = TimeSpan.from({ ss: start, du: duration })
  if (!timeSpan) { throw new Error('TimeSpan should be defined') }
  assertEquals(timeSpan.ss.str, '00:00:01.000')
  assertEquals(timeSpan.to.str, '00:00:03.000')
  assertEquals(timeSpan.du.str, '00:00:02.000')
})

Deno.test('Test TimeSpan: should calculate duration correctly', () => {
  const timeSpan = TimeSpan.from({ ss: '00:00:01.000', to: '00:00:05.000' })
  assertEquals(timeSpan.du.str, '00:00:04.000')
})

Deno.test('Test TimeSpan: should calculate start and end times correctly', () => {
  const timeSpan = TimeSpan.from({ ss: '00:00:10.000', du: '00:00:05.000' })
  assertEquals(timeSpan.ss.str, '00:00:10.000')
  assertEquals(timeSpan.to.str, '00:00:15.000')
})

Deno.test('Test TimeSpan: should find intersection of two time spans', () => {
  const timeSpan1 = TimeSpan.from({ ss: '00:00:01.000', to: '00:00:05.000' }) // 00:00:01.000 to 00:00:05.000
  const timeSpan2 = TimeSpan.from({ ss: '00:00:03.000', to: '00:00:08.000' }) // 00:00:03.000 to 00:00:08.000
  const intersection = timeSpan1.intersect(timeSpan2)

  if (!intersection) { throw new Error('Intersection should be defined') }
  assertEquals(intersection.ss.str, '00:00:03.000')
  assertEquals(intersection.to.str, '00:00:05.000')
})

Deno.test('Test TimeSpan: should return null when time spans do not intersect', () => {
  const timeSpan1 = TimeSpan.from({ ss: '00:00:01.000', to: '00:00:02.000' })
  const timeSpan2 = TimeSpan.from({ ss: '00:00:03.000', to: '00:00:04.000' })
  const intersection = timeSpan1.intersect(timeSpan2)

  assertEquals(intersection, null)
})

Deno.test('Test TimeSpan: should exclude one time span from another', () => {
  const timeSpan = TimeSpan.from({ ss: '00:00:01.000', to: '00:00:06.000' }) // 00:00:01.000 to 00:00:06.000
  const exclude = TimeSpan.from({ ss: '00:00:03.000', to: '00:00:04.000' }) // 00:00:03.000 to 00:00:04.000

  const result = timeSpan.exclude(exclude)
  assertEquals(result.length, 2)

  assertEquals(result[0]!.ss.str, '00:00:01.000')
  assertEquals(result[0]!.to.str, '00:00:03.000')

  assertEquals(result[1]!.ss.str, '00:00:04.000')
  assertEquals(result[1]!.to.str, '00:00:06.000')
})

Deno.test('Test TimeSpan: should merge two overlapping time spans', () => {
  const timeSpan1 = TimeSpan.from({ ss: '00:00:01.000', to: '00:00:05.000' })
  const timeSpan2 = TimeSpan.from({ ss: '00:00:03.000', to: '00:00:08.000' })
  const result = timeSpan1.merge(timeSpan2)

  assertEquals(result.length, 1)
  assertEquals(result[0]!.ss.str, '00:00:01.000')
  assertEquals(result[0]!.to.str, '00:00:08.000')
})

Deno.test('Test TimeSpan: should return both time spans if they do not overlap', () => {
  const timeSpan1 = TimeSpan.from({ ss: '00:00:01.000', to: '00:00:02.000' })
  const timeSpan2 = TimeSpan.from({ ss: '00:00:03.000', to: '00:00:04.000' })
  const result = timeSpan1.merge(timeSpan2)

  assertEquals(result.length, 2)
  assertEquals(result[0]!.ss.str, '00:00:01.000')
  assertEquals(result[0]!.to.str, '00:00:02.000')
  assertEquals(result[1]!.ss.str, '00:00:03.000')
  assertEquals(result[1]!.to.str, '00:00:04.000')
})

Deno.test('Test TimeSpan: should handle negative timestamps in TimeSpan', () => {
  const timeSpan = TimeSpan.from({ ss: '-00:00:05.000', to: '-00:00:02.000' })
  assertEquals(timeSpan.ss.str, '-00:00:05.000')
  assertEquals(timeSpan.to.str, '-00:00:02.000')
  assertEquals(timeSpan.du.str, '00:00:03.000')
})

Deno.test('Test TimeSpan: should calculate duration with mixed positive and negative timestamps (same sign requirement)', () => {
  // Both negative
  const timeSpanNeg = TimeSpan.from({ ss: '-00:00:10.000', to: '-00:00:05.000' })
  assertEquals(timeSpanNeg.du.str, '00:00:05.000')

  // Both positive
  const timeSpanPos = TimeSpan.from({ ss: '00:00:05.000', to: '00:00:10.000' })
  assertEquals(timeSpanPos.du.str, '00:00:05.000')
})

Deno.test('Test TimeSpan: should throw error when calculating duration with different signs', () => {
  // Testing the sameSign() method requirement for duration calculation
  assertThrows(() => TimeSpan.from({ ss: '-00:00:05.000', to: '00:00:05.000' }).du)
  assertThrows(() => TimeSpan.from({ ss: '00:00:05.000', to: '-00:00:05.000' }).du)
})

Deno.test('Test TimeSpan: should throw error when time out of range', () => {
  assertThrows(() => TimeSpan.from({ ss: '-00:00:05.000', du: '00:00:05.001' }))
})

Deno.test('Test TimeSpan: should throw error when du < 0', () => {
  assertThrows(() => TimeSpan.from({ ss: '00:00:05.000', du: '-00:00:05.000' }))
})

Deno.test('Test TimeSpan: sameSign should return true when both timestamps have same sign', () => {
  const posSpan = TimeSpan.from({ ss: '00:00:01.000', to: '00:00:05.000' })
  assertEquals(posSpan.sameSign(), true)

  const negSpan = TimeSpan.from({ ss: '-00:00:05.000', to: '-00:00:01.000' })
  assertEquals(negSpan.sameSign(), true)

  const mixedSpan = TimeSpan.from({ ss: '-00:00:05.000', to: '00:00:05.000' })
  assertEquals(mixedSpan.sameSign(), false)
})

Deno.test('Test TimeSpan: clone should create a new TimeSpan instance with same values', () => {
  const original = TimeSpan.from({ ss: '00:00:01.000', to: '00:00:05.000' })
  const cloned = original.clone()
  assertEquals(cloned.ss.ms, original.ss.ms)
  assertEquals(cloned.to.ms, original.to.ms)
  if (cloned === original) { throw new Error('clone should create a different instance') }
})

Deno.test('Test TimeSpan: inverse should return complementary time spans', () => {
  const timeSpan = TimeSpan.from({ ss: '00:00:02.000', to: '00:00:04.000' })
  const [before, after] = timeSpan.inverse()

  // First span should go from BEGIN to start of original
  assertEquals(before.ss.ms, 0)
  assertEquals(before.to.ms, 2000)

  // Second span should go from end of original to END
  assertEquals(after.ss.ms, 4000)
  assertEquals(after.to.ms, 0) // Since END wraps around to 0
})

Deno.test('Test TimeSpan: head should create time span from beginning to specified timestamp', () => {
  const headSpan = TimeSpan.head('00:00:05.000')
  assertEquals(headSpan.ss.ms, 0) // BEGIN
  assertEquals(headSpan.to.ms, 5000)
})

Deno.test('Test TimeSpan: tail should create time span from specified timestamp to end', () => {
  const tailSpan = TimeSpan.tail('00:00:05.000')
  assertEquals(tailSpan.ss.ms, 5000)
  assertEquals(tailSpan.to.ms, 0) // END
})

Deno.test('Test TimeSpan: FULL constant should span from beginning to end', () => {
  assertEquals(TimeSpan.FULL.ss.ms, 0) // BEGIN
  assertEquals(TimeSpan.FULL.to.ms, 0) // END (wraps to 0)
})

Deno.test('Test TimeSpans: should create TimeSpans from an array of TimeSpanLikes', () => {
  const timeSpans = TimeSpans.from([
    { ss: '00:00:01.000', du: '00:00:01.000' },
    { ss: '00:00:03.000', du: '00:00:01.000' },
  ])
  if (!timeSpans) { throw new Error('TimeSpans should be defined') }
  const spansArray = Array.from(timeSpans.iter())
  assertEquals(spansArray.length, 2)
})

Deno.test('Test TimeSpans: should add a new span to TimeSpans', () => {
  const timeSpans = TimeSpans.from([{ ss: '00:00:01.000', du: '00:00:01.000' }])
  const newTimeSpans = timeSpans.with({ ss: '00:00:03.000', du: '00:00:01.000' })

  const spansArray = Array.from(newTimeSpans.iter())
  assertEquals(spansArray.length, 2)
})

Deno.test('Test TimeSpans: should merge overlapping spans automatically', () => {
  // Two overlapping spans should be merged into one
  const timeSpans = TimeSpans.from([
    { ss: '00:00:01.000', du: '00:00:02.000' }, // ends at 00:00:03.000
    { ss: '00:00:02.000', du: '00:00:02.000' }, // starts at 00:00:02.000
  ])

  const spansArray = Array.from(timeSpans.iter())
  assertEquals(spansArray.length, 1)
  assertEquals(spansArray[0]?.ss.str, '00:00:01.000')
})

Deno.test('Test TimeSpans: should intersect with another TimeSpans', () => {
  const timeSpans1 = TimeSpans.from([
    { ss: '00:00:01.000', du: '00:00:04.000' }, // covers 00:00:01.000 to 00:00:05.000
  ])
  const timeSpans2 = TimeSpans.from([
    { ss: '00:00:03.000', du: '00:00:04.000' }, // covers 00:00:03.000 to 00:00:07.000
  ])

  const intersection = timeSpans1.intersect(timeSpans2)
  const spansArray = Array.from(intersection.iter())

  assertEquals(spansArray.length, 1)
  assertEquals(spansArray[0]?.ss.str, '00:00:03.000') // Intersection starts at 00:00:03.000
  assertEquals(spansArray[0]?.to.str, '00:00:05.000') // Intersection ends at 00:00:05.000
})

Deno.test('Test TimeSpans: should exclude a TimeSpans from another', () => {
  const timeSpans1 = TimeSpans.from([
    { ss: '00:00:01.000', du: '00:00:06.000' }, // covers 00:00:01.000 to 00:00:07.000
  ])
  const timeSpans2 = TimeSpans.from([
    { ss: '00:00:03.000', du: '00:00:02.000' }, // covers 00:00:03.000 to 00:00:05.000
  ])

  const exclusion = timeSpans1.exclude(timeSpans2)
  const spansArray = Array.from(exclusion.iter())

  assertEquals(spansArray.length, 2)
  assertEquals(spansArray[0]?.ss.str, '00:00:01.000') // First part: 00:00:01.000 to 00:00:03.000
  assertEquals(spansArray[0]?.to.str, '00:00:03.000')
  assertEquals(spansArray[1]?.ss.str, '00:00:05.000') // Second part: 00:00:05.000 to 00:00:07.000
  assertEquals(spansArray[1]?.to.str, '00:00:07.000')
})

Deno.test('Test TimeSpans: should merge two TimeSpans', () => {
  const timeSpans1 = TimeSpans.from([{ ss: '00:00:01.000', du: '00:00:01.000' }])
  const timeSpans2 = TimeSpans.from([{ ss: '00:00:03.000', du: '00:00:01.000' }])

  const merged = timeSpans1.merge(timeSpans2)
  const spansArray = Array.from(merged.iter())

  assertEquals(spansArray.length, 2)
})

Deno.test('Test TimeSpans: should handle multiple overlapping spans during construction', () => {
  // These spans overlap and should be merged during construction
  const timeSpans = TimeSpans.from([
    { ss: '00:00:01.000', du: '00:00:03.000' }, // covers 00:00:01.000 to 00:00:04.000
    { ss: '00:00:02.000', du: '00:00:02.000' }, // covers 00:00:02.000 to 00:00:04.000
    { ss: '00:00:05.000', du: '00:00:01.000' }, // covers 00:00:05.000 to 00:00:06.000
  ])

  const spansArray = Array.from(timeSpans.iter())
  assertEquals(spansArray.length, 2) // First two should merge, third remains separate
  assertEquals(spansArray[0]?.ss.str, '00:00:01.000')
  assertEquals(spansArray[0]?.to.str, '00:00:04.000')
  assertEquals(spansArray[1]?.ss.str, '00:00:05.000')
  assertEquals(spansArray[1]?.to.str, '00:00:06.000')
})

Deno.test('Test TimeSpans: should work with negative timestamps in TimeSpans when they have same sign', () => {
  // Test creating TimeSpans with negative timestamps
  const timeSpans = TimeSpans.from([
    { ss: '-00:00:10.000', du: '00:00:03.000' }, // from -00:00:10.000 to -00:00:07.000
    { ss: '-00:00:05.000', du: '00:00:02.000' }, // from -00:00:05.000 to -00:00:03.000
  ])

  const spansArray = Array.from(timeSpans.iter())
  // Check that they are created properly
  assertEquals(spansArray.length, 2)
  assertEquals(spansArray[0]?.ss.isNegative(), true)
  assertEquals(spansArray[1]?.ss.isNegative(), true)
})

Deno.test('Test TimeSpans: clone should create a new TimeSpans instance with same values', () => {
  const original = TimeSpans.from([{ ss: '00:00:01.000', du: '00:00:01.000' }])
  const cloned = original.clone()

  const origSpans = Array.from(original.iter())
  const clonSpans = Array.from(cloned.iter())

  assertEquals(clonSpans.length, origSpans.length)
  assertEquals(clonSpans[0]?.ss.ms, origSpans[0]?.ss.ms)
  if (cloned === original) { throw new Error('clone should create a different instance') }
})

Deno.test('Test TimeSpans: iter should return iterable of time spans', () => {
  const timeSpans = TimeSpans.from([
    { ss: '00:00:01.000', du: '00:00:01.000' },
    { ss: '00:00:03.000', du: '00:00:01.000' },
  ])

  const iterated = Array.from(timeSpans.iter())
  assertEquals(iterated.length, 2)
  assertEquals(iterated[0]?.ss.ms, 1000)
  assertEquals(iterated[1]?.ss.ms, 3000)
})

Deno.test('Test TimeSpans: FULL constant should contain full time span', () => {
  if (!TimeSpans.FULL) { throw new Error('TimeSpans.FULL should be defined') }
  const spans = Array.from(TimeSpans.FULL.iter())
  assertEquals(spans.length, 1)
  assertEquals(spans[0]?.ss.ms, 0) // BEGIN
  assertEquals(spans[0]?.to.ms, 0) // END
})

Deno.test('Test app: simple', () => {
  const SPANS = TimeSpans.from([TimeSpan.head(1000), TimeSpan.tail(-2000), [5000, 6000], [-4000, -3000]])

  const spans = SPANS.inverse()
  console.log(spans.toString())
})
