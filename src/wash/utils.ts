import { r } from '@/tstr/index.ts';

export function cmd(strs: TemplateStringsArray, ...args: unknown[]): string[] {
	const src = r(strs, ...args);
	const parts: string[] = [];
	let index = 0;
	for (const match of src.matchAll(/(?<!\\)"[^"]*(\\"[^"]*)*(?<!\\)"/g)) {
		const rawPart = match[0];
		if (index < match.index) {
			const middle = src
				.slice(index, match.index)
				.trim()
				.split(/\s+/g)
				.filter((s) => s.trim().length > 0);
			if (middle.length > 0) {
				parts.push(...middle);
			}
		}
		const part = rawPart.slice(1, -1).replace(/\\"/g, '"');
		parts.push(part);
		index = match.index + rawPart.length;
	}
	if (index < src.length) {
		const middle = src
			.slice(index)
			.trim()
			.split(/\s+/g)
			.filter((s) => s.trim().length > 0);
		if (middle.length > 0) {
			parts.push(...middle);
		}
	}
	return parts;
}

export function concatUint8Arrays(arrays: Uint8Array[]): Uint8Array {
	const totalLength = arrays.reduce((acc, cur) => acc + cur.length, 0);
	const result = new Uint8Array(totalLength);
	let offset = 0;
	for (const array of arrays) {
		result.set(array, offset);
		offset += array.length;
	}
	return result;
}

export class Uint8ArrayCollector {
	private chunks: Uint8Array[] = [];
	private stream: WritableStream<Uint8Array>;

	public ondata: (chunk: Uint8Array) => void = () => {};

	public constructor() {
		const self = this as Uint8ArrayCollector;
		this.stream = new WritableStream({
			write(chunk: Uint8Array) {
				self.chunks.push(chunk);
				self.ondata(chunk);
			},
		});
	}

	public get writable(): WritableStream<Uint8Array> {
		return this.stream;
	}

	public collect(): Uint8Array {
		return concatUint8Arrays(this.chunks);
	}
}

export async function collectStream(
	input: ReadableStream<Uint8Array>,
	onwrite?: (chunk: Uint8Array) => void,
): Promise<Uint8Array> {
	const collector = new Uint8ArrayCollector();
	if (onwrite) collector.ondata = onwrite;
	await input.pipeTo(collector.writable);
	return collector.collect();
}
