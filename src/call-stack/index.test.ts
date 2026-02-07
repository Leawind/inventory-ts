import { CallStackItem, getCallStack } from './index.ts'
import { assert, assertEquals } from '@std/assert'

Deno.test('Stack line matching', () => {
  {
    const m = CallStackItem.parse(`    at file:///D:/inventory-ts/src/index.test.ts:4:18`)!
    assertEquals(m.caller, undefined)
    assertEquals(m.url, new URL('file:///D:/inventory-ts/src/index.test.ts'))
    assertEquals(m.column, 18)
    assertEquals(m.line, 4)
  }
  {
    const m = CallStackItem.parse(`    at outerWrapped (ext:cli/40_test.js:123:20)`)!
    assertEquals(m.caller, 'outerWrapped')
    assertEquals(m.url, new URL('ext:cli/40_test.js'))
    assertEquals(m.line, 123)
    assertEquals(m.column, 20)
  }
  {
    const m = CallStackItem.parse(`    at new RedisClient (https://jsr.io/@iuioiua/redis/1.1.1/mod.ts:374:25)`)!
    assertEquals(m.caller, 'new RedisClient')
    assertEquals(m.url, new URL('https://jsr.io/@iuioiua/redis/1.1.1/mod.ts'))
    assertEquals(m.line, 374)
    assertEquals(m.column, 25)
  }
  {
    const m = CallStackItem.parse(`    at Module.parseArgs (https://jsr.io/@std/cli/1.0.17/parse_args.ts:732:22)`)!
    assertEquals(m.caller, 'Module.parseArgs')
    assertEquals(m.url, new URL('https://jsr.io/@std/cli/1.0.17/parse_args.ts'))
    assertEquals(m.line, 732)
    assertEquals(m.column, 22)
  }
  {
    const m = CallStackItem.parse(`    at Array.every (<anonymous>)`)
    assert(m)
    assertEquals(m.caller, 'Array.every')
    assertEquals(m.url, undefined)
    assertEquals(m.line, undefined)
    assertEquals(m.column, undefined)
  }
  {
    ///    at <anonymous>:1:26
    const m = CallStackItem.parse(`    at <anonymous>:1:26`)
    assert(m)
    assertEquals(m.caller, undefined)
    assertEquals(m.url, undefined)
    assertEquals(m.line, 1)
    assertEquals(m.column, 26)
  }
})

Deno.test('stack', () => {
  function myFunc() {
    ;(() => {
      const stack = getCallStack()

      assertEquals(stack[0].caller, undefined)
      assertEquals(stack[1].caller, 'myFunc')

      console.log(stack.map((i) => i.raw))
    })()
  }

  myFunc()
})
