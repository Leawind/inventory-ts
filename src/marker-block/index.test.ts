import { assertEquals } from '@std/assert'
import { MarkerBlock } from './index.ts'

Deno.test('withoutPattern', async (t) => {
  const mb = new MarkerBlock({
    startLine: `|>|>`,
    endLine: `<|<|`,
  })

  const text = `
|>|>
inner content
<|<|
`

  await t.step('MarkerBlock.extract', () => {
    const r = mb.extract(text)

    assertEquals(r, 'inner content')
  })

  await t.step('MarkerBlock.replace', () => {
    const r = mb.replace(text, 'new inner content')

    assertEquals(
      r,
      `
|>|>
new inner content
<|<|
`,
    )
  })
})

Deno.test('withPattern', async (t) => {
  const mb = new MarkerBlock({
    startLine: /^\|>\s*\|>\s*/,
    endLine: /<\|\s*<\|\s*/,
  })
  const text = `
|>-|>
fake content
<|-<|

|>  |>
real content
<|  <|
`

  await t.step('MarkerBlock.extract', () => {
    const r = mb.extract(text)
    assertEquals(r, 'real content')
  })
  await t.step('MarkerBlock.replace', () => {
    const r = mb.replace(text, 'new real content')

    assertEquals(
      r,
      `
|>-|>
fake content
<|-<|

|>  |>
new real content
<|  <|
`,
    )
  })
})

Deno.test('edge cases', async (t) => {
  const mb = new MarkerBlock({
    startLine: /^\|>\s*\|>\s*/,
    endLine: /<\|\s*<\|\s*/,
  })
  const text = `
|>-|>
fake content
<|-<|

|>  |>
real content
<|  <|
`

  await t.step('MarkerBlock.replace with empty content', () => {
    const r = mb.replace(text, [])

    assertEquals(
      r,
      `
|>-|>
fake content
<|-<|

|>  |>
<|  <|
`,
    )
  })

  await t.step('MarkerBlock.replace with empty string', () => {
    const r = mb.replace(text, '')

    assertEquals(
      r,
      `
|>-|>
fake content
<|-<|

|>  |>

<|  <|
`,
    )
  })

  await t.step('MarkerBlock.replace empty text', () => {
    const r = mb.extract('')
    assertEquals(r, null)
  })
  // only start marker
  await t.step('MarkerBlock.replace only start marker', () => {
    const text = `
|>  |>
some content
    `
    const r = mb.replace(text, 'new real content')
    assertEquals(r, text)
  })
})
