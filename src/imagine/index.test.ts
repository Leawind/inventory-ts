import { assert } from '@std/assert'
import { imagine, META } from '@/imagine/index.ts'

Deno.test('imagine', () => {
  type A = {
    name: string
    born: number
    parent: A
    children: Set<A>
    arr: number[]

    getAge(): number
    greet(to: A): string
  }
  const a = imagine<A>()

  console.log(a)

  console.log(a[META].chain)
  console.log(a.getAge[META].chain)
  console.log(a.getAge()[META].chain)
  console.log(a.parent.getAge()[META].chain)
  console.log(a.name.padEnd(2)[META].chain)
  console.log(a.parent.arr[0].toFixed()[META].chain)
  console.log(a.parent.getAge().toFixed()[META].chain)
  console.log(a.parent.arr[1].toString()[META].chain)

  console.log(a.greet(imagine<A>())[META].chain)
})

// Test symbol definitions
const SYM_A = Symbol('test-symbol')
const SYM_B = Symbol('nested-symbol')

Deno.test('E type extending internal object', () => {
  // Define extension type
  type Extended = {
    [SYM_A]: number
    [SYM_B]: {
      deep: string
    }
  }

  const obj = imagine<{ value: string }, Extended>((e) => {
    e[SYM_A] = 324
    e[SYM_B] = { deep: 'this is deep' }
  })

  assert(typeof obj[SYM_A] === 'number')
  assert(typeof obj.value[SYM_B].deep === 'string')
})

Deno.test('E extension does not affect metadata tracking', () => {
  type LoggerExtension = {
    [META]: { logs: string[] }
  }
  const tracked = imagine<{ id: number }, LoggerExtension>(
    (e) => e[META].logs = [],
    { type: 'root', identifier: 'tracked' },
  )

  const meta = tracked.id.toFixed()[META]

  // console.log(meta.chain);
  assert(meta.chain.length === 4)
  assert(Array.isArray(meta.logs) === true)
})

Deno.test('E extending method parameter types', () => {
  type ValidationExtension = {
    [SYM_A]: (value: unknown) => boolean
  }

  const validator = imagine<
    { check: (input: string) => boolean },
    ValidationExtension
  >((e) => {
    e[SYM_A] = (value) => typeof value === 'string'
  })

  // Call extended validation logic
  assert(validator[SYM_A]('test'))

  // Verify access chain
  const chain = validator.check('test')[META].chain
  console.log(chain)
})

Deno.test('E type recursive merging', () => {
  type RecursiveExtension = {
    [SYM_A]: {
      [SYM_B]: number
    }
  }

  const deepObj = imagine<{
    user: {
      getName: () => string
    }
  }, RecursiveExtension>((e) => {
    e[SYM_A] = {
      [SYM_B]: 123,
    }
  })

  // Access nested symbol properties
  assert(typeof deepObj.user[SYM_A][SYM_B] === 'number')

  // Verify method call chain
  assert(typeof deepObj.user.getName()[SYM_A][SYM_B] === 'number')
})

Deno.test('missing initialization', () => {
  type Extension = { [SYM_A]: number }

  const obj = imagine<{ value: string }, Extension>()

  assert(obj[SYM_A] === undefined)
})
