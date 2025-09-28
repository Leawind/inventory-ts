import type { BytesProvider, ReadableBaffer, WritableBaffer } from './api.ts';

export class BafferImpl implements WritableBaffer, ReadableBaffer {
	private buffer: Uint8Array;
	/**
	 * Updated in `read` and `write` methods
	 */
	private pos: number;
	/**
	 * Updated in `set` methods
	 */
	private length: number;

	private constructor(capacity: number) {
		this.buffer = new Uint8Array(capacity);
		this.pos = 0;
		this.length = 0;
	}

	/**
	 * Called in `set` methods
	 */
	private ensureCapacity(newLength: number): void {
		if (newLength > this.buffer.length) {
			const newCapacity = Math.max(this.buffer.length * 2, newLength);
			const newBuffer = new Uint8Array(newCapacity);
			newBuffer.set(this.buffer);
			this.buffer = newBuffer;
		}
	}

	declare getI16LE: (index: number) => number;
	declare getI16BE: (index: number) => number;
	declare getI24LE: (index: number) => number;
	declare getI24BE: (index: number) => number;
	declare getI32LE: (index: number) => number;
	declare getI32BE: (index: number) => number;
	declare getI40LE: (index: number) => number;
	declare getI40BE: (index: number) => number;
	declare getI48LE: (index: number) => number;
	declare getI48BE: (index: number) => number;
	declare getI56LE: (index: number) => bigint;
	declare getI56BE: (index: number) => bigint;
	declare getI64LE: (index: number) => bigint;
	declare getI64BE: (index: number) => bigint;

	declare getU16LE: (index: number) => number;
	declare getU16BE: (index: number) => number;
	declare getU24LE: (index: number) => number;
	declare getU24BE: (index: number) => number;
	declare getU32LE: (index: number) => number;
	declare getU32BE: (index: number) => number;
	declare getU40LE: (index: number) => number;
	declare getU40BE: (index: number) => number;
	declare getU48LE: (index: number) => number;
	declare getU48BE: (index: number) => number;
	declare getU56LE: (index: number) => bigint;
	declare getU56BE: (index: number) => bigint;
	declare getU64LE: (index: number) => bigint;
	declare getU64BE: (index: number) => bigint;

	declare readI16LE: () => number;
	declare readI24LE: () => number;
	declare readI32LE: () => number;
	declare readI40LE: () => number;
	declare readI48LE: () => number;
	declare readI16BE: () => number;
	declare readI24BE: () => number;
	declare readI32BE: () => number;
	declare readI40BE: () => number;
	declare readI48BE: () => number;
	declare readI56LE: () => bigint;
	declare readI64LE: () => bigint;
	declare readI56BE: () => bigint;
	declare readI64BE: () => bigint;

	declare readU16LE: () => number;
	declare readU24LE: () => number;
	declare readU32LE: () => number;
	declare readU40LE: () => number;
	declare readU48LE: () => number;
	declare readU16BE: () => number;
	declare readU24BE: () => number;
	declare readU32BE: () => number;
	declare readU40BE: () => number;
	declare readU48BE: () => number;
	declare readU56LE: () => bigint;
	declare readU64LE: () => bigint;
	declare readU56BE: () => bigint;
	declare readU64BE: () => bigint;

	getI8(i: number): number {
		const val = this.buffer[i];
		return (val << 24) >> 24;
	}
	getU8(i: number): number {
		return this.buffer[i];
	}
	readI8(): number {
		const result = this.getI8(this.pos);
		this.pos += 1;
		return result;
	}
	readU8(): number {
		const result = this.getU8(this.pos);
		this.pos += 1;
		return result;
	}

	get(index: number, size: number): ReadableBaffer {
		const baffer = new BafferImpl(size);
		baffer.write(this.buffer.slice(index, index + size));
		return baffer;
	}

	read(size: number): ReadableBaffer {
		const result = this.get(size, this.pos);
		this.pos += size;
		return result;
	}

	toArrayBuffer(): ArrayBuffer {
		return this.buffer.buffer.slice(0, this.length) as ArrayBuffer;
	}

	toInt8Array(): Int8Array {
		return new Int8Array(this.toArrayBuffer());
	}
	toUint8Array(): Uint8Array {
		return new Uint8Array(this.toArrayBuffer());
	}
	toUint8ClampedArray(): Uint8ClampedArray {
		return new Uint8ClampedArray(this.toArrayBuffer());
	}
	toInt16Array(): Int16Array {
		return new Int16Array(this.toArrayBuffer());
	}
	toUint16Array(): Uint16Array {
		return new Uint16Array(this.toArrayBuffer());
	}
	toInt32Array(): Int32Array {
		return new Int32Array(this.toArrayBuffer());
	}
	toFloat32Array(): Float32Array {
		return new Float32Array(this.toArrayBuffer());
	}
	toFloat64Array(): Float64Array {
		return new Float64Array(this.toArrayBuffer());
	}
	toUint32Array(): Uint32Array {
		return new Uint32Array(this.toArrayBuffer());
	}
	toBigInt64Array(): BigInt64Array {
		return new BigInt64Array(this.toArrayBuffer());
	}
	toBigUint64Array(): BigUint64Array {
		return new BigUint64Array(this.toArrayBuffer());
	}

	static {
		// Reader
		for (const endian of ['LE', 'BE'] as const) {
			// get unsigned
			for (const bits of [16n, 24n, 32n, 40n, 48n] as const) {
				const bytes = bits / 8n;
				BafferImpl.prototype[`getU${bits}${endian}`] = function (i: number): number {
					let value = 0n;
					for (let j = 0n; j < bytes; j++) {
						value |= BigInt(this.buffer[i + Number(endian === 'LE' ? j : bytes - 1n - j)]) << (8n * j);
					}
					return Number(value);
				};
			}
			for (const bits of [56n, 64n] as const) {
				const bytes = bits / 8n;
				BafferImpl.prototype[`getU${bits}${endian}`] = function (i: number): bigint {
					let value = 0n;
					for (let j = 0n; j < bytes; j++) {
						value |= BigInt(this.buffer[i + Number(endian === 'LE' ? j : bytes - 1n - j)]) << (8n * j);
					}
					return value;
				};
			}

			// get signed
			for (const bits of [16n, 24n, 32n, 40n, 48n] as const) {
				const keyGetSigned = `getI${bits}${endian}` as const;
				const keyGetUnsigned = `getU${bits}${endian}` as const;
				BafferImpl.prototype[keyGetSigned] = function (i: number) {
					let value = BigInt(this[keyGetUnsigned](i));
					if (value & 1n << bits - 1n) {
						value -= 1n << bits;
					}
					return Number(value);
				};
			}
			for (const bits of [56n, 64n] as const) {
				const keyGetSigned = `getI${bits}${endian}` as const;
				const keyGetUnsigned = `getU${bits}${endian}` as const;
				BafferImpl.prototype[keyGetSigned] = function (i: number) {
					let value = BigInt(this[keyGetUnsigned](i));
					if (value & 1n << bits - 1n) {
						value -= 1n << bits;
					}
					return value;
				};
			}

			// read
			for (const sign of ['U', 'I'] as const) {
				for (const bits of [16, 24, 32, 40, 48, 56, 64] as const) {
					const bytes = bits / 8;
					// read
					BafferImpl.prototype[`read${sign}${bits}${endian}`] = function () {
						const result = this[`get${sign}${bits}${endian}`](this.pos);
						this.pos += bytes;
						return result;
					};
				}
			}
		}
	}

	declare setI16LE: (index: number, value: number) => number;
	declare setI16BE: (index: number, value: number) => number;
	declare setI24LE: (index: number, value: number) => number;
	declare setI24BE: (index: number, value: number) => number;
	declare setI32LE: (index: number, value: number) => number;
	declare setI32BE: (index: number, value: number) => number;
	declare setI40LE: (index: number, value: number) => number;
	declare setI40BE: (index: number, value: number) => number;
	declare setI48LE: (index: number, value: number) => number;
	declare setI48BE: (index: number, value: number) => number;
	declare setU16LE: (index: number, value: number) => number;
	declare setU16BE: (index: number, value: number) => number;
	declare setU24LE: (index: number, value: number) => number;
	declare setU24BE: (index: number, value: number) => number;
	declare setU32LE: (index: number, value: number) => number;
	declare setU32BE: (index: number, value: number) => number;
	declare setU40LE: (index: number, value: number) => number;
	declare setU40BE: (index: number, value: number) => number;
	declare setU48LE: (index: number, value: number) => number;
	declare setU48BE: (index: number, value: number) => number;
	declare setI56LE: (index: number, value: bigint) => number;
	declare setI56BE: (index: number, value: bigint) => number;
	declare setI64LE: (index: number, value: bigint) => number;
	declare setI64BE: (index: number, value: bigint) => number;
	declare setU56LE: (index: number, value: bigint) => number;
	declare setU56BE: (index: number, value: bigint) => number;
	declare setU64LE: (index: number, value: bigint) => number;
	declare setU64BE: (index: number, value: bigint) => number;

	declare writeI16LE: (value: number) => number;
	declare writeI24LE: (value: number) => number;
	declare writeI32LE: (value: number) => number;
	declare writeI40LE: (value: number) => number;
	declare writeI48LE: (value: number) => number;
	declare writeI16BE: (value: number) => number;
	declare writeI24BE: (value: number) => number;
	declare writeI32BE: (value: number) => number;
	declare writeI40BE: (value: number) => number;
	declare writeI48BE: (value: number) => number;
	declare writeI56LE: (value: bigint) => number;
	declare writeI64LE: (value: bigint) => number;
	declare writeI56BE: (value: bigint) => number;
	declare writeI64BE: (value: bigint) => number;

	declare writeU16LE: (value: number) => number;
	declare writeU24LE: (value: number) => number;
	declare writeU32LE: (value: number) => number;
	declare writeU40LE: (value: number) => number;
	declare writeU48LE: (value: number) => number;
	declare writeU16BE: (value: number) => number;
	declare writeU24BE: (value: number) => number;
	declare writeU32BE: (value: number) => number;
	declare writeU40BE: (value: number) => number;
	declare writeU48BE: (value: number) => number;
	declare writeU56LE: (value: bigint) => number;
	declare writeU64LE: (value: bigint) => number;
	declare writeU56BE: (value: bigint) => number;
	declare writeU64BE: (value: bigint) => number;

	setI8(index: number, value: number): number {
		this.ensureCapacity(index + 1);
		this.buffer[index] = value & 0xFF;
		this.length = Math.max(this.length, index + 1);
		return 1;
	}
	setU8(index: number, value: number): number {
		this.ensureCapacity(index + 1);
		this.buffer[index] = value & 0xFF;
		this.length = Math.max(this.length, index + 1);
		return 1;
	}

	writeI8(value: number): number {
		this.setI8(this.pos, value);
		this.pos += 1;
		return 1;
	}
	writeU8(value: number): number {
		this.setU8(this.pos, value);
		this.pos += 1;
		return 1;
	}

	set(index: number, buffer: BytesProvider): number {
		let source: Uint8Array;
		if (buffer instanceof BafferImpl) {
			source = buffer.toUint8Array();
		} else if (buffer instanceof ArrayBuffer) {
			source = new Uint8Array(buffer);
		} else if (ArrayBuffer.isView(buffer)) {
			// 处理 TypedArray 类型
			source = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
		} else {
			// 其他情况，尝试直接转换
			source = new Uint8Array(buffer as ArrayBufferLike);
		}

		this.ensureCapacity(index + source.length);
		this.buffer.set(source, index);
		this.length = Math.max(this.length, index + source.length);
		return source.length;
	}

	write(buffer: BytesProvider): number {
		const size = this.set(this.pos, buffer);
		this.pos += size;
		return size;
	}

	setUtf8(index: number, value: string): number {
		const encoder = new TextEncoder();
		const bytes = encoder.encode(value);
		return this.set(index, bytes);
	}

	writeUtf8(value: string): number {
		const size = this.setUtf8(this.pos, value);
		this.pos += size;
		return size;
	}

	static {
		// Writer
		for (const endian of ['LE', 'BE'] as const) {
			for (const bits of [16n, 24n, 32n, 40n, 48n, 56n, 64n] as const) {
				const bytes = bits / 8n;
				const bytesNum = Number(bytes);

				// set signed
				BafferImpl.prototype[`setI${bits}${endian}`] = function (i: number, value: number | bigint) {
					this.ensureCapacity(i + bytesNum);
					const big = BigInt(value);
					for (let j = 0; j < bytes; j++) {
						this.buffer[i + (endian === 'LE' ? j : bytesNum - 1 - j)] = Number(
							(big >> (BigInt(j) * 8n)) & 0xffn,
						);
					}
					this.length = Math.max(this.length, i + bytesNum);
					return bytesNum;
				};

				// set unsigned
				BafferImpl.prototype[`setU${bits}${endian}`] = function (i: number, value: number | bigint) {
					return this[`setI${bits}${endian}`](i, value);
				};
			}

			//write
			for (const sign of ['U', 'I'] as const) {
				for (const bits of [16, 24, 32, 40, 48, 56, 64] as const) {
					const bytes = bits / 8;
					// write
					BafferImpl.prototype[`write${sign}${bits}${endian}`] = function (value: number | bigint) {
						this[`set${sign}${bits}${endian}`](this.pos, value);
						this.pos += bytes;
						return bytes;
					};
				}
			}
		}
	}

	position(): number {
		return this.pos;
	}

	moveBy(offset: number): void {
		this.pos += offset;
	}

	moveTo(position: number): void {
		this.pos = position;
	}

	public static create(capacity: number = 0): BafferImpl {
		return new BafferImpl(capacity);
	}
}
