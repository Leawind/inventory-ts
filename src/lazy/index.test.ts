import { assert, assertStrictEquals } from '@std/assert'
import { Lazies, Lazy } from './index.ts'

Deno.test('lazies', async (t) => {
  const lazies = new Lazies()

  await t.step('tryGet should return undefined for non-existent keys', () => {
    const result = lazies.tryGet('nonexistent')
    assert(result === undefined, 'Should return undefined for non-existent key')
  })

  await t.step('tryGet should return stored value for existing keys', () => {
    lazies.getOrDefaultSync('testKey', () => 'testValue')
    const result = lazies.tryGet('testKey')
    assertStrictEquals(result, 'testValue', 'Should return the stored value')
  })

  await t.step('getOrDefault should create and store value if key does not exist', () => {
    let callCount = 0
    const getter = () => {
      callCount++
      return `value${callCount}`
    }

    const result1 = lazies.getOrDefaultSync('defaultKey', getter)
    const result2 = lazies.getOrDefaultSync('defaultKey', getter)

    assertStrictEquals(result1, 'value1', 'Should return value from getter on first call')
    assertStrictEquals(result2, 'value1', 'Should return cached value on second call')
    assertStrictEquals(callCount, 1, 'Getter should be called only once')
  })

  await t.step('get should return undefined when no getter provided and key does not exist', () => {
    const result = lazies.getSync('nonexistent')
    assert(result === undefined, 'Should return undefined when key does not exist and no getter')
  })

  await t.step('get should create and store value when getter provided', () => {
    let counter = 0
    const getter = () => {
      counter++
      return `computed${counter}`
    }

    const result1 = lazies.getSync('computedKey', getter)
    const result2 = lazies.getSync('computedKey', getter)

    assertStrictEquals(result1, 'computed1', 'First call should compute the value')
    assertStrictEquals(result2, 'computed1', 'Second call should return cached value')
    assertStrictEquals(counter, 1, 'Getter should be called only once')
  })

  await t.step('get should return cached value after initial computation', () => {
    const obj = { id: 123 }
    const result1 = lazies.getSync('objKey', () => obj)
    const result2 = lazies.getSync('objKey', () => ({ id: 999 }))

    assertStrictEquals(result1, obj, 'Should return initially computed object')
    assertStrictEquals(result2, obj, 'Should return cached object, not newly created one')
    assertStrictEquals(result1, result2, 'Both calls should return the same object reference')
  })

  await t.step('clear should remove all entries', () => {
    lazies.getOrDefaultSync('toBeCleared1', () => 'val1')
    lazies.getOrDefaultSync('toBeCleared2', () => 'val2')

    assert(lazies.getSync<string>('toBeCleared1') !== undefined, 'Key1 should exist before clear')
    assert(lazies.getSync<string>('toBeCleared2') !== undefined, 'Key2 should exist before clear')

    lazies.clear()

    assert(lazies.tryGet('toBeCleared1') === undefined, 'Key1 should not exist after clear')
    assert(lazies.tryGet('toBeCleared2') === undefined, 'Key2 should not exist after clear')
  })

  await t.step('delete should remove specific entry', () => {
    lazies.getOrDefaultSync('toBeDeleted', () => 'deleted_value')
    lazies.getOrDefaultSync('toBeKept', () => 'kept_value')

    assert(lazies.tryGet('toBeDeleted') !== undefined, 'To-be-deleted key should exist')
    assert(lazies.tryGet('toBeKept') !== undefined, 'To-be-kept key should exist')

    const deleteResult = lazies.delete('toBeDeleted')

    assert(deleteResult, 'Delete should return true when key existed')
    assert(lazies.tryGet('toBeDeleted') === undefined, 'To-be-deleted key should not exist after deletion')
    assert(lazies.tryGet('toBeKept') !== undefined, 'To-be-kept key should still exist after deletion')

    const deleteAgainResult = lazies.delete('toBeDeleted')
    assert(!deleteAgainResult, 'Delete should return false when key does not exist')
  })

  await t.step('different types of keys and values work correctly', () => {
    // Test with various key types
    lazies.getSync(123, () => 'number_key_value')
    lazies.getSync(true, () => 'boolean_key_value')

    assertStrictEquals(lazies.tryGet(123), 'number_key_value', 'Number key should work')
    assertStrictEquals(lazies.tryGet(true), 'boolean_key_value', 'Boolean key should work')
  })
})

Deno.test('Lazy', () => {
  const lazy = Lazy.of(() => 'lazy_value')
  assertStrictEquals(lazy.get(), 'lazy_value')
  assert(lazy.isComputed())

  lazy.clear()
  assert(!lazy.isComputed())

  const method = lazy.toMethod()
  assertStrictEquals(method(), 'lazy_value')
})

Deno.test('LazyAsync', async () => {
  const lazy = Lazy.ofAsync(() => Promise.resolve('lazy_value'))
  assertStrictEquals(await lazy.get(), 'lazy_value')
  assert(lazy.isComputed())
})

Deno.test('toMethod', () => {
  class A {
    getName = Lazy.of(() => 'A').toMethod()
  }
  const a = new A()
  assertStrictEquals(a.getName(), 'A')
})
