import { assertEquals, assertThrows } from '@std/assert'
import { CSV } from './index.ts'

Deno.test('CSV.parse should parse CSV text correctly', () => {
  const text = 'name,age\nAlice,30\nBob,25'
  const csv = CSV.parse(text)

  assertEquals(csv.rows(), 2)
  assertEquals(csv.cols(), 2)
  assertEquals(csv.getRaw(0, 0), 'Alice')
  assertEquals(csv.getRaw(1, 1), '25')
})

Deno.test('CSV.stringify should convert CSV object to text correctly', () => {
  const csv = new CSV()
  csv.setColName(0, 'name')
  csv.setColName(1, 'age')
  csv.addRow(['Alice', '30'])
  csv.addRow(['Bob', '25'])

  const text = CSV.stringify(csv)
  assertEquals(text, 'name,age\nAlice,30\nBob,25\n')
})

Deno.test('CSV.validateRowId should throw error for invalid row index', () => {
  const csv = new CSV()
  csv.addRow(['Alice', '30'])

  assertThrows(() => csv.validateRowId(-1), Error)

  assertThrows(() => csv.validateRowId(1), Error)
})

Deno.test('CSV.validateColId should throw error for invalid column index', () => {
  const csv = new CSV()
  csv.setColName(0, 'name')

  assertThrows(() => csv.validateColId(-1), Error)

  assertThrows(() => csv.validateColId(1), Error)
})

Deno.test('CSV.get should return parsed value correctly', () => {
  const csv = new CSV()
  csv.setColName(0, 'name')
  csv.setColType(0, (literal: string) => literal.toUpperCase())
  csv.addRow(['Alice'])

  const value = csv.get<string>(0, 0)
  assertEquals(value, 'ALICE')
})
