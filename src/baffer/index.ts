import type { BytesProvider, NumberReaderBaffer, NumberWriterBaffer } from './api.ts';

export class Baffer implements NumberWriterBaffer, NumberReaderBaffer {
	#buffer!: ArrayBuffer;
	#u8array!: Uint8Array;
	private set buffer(value: ArrayBuffer) {
		this.#buffer = value;
		this.#u8array = new Uint8Array(value);
	}
	private get buffer(): ArrayBuffer {
		return this.#buffer;
	}
	private get u8array(): Uint8Array {
		return this.#u8array;
	}

	/**
	 * Updated in `read` and `write` methods
	 */
	#pos: number;
	/**
	 * Updated in `set` methods
	 */
	#length: number;

	/**
	 * Length in bytes
	 */
	public get byteLength(): number {
		return this.#length;
	}
	public get position(): number {
		return this.#pos;
	}
	public get remaining(): number {
		return this.#length - this.#pos;
	}

	private constructor(buffer: ArrayBuffer);
	private constructor(capacity: number);
	private constructor(arg: number | ArrayBuffer) {
		if (typeof arg === 'number') {
			this.buffer = new ArrayBuffer(arg);
			this.#pos = 0;
			this.#length = 0;
		} else if (arg instanceof ArrayBuffer) {
			this.buffer = arg;
			this.#pos = 0;
			this.#length = arg.byteLength;
		} else {
			throw new Error('Invalid argument');
		}
	}

	/**
	 * Called in `set` methods
	 */
	private ensureCapacity(size: number): void {
		if (size > this.buffer.byteLength) {
			const newCapacity = Math.max(this.buffer.byteLength * 2, size);
			const newBuffer = new ArrayBuffer(newCapacity);
			new Uint8Array(newBuffer).set(this.u8array);
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
		const val = this.u8array[i];
		return (val << 24) >> 24;
	}
	getU8(i: number): number {
		return this.u8array[i];
	}
	readI8(): number {
		const result = this.getI8(this.#pos);
		this.#pos += 1;
		return result;
	}
	readU8(): number {
		const result = this.getU8(this.#pos);
		this.#pos += 1;
		return result;
	}

	static {
		// Reader
		for (const endian of ['LE', 'BE'] as const) {
			// get unsigned
			for (const bits of [16n, 24n, 32n, 40n, 48n] as const) {
				const bytes = bits / 8n;
				Baffer.prototype[`getU${bits}${endian}`] = function (
					this: Baffer,
					i: number,
				): number {
					let value = 0n;
					for (let j = 0n; j < bytes; j++) {
						value |= BigInt(
							this.u8array[i + Number(endian === 'LE' ? j : bytes - 1n - j)],
						) <<
							(8n * j);
					}
					return Number(value);
				};
			}
			for (const bits of [56n, 64n] as const) {
				const bytes = bits / 8n;
				Baffer.prototype[`getU${bits}${endian}`] = function (
					this: Baffer,
					i: number,
				): bigint {
					let value = 0n;
					for (let j = 0n; j < bytes; j++) {
						value |= BigInt(
							this.u8array[i + Number(endian === 'LE' ? j : bytes - 1n - j)],
						) <<
							(8n * j);
					}
					return value;
				};
			}

			// get signed
			for (const bits of [16n, 24n, 32n, 40n, 48n] as const) {
				const keyGetSigned = `getI${bits}${endian}` as const;
				const keyGetUnsigned = `getU${bits}${endian}` as const;
				Baffer.prototype[keyGetSigned] = function (this: Baffer, i: number) {
					let value = BigInt(this[keyGetUnsigned](i));
					if (value & (1n << (bits - 1n))) {
						value -= 1n << bits;
					}
					return Number(value);
				};
			}
			for (const bits of [56n, 64n] as const) {
				const keyGetSigned = `getI${bits}${endian}` as const;
				const keyGetUnsigned = `getU${bits}${endian}` as const;
				Baffer.prototype[keyGetSigned] = function (i: number) {
					let value = BigInt(this[keyGetUnsigned](i));
					if (value & (1n << (bits - 1n))) {
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
					Baffer.prototype[`read${sign}${bits}${endian}`] = function (): any {
						const result = this[`get${sign}${bits}${endian}`](this.#pos);
						this.#pos += bytes;
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

	declare writeI16LE: (value: number) => Baffer;
	declare writeI24LE: (value: number) => Baffer;
	declare writeI32LE: (value: number) => Baffer;
	declare writeI40LE: (value: number) => Baffer;
	declare writeI48LE: (value: number) => Baffer;
	declare writeI16BE: (value: number) => Baffer;
	declare writeI24BE: (value: number) => Baffer;
	declare writeI32BE: (value: number) => Baffer;
	declare writeI40BE: (value: number) => Baffer;
	declare writeI48BE: (value: number) => Baffer;
	declare writeI56LE: (value: bigint) => Baffer;
	declare writeI64LE: (value: bigint) => Baffer;
	declare writeI56BE: (value: bigint) => Baffer;
	declare writeI64BE: (value: bigint) => Baffer;

	declare writeU16LE: (value: number) => Baffer;
	declare writeU24LE: (value: number) => Baffer;
	declare writeU32LE: (value: number) => Baffer;
	declare writeU40LE: (value: number) => Baffer;
	declare writeU48LE: (value: number) => Baffer;
	declare writeU16BE: (value: number) => Baffer;
	declare writeU24BE: (value: number) => Baffer;
	declare writeU32BE: (value: number) => Baffer;
	declare writeU40BE: (value: number) => Baffer;
	declare writeU48BE: (value: number) => Baffer;
	declare writeU56LE: (value: bigint) => Baffer;
	declare writeU64LE: (value: bigint) => Baffer;
	declare writeU56BE: (value: bigint) => Baffer;
	declare writeU64BE: (value: bigint) => Baffer;

	setI8(index: number, value: number): number {
		this.ensureCapacity(index + 1);
		this.u8array[index] = value & 0xff;
		this.#length = Math.max(this.#length, index + 1);
		return 1;
	}
	setU8(index: number, value: number): number {
		this.ensureCapacity(index + 1);
		this.u8array[index] = value & 0xff;
		this.#length = Math.max(this.#length, index + 1);
		return 1;
	}

	writeI8(value: number): Baffer {
		this.setI8(this.#pos, value);
		this.#pos += 1;
		return this;
	}
	writeU8(value: number): Baffer {
		this.setU8(this.#pos, value);
		this.#pos += 1;
		return this;
	}

	static {
		// Writer
		for (const endian of ['LE', 'BE'] as const) {
			for (const bits of [16n, 24n, 32n, 40n, 48n, 56n, 64n] as const) {
				const bytes = bits / 8n;
				const bytesNum = Number(bytes);

				// set signed
				Baffer.prototype[`setI${bits}${endian}`] = function (
					this: Baffer,
					i: number,
					value: number | bigint,
				) {
					this.ensureCapacity(i + bytesNum);
					const big = BigInt(value);
					for (let j = 0; j < bytes; j++) {
						this.u8array[i + (endian === 'LE' ? j : bytesNum - 1 - j)] = Number(
							(big >> (BigInt(j) * 8n)) & 0xffn,
						);
					}
					this.#length = Math.max(this.#length, i + bytesNum);
					return bytesNum;
				};

				// set unsigned
				Baffer.prototype[`setU${bits}${endian}`] = function (
					this: Baffer,
					i: number,
					value: number | bigint,
				) {
					return (this as any)[`setI${bits}${endian}`](i, value);
				};
			}

			//write
			for (const sign of ['U', 'I'] as const) {
				for (const bits of [16, 24, 32, 40, 48, 56, 64] as const) {
					const bytes = bits / 8;
					// write
					Baffer.prototype[`write${sign}${bits}${endian}`] = function (
						this: Baffer,
						value: number | bigint,
					): Baffer {
						(this as any)[`set${sign}${bits}${endian}`](this.#pos, value);
						this.#pos += bytes;
						return this;
					};
				}
			}
		}
	}

	set(index: number, buffer: BytesProvider): number {
		let array: Uint8Array;
		if (buffer instanceof Baffer) {
			array = buffer.toUint8Array();
		} else if (buffer instanceof ArrayBuffer) {
			array = new Uint8Array(buffer);
		} else if (ArrayBuffer.isView(buffer)) {
			array = new Uint8Array(
				buffer.buffer,
				buffer.byteOffset,
				buffer.byteLength,
			);
		} else {
			array = new Uint8Array(buffer as ArrayBufferLike);
		}

		this.ensureCapacity(index + array.length);
		this.u8array.set(array, index);
		this.#length = Math.max(this.#length, index + array.length);
		return array.length;
	}
	write(buffer?: BytesProvider): Baffer {
		if (buffer !== undefined) {
			this.#pos += this.set(this.#pos, buffer);
		}
		return this;
	}
	get(index: number, size: number): Baffer {
		return new Baffer(size).write(this.buffer.slice(index, index + size));
	}
	read(size: number): Baffer {
		const result = this.get(this.#pos, size);
		this.#pos += size;
		return result;
	}

	readRemaining(): Baffer {
		return this.read(this.remaining);
	}

	setI32BeUtf8(index: number, value: string): number {
		const encoder = new TextEncoder();
		const bytes = encoder.encode(value);
		this.setI32BE(index, bytes.byteLength);
		this.set(index + 4, bytes.buffer);
		return 4 + bytes.byteLength;
	}

	writeI32BeUtf8(value: string): Baffer {
		const size = this.setI32BeUtf8(this.#pos, value);
		this.#pos += size;
		return this;
	}

	getI32BeUtf8(index: number): string {
		const size = this.getI32BE(index);
		const decoder = new TextDecoder();
		return decoder.decode(this.get(index + 4, size).toArrayBuffer());
	}

	readI32BeUtf8(): string {
		const size = this.getI32BE(this.#pos);
		const decoder = new TextDecoder();
		const result = decoder.decode(
			this.get(this.#pos + 4, size).toArrayBuffer(),
		);
		this.#pos += size + 4;
		return result;
	}

	setUtf8(index: number, value: string): number {
		const encoder = new TextEncoder();
		const bytes = encoder.encode(value);
		this.set(index, bytes.buffer);
		return bytes.byteLength;
	}

	writeUtf8(value: string): Baffer {
		const size = this.setUtf8(this.#pos, value);
		this.#pos += size;
		return this;
	}

	toArrayBuffer(): ArrayBuffer {
		return this.buffer.slice(0, this.#length) as ArrayBuffer;
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

	moveBy(offset: number): void {
		this.#pos += offset;
	}

	moveTo(position: number): void {
		this.#pos = position;
	}

	public static create(capacity: number = 0): Baffer {
		return new Baffer(capacity);
	}

	public static from(buffer: ArrayBuffer): Baffer {
		return new Baffer(buffer);
	}
}
