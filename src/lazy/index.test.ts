import { assert, assertStrictEquals } from '@std/assert'
import { Lazy } from './index.ts'

Deno.test('lazy', async (t) => {
  const lazy = new Lazy()

  await t.step('tryGet should return undefined for non-existent keys', () => {
    const result = lazy.tryGet('nonexistent')
    assert(result === undefined, 'Should return undefined for non-existent key')
  })

  await t.step('tryGet should return stored value for existing keys', () => {
    lazy.getOrDefaultSync('testKey', () => 'testValue')
    const result = lazy.tryGet('testKey')
    assertStrictEquals(result, 'testValue', 'Should return the stored value')
  })

  await t.step('getOrDefault should create and store value if key does not exist', () => {
    let callCount = 0
    const getter = () => {
      callCount++
      return `value${callCount}`
    }

    const result1 = lazy.getOrDefaultSync('defaultKey', getter)
    const result2 = lazy.getOrDefaultSync('defaultKey', getter)

    assertStrictEquals(result1, 'value1', 'Should return value from getter on first call')
    assertStrictEquals(result2, 'value1', 'Should return cached value on second call')
    assertStrictEquals(callCount, 1, 'Getter should be called only once')
  })

  await t.step('get should return undefined when no getter provided and key does not exist', () => {
    const result = lazy.getSync('nonexistent')
    assert(result === undefined, 'Should return undefined when key does not exist and no getter')
  })

  await t.step('get should create and store value when getter provided', () => {
    let counter = 0
    const getter = () => {
      counter++
      return `computed${counter}`
    }

    const result1 = lazy.getSync('computedKey', getter)
    const result2 = lazy.getSync('computedKey', getter)

    assertStrictEquals(result1, 'computed1', 'First call should compute the value')
    assertStrictEquals(result2, 'computed1', 'Second call should return cached value')
    assertStrictEquals(counter, 1, 'Getter should be called only once')
  })

  await t.step('get should return cached value after initial computation', () => {
    const obj = { id: 123 }
    const result1 = lazy.getSync('objKey', () => obj)
    const result2 = lazy.getSync('objKey', () => ({ id: 999 }))

    assertStrictEquals(result1, obj, 'Should return initially computed object')
    assertStrictEquals(result2, obj, 'Should return cached object, not newly created one')
    assertStrictEquals(result1, result2, 'Both calls should return the same object reference')
  })

  await t.step('clear should remove all entries', () => {
    lazy.getOrDefaultSync('toBeCleared1', () => 'val1')
    lazy.getOrDefaultSync('toBeCleared2', () => 'val2')

    assert(lazy.getSync<string>('toBeCleared1') !== undefined, 'Key1 should exist before clear')
    assert(lazy.getSync<string>('toBeCleared2') !== undefined, 'Key2 should exist before clear')

    lazy.clear()

    assert(lazy.tryGet('toBeCleared1') === undefined, 'Key1 should not exist after clear')
    assert(lazy.tryGet('toBeCleared2') === undefined, 'Key2 should not exist after clear')
  })

  await t.step('delete should remove specific entry', () => {
    lazy.getOrDefaultSync('toBeDeleted', () => 'deleted_value')
    lazy.getOrDefaultSync('toBeKept', () => 'kept_value')

    assert(lazy.tryGet('toBeDeleted') !== undefined, 'To-be-deleted key should exist')
    assert(lazy.tryGet('toBeKept') !== undefined, 'To-be-kept key should exist')

    const deleteResult = lazy.delete('toBeDeleted')

    assert(deleteResult, 'Delete should return true when key existed')
    assert(lazy.tryGet('toBeDeleted') === undefined, 'To-be-deleted key should not exist after deletion')
    assert(lazy.tryGet('toBeKept') !== undefined, 'To-be-kept key should still exist after deletion')

    const deleteAgainResult = lazy.delete('toBeDeleted')
    assert(!deleteAgainResult, 'Delete should return false when key does not exist')
  })

  await t.step('different types of keys and values work correctly', () => {
    // Test with various key types
    lazy.getSync(123, () => 'number_key_value')
    lazy.getSync(true, () => 'boolean_key_value')

    assertStrictEquals(lazy.tryGet(123), 'number_key_value', 'Number key should work')
    assertStrictEquals(lazy.tryGet(true), 'boolean_key_value', 'Boolean key should work')
  })
})
