import { Baffer } from './index.ts';
import { assertEquals } from '@std/assert';

Deno.test('Baffer - constructor and basic operations', () => {
	const baffer = Baffer.create(10);
	assertEquals(baffer.position, 0);

	// Test initial buffer capacity
	const capacityBaffer = Baffer.create(100);
	assertEquals(capacityBaffer.position, 0);
});

Deno.test('Baffer - should handle 8-bit integer operations', () => {
	const baffer = Baffer.create(0);

	for (let i = -128; i <= 127; i++) {
		baffer.writeI8(i);
	}
	for (let i = 0; i <= 255; i++) {
		baffer.writeU8(i);
	}

	baffer.moveTo(0);
	for (let i = -128; i <= 127; i++) {
		assertEquals(baffer.readI8(), i);
	}
	for (let i = 0; i <= 255; i++) {
		assertEquals(baffer.readU8(), i);
	}
});

Deno.test('Baffer - should handle n-bit integer operations', () => {
	const baffer = Baffer.create(0);
	for (const bits of [16, 24, 32, 40, 48] as const) {
		const step = Math.max(1, 2 ** (bits - 13) - 1);
		baffer.moveTo(0);
		for (let i = -(2 ** (bits - 1)); i < 2 ** (bits - 1); i += step) {
			baffer[`writeI${bits}LE`](i);
			baffer[`writeI${bits}BE`](i);
		}
		for (let i = 0; i < 2 ** bits; i += step) {
			baffer[`writeU${bits}LE`](i);
			baffer[`writeU${bits}BE`](i);
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
		const step = 2n ** (bits - 13n) - 1n;
		baffer.moveTo(0);
		for (let i = -(2n ** (bits - 1n)); i < 2n ** (bits - 1n); i += step) {
			baffer[`writeI${bits}LE`](i);
			baffer[`writeI${bits}BE`](i);
		}
		for (let i = 0n; i < 2n ** bits; i += step) {
			baffer[`writeU${bits}LE`](i);
			baffer[`writeU${bits}BE`](i);
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

Deno.test('Baffer - should handle buffer operations', () => {
	const baffer = Baffer.create(20);

	// Test set and get buffer
	const testData = new Uint8Array([1, 2, 3, 4, 5]);
	assertEquals(baffer.set(0, testData.buffer), 5);

	const retrieved = baffer.get(0, 5);
	assertEquals(retrieved.toUint8Array().length, 5);
	assertEquals(retrieved.toUint8Array()[0], 1);
	assertEquals(retrieved.toUint8Array()[4], 5);

	// Test write and read buffer
	baffer.moveTo(5);
	baffer.write(testData.buffer);

	baffer.moveTo(5);
	const retrieved2 = baffer.read(5);
	assertEquals(retrieved2.toUint8Array().length, 5);
	assertEquals(retrieved2.toUint8Array()[0], 1);
	assertEquals(retrieved2.toUint8Array()[4], 5);
});

Deno.test('Baffer - should handle string operations', () => {
	const baffer = Baffer.create(50);

	// Test setString and toString
	const testString = 'Hello, World!';
	baffer.writeUtf8(testString);
	baffer.moveTo(0);

	assertEquals(new TextDecoder().decode(baffer.toUint8Array()), testString);
});

Deno.test('Baffer - should handle array conversion operations', () => {
	const baffer = Baffer.create(20);

	// Fill with some data to make lengths multiples
	baffer.setU32LE(0, 0x12345678);
	baffer.setU32LE(4, 0xabcdef00);

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

Deno.test('Baffer - should handle position operations', () => {
	const baffer = Baffer.create(20);

	assertEquals(baffer.position, 0);

	baffer.moveTo(5);
	assertEquals(baffer.position, 5);

	baffer.moveBy(3);
	assertEquals(baffer.position, 8);

	baffer.moveBy(-2);
	assertEquals(baffer.position, 6);
});

Deno.test('Baffer - should handle buffer expansion', () => {
	const baffer = Baffer.create(5);

	// Should automatically expand buffer when writing beyond initial capacity
	assertEquals(baffer.setU32LE(10, 0x12345678), 4);
	assertEquals(baffer.getU32LE(10), 0x12345678);
});
