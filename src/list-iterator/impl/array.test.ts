import { assertEquals } from '@std/assert'
import { ArrayListIterator } from '@/list-iterator/impl/array.ts'

Deno.test('ArrayListIterator - hasNext', () => {
  const list = [1, 2, 3]
  const iterator = new ArrayListIterator(list)
  assertEquals(iterator.hasNext(), true)
})

Deno.test('ArrayListIterator - next', () => {
  const list = [1, 2, 3]
  const iterator = new ArrayListIterator(list)
  assertEquals(iterator.next(), 1)
})

Deno.test('ArrayListIterator - hasPrevious', () => {
  const list = [1, 2, 3]
  const iterator = new ArrayListIterator(list)
  iterator.next()
  assertEquals(iterator.hasPrevious(), true)
})

Deno.test('ArrayListIterator - previous', () => {
  const list = [1, 2, 3]
  const iterator = new ArrayListIterator(list)
  iterator.next()
  iterator.next()
  assertEquals(iterator.previous(), 2)
})

Deno.test('ArrayListIterator - nextIndex', () => {
  const list = [1, 2, 3]
  const iterator = new ArrayListIterator(list)
  assertEquals(iterator.nextIndex(), 0)
})

Deno.test('ArrayListIterator - previousIndex', () => {
  const list = [1, 2, 3]
  const iterator = new ArrayListIterator(list)
  iterator.next()
  assertEquals(iterator.previousIndex(), 0)
})

Deno.test('ArrayListIterator - remove', () => {
  const list = [1, 2, 3]
  const iterator = new ArrayListIterator(list)
  iterator.next()
  iterator.remove()
  assertEquals(list, [2, 3])
})

Deno.test('ArrayListIterator - set', () => {
  const list = [1, 2, 3]
  const iterator = new ArrayListIterator(list)
  iterator.next()
  iterator.set(10)
  assertEquals(list, [10, 2, 3])
})

Deno.test('ArrayListIterator - add', () => {
  const list = [1, 2, 3]
  const iterator = new ArrayListIterator(list)
  iterator.next()
  iterator.add(10)
  assertEquals(list, [1, 10, 2, 3])
})
