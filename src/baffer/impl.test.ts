import { BafferImpl } from './impl.ts';
import { assertEquals } from '@std/assert/equals';

Deno.test('BafferImpl - constructor and basic operations', () => {
	const baffer = BafferImpl.create(10);
	assertEquals(baffer.position(), 0);

	// Test initial buffer capacity
	const capacityBaffer = BafferImpl.create(100);
	assertEquals(capacityBaffer.position(), 0);
});

Deno.test('BafferImpl - 8-bit integer operations', () => {
	const baffer = BafferImpl.create(0);

	for (let i = -128; i <= 127; i++) {
		assertEquals(baffer.writeI8(i), 1);
	}
	for (let i = 0; i <= 255; i++) {
		assertEquals(baffer.writeU8(i), 1);
	}

	baffer.moveTo(0);
	for (let i = -128; i <= 127; i++) {
		assertEquals(baffer.readI8(), i);
	}
	for (let i = 0; i <= 255; i++) {
		assertEquals(baffer.readU8(), i);
	}
});

Deno.test('BafferImpl - n-bit integer operations', () => {
	const baffer = BafferImpl.create(0);
	for (const bits of [16, 24, 32, 40, 48] as const) {
		const bytes = bits / 8;
		const step = Math.max(1, 2 ** (bits - 13) - 1);
		baffer.moveTo(0);
		for (let i = -(2 ** (bits - 1)); i < 2 ** (bits - 1); i += step) {
			assertEquals(baffer[`writeI${bits}LE`](i), bytes);
			assertEquals(baffer[`writeI${bits}BE`](i), bytes);
		}
		for (let i = 0; i < 2 ** bits; i += step) {
			assertEquals(baffer[`writeU${bits}LE`](i), bytes);
			assertEquals(baffer[`writeU${bits}BE`](i), bytes);
		}
		baffer.moveTo(0);
		for (let i = -(2 ** (bits - 1)); i < 2 ** (bits - 1); i += step) {
			assertEquals(baffer[`readI${bits}LE`](), i);
			assertEquals(baffer[`readI${bits}BE`](), i);
		}
		for (let i = 0; i < 2 ** bits; i += step) {
			assertEquals(baffer[`readU${bits}LE`](), i);
			assertEquals(baffer[`readU${bits}BE`](), i);
		}
	}

	for (const bits of [56n, 64n] as const) {
		const bytes = Number(bits) / 8;
		const step = 2n ** (bits - 13n) - 1n;
		baffer.moveTo(0);
		for (let i = -(2n ** (bits - 1n)); i < 2n ** (bits - 1n); i += step) {
			assertEquals(baffer[`writeI${bits}LE`](i), bytes);
			assertEquals(baffer[`writeI${bits}BE`](i), bytes);
		}
		for (let i = 0n; i < 2n ** bits; i += step) {
			assertEquals(baffer[`writeU${bits}LE`](i), bytes);
			assertEquals(baffer[`writeU${bits}BE`](i), bytes);
		}
		baffer.moveTo(0);
		for (let i = -(2n ** (bits - 1n)); i < 2n ** (bits - 1n); i += step) {
			assertEquals(baffer[`readI${bits}LE`](), i);
			assertEquals(baffer[`readI${bits}BE`](), i);
		}
		for (let i = 0n; i < 2n ** bits; i += step) {
			assertEquals(baffer[`readU${bits}LE`](), i);
			assertEquals(baffer[`readU${bits}BE`](), i);
		}
	}
});

Deno.test('BafferImpl - buffer operations', () => {
	const baffer = BafferImpl.create(20);

	// Test set and get buffer
	const testData = new Uint8Array([1, 2, 3, 4, 5]);
	assertEquals(baffer.set(0, testData), 5);

	const retrieved = baffer.get(0, 5);
	assertEquals(retrieved.toUint8Array().length, 5);
	assertEquals(retrieved.toUint8Array()[0], 1);
	assertEquals(retrieved.toUint8Array()[4], 5);

	// Test write and read buffer
	baffer.moveTo(5);
	assertEquals(baffer.write(testData), 5);

	baffer.moveTo(5);
	const retrieved2 = baffer.read(5);
	assertEquals(retrieved2.toUint8Array().length, 5);
	assertEquals(retrieved2.toUint8Array()[0], 1);
	assertEquals(retrieved2.toUint8Array()[4], 5);
});

Deno.test('BafferImpl - string operations', () => {
	const baffer = BafferImpl.create(50);

	// Test setString and toString
	const testString = 'Hello, World!';
	baffer.writeUtf8(testString);
	baffer.moveTo(0);

	assertEquals(new TextDecoder().decode(baffer.toUint8Array()), testString);
});

Deno.test('BafferImpl - array conversion operations', () => {
	const baffer = BafferImpl.create(20);

	// Fill with some data to make lengths multiples
	baffer.setU32LE(0, 0x12345678);
	baffer.setU32LE(4, 0xABCDEF00);

	// Test various array conversions
	assertEquals(baffer.toUint8Array().length, 8);
	assertEquals(baffer.toInt8Array().length, 8);
	assertEquals(baffer.toArrayBuffer().byteLength, 8);

	// Test typed array conversions with proper byte alignment
	assertEquals(baffer.toUint16Array().length, 4); // 8 bytes = 4 uint16
	assertEquals(baffer.toInt16Array().length, 4);
	assertEquals(baffer.toUint32Array().length, 2); // 8 bytes = 2 uint32
	assertEquals(baffer.toInt32Array().length, 2);
});

Deno.test('BafferImpl - position operations', () => {
	const baffer = BafferImpl.create(20);

	assertEquals(baffer.position(), 0);

	baffer.moveTo(5);
	assertEquals(baffer.position(), 5);

	baffer.moveBy(3);
	assertEquals(baffer.position(), 8);

	baffer.moveBy(-2);
	assertEquals(baffer.position(), 6);
});

Deno.test('BafferImpl - buffer expansion', () => {
	const baffer = BafferImpl.create(5);

	// Should automatically expand buffer when writing beyond initial capacity
	assertEquals(baffer.setU32LE(10, 0x12345678), 4);
	assertEquals(baffer.getU32LE(10), 0x12345678);
});
