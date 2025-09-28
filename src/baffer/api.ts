export type TypedArray =
	| Int8Array
	| Uint8Array
	| Uint8ClampedArray
	| Int16Array
	| Uint16Array
	| Int32Array
	| Float32Array
	| Float64Array
	| Uint32Array
	| BigInt64Array
	| BigUint64Array;

type IorU = 'I' | 'U';

type NumberBits = 16 | 24 | 32 | 40 | 48;
type NumberKeys = `${IorU}8` | `${IorU}${NumberBits}${'LE' | 'BE'}`;

type BigIntBits = 56 | 64;
type BigIntKeys = `${IorU}${BigIntBits}${'LE' | 'BE'}`;

//TODO BufferSource
export type BytesProvider = ReadableBaffer | ArrayBufferLike | TypedArray;

export type BaseBaffer = {
	position(): number;
	move(offset: number): void;
	goto(position: number): void;
};

export type ReadableBaffer =
	& { [K in `get${NumberKeys}`]: (index: number) => number }
	& { [K in `get${BigIntKeys}`]: (index: number) => bigint }
	& { [K in `read${NumberKeys}`]: () => number }
	& { [K in `read${BigIntKeys}`]: () => bigint }
	& {
		get(index: number, size: number): ReadableBaffer;
		read(size: number): ReadableBaffer;
	}
	& {
		toArrayBuffer(): ArrayBuffer;

		toInt8Array(): Int8Array;
		toUint8Array(): Uint8Array;
		toUint8ClampedArray(): Uint8ClampedArray;
		toInt16Array(): Int16Array;
		toUint16Array(): Uint16Array;
		toInt32Array(): Int32Array;
		toFloat32Array(): Float32Array;
		toFloat64Array(): Float64Array;
		toUint32Array(): Uint32Array;
		toBigInt64Array(): BigInt64Array;
		toBigUint64Array(): BigUint64Array;
	};

export type WritableBaffer =
	& { [K in `set${NumberKeys}`]: (index: number, value: number) => number }
	& { [K in `set${BigIntKeys}`]: (index: number, value: bigint) => number }
	& { [K in `write${NumberKeys}`]: (value: number) => number }
	& { [K in `write${BigIntKeys}`]: (value: bigint) => number }
	& {
		set(index: number, buffer: BytesProvider): number;
		setUtf8(index: number, value: string): number;

		write(buffer: BytesProvider): number;
		writeUtf8(value: string): number;
	};
