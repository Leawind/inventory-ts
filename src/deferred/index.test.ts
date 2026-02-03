import { assert, assertRejects, assertStrictEquals, assertThrows } from '@std/assert'
import { Deferred } from '@/deferred/index.ts'

Deno.test('Deferred basic functionality', async () => {
  const deferred = new Deferred<string>()

  let resolvedValue = ''
  deferred.then((v) => resolvedValue = v)
  assert(deferred.isPending)

  deferred.resolve('success')
  assert(deferred.isResolved)

  assertStrictEquals(await deferred, 'success')
  assertStrictEquals(resolvedValue, 'success')
})

Deno.test('Deferred error handling', async () => {
  const deferred = new Deferred()
  const testError = new Error('test error')

  deferred.catch((e) => assertStrictEquals(e, testError))
  assert(deferred.isPending)
  deferred.reject(testError)
  assert(deferred.isRejected)

  await assertRejects(() => deferred, Error, 'test error')
})

Deno.test('Deferred chaining', async () => {
  const deferred = new Deferred<number>()

  const result = deferred
    .then((v) => v * 2)
    .then((v) => v + 10)

  deferred.resolve(5)
  assert(deferred.isResolved)

  assertStrictEquals(await result, 20)
})

Deno.test('Deferred finally execution', async () => {
  const deferred = new Deferred<void>()
  let finallyCalled = false

  deferred.finally(() => finallyCalled = true)
  deferred.resolve(undefined)
  assert(deferred.isResolved)

  await deferred
  assert(finallyCalled)
})

Deno.test('Deferred synchronous resolution', async () => {
  const deferred = new Deferred<string>()
  deferred.resolve('immediate')
  assert(deferred.isResolved)

  assertStrictEquals(await deferred, 'immediate')
})

Deno.test('Deferred custom executor', async () => {
  let capturedResolve!: (v: string) => void
  const deferred = new Deferred<string>((resolve, _) => {
    capturedResolve = resolve
  })

  capturedResolve('custom')
  assertStrictEquals(await deferred, 'custom')
})

Deno.test('Deferred inheritance check', () => {
  const deferred = new Deferred()
  assert(deferred instanceof Promise)
})

Deno.test('Deferred as promise', async () => {
  let seq = ''

  const deferred = new Deferred((resolve) => {
    seq += 'A'
    resolve(3)
  })

  assert(deferred.resolve)
  assert(deferred.reject)

  seq += 'B'
  const result = await deferred
  seq += 'C'

  assertStrictEquals(result, 3)
  assertStrictEquals(seq, 'ABC')
})

Deno.test('Deferred fulfilled check', () => {
  const deferred = new Deferred<void>()
  assert(deferred.isPending)
  assert(!deferred.isFulfilled)

  deferred.resolve(undefined)
  assert(deferred.isFulfilled)
  assert(!deferred.isPending)
})

Deno.test('Deferred double resolve', async () => {
  const deferred = new Deferred<number>()

  deferred.resolve(1)

  assertThrows(() => {
    deferred.resolve(2)
  })

  assertStrictEquals(await deferred, 1)
  assert(deferred.isResolved)
})

Deno.test('Deferred double reject', async () => {
  const deferred = new Deferred<number>()
  const error1 = new Error('first error')
  const error2 = new Error('second error')

  deferred.reject(error1)

  assertThrows(() => {
    deferred.reject(error2)
  })

  await assertRejects(() => deferred, Error, 'first error')
  assert(deferred.isRejected)
  assert(!deferred.isPending)
})

Deno.test('Deferred reject after resolve', async () => {
  const deferred = new Deferred<number>()
  const error = new Error('should be ignored')

  deferred.resolve(42)
  assertThrows(() => {
    deferred.reject(error)
  })

  assertStrictEquals(await deferred, 42)
  assert(deferred.isResolved)
  assert(!deferred.isRejected)
})

Deno.test('Deferred resolve after reject', async () => {
  const deferred = new Deferred<number>()
  const error = new Error('rejected error')

  deferred.reject(error)
  assertThrows(() => {
    deferred.resolve(42)
  })

  await assertRejects(() => deferred, Error, 'rejected error')
  assert(deferred.isRejected)
  assert(!deferred.isResolved)
})

Deno.test('Deferred executor throws error', async () => {
  const testError = new Error('executor error')
  const deferred = new Deferred<void>((_resolve, reject) => {
    reject(testError)
  })

  await assertRejects(() => deferred, Error, 'executor error')
  console.log('state: ', deferred.state)

  assert(deferred.isRejected)
})
