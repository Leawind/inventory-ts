import * as posix_path from '@std/path@1/posix';
import type { JsonValue } from '@/types.ts';

export * from '@/misc/zone.ts';
export * from '@/misc/parsing.ts';

export class Sets {
	static and<T>(setA: Set<T>, setB: Set<T>): Set<T> {
		const s: Set<T> = new Set();
		setA.forEach((a) => setB.has(a) && s.add(a));
		return s;
	}

	static add<A, B>(setA: Set<A>, setB: Set<B>): Set<A | B> {
		const s: Set<A | B> = new Set(setA);
		setB.forEach((b) => s.add(b));
		return s;
	}

	static minus<T>(setA: Set<T>, setB: Set<T>): Set<T> {
		const s: Set<T> = new Set(setA);
		setB.forEach((b) => s.delete(b));
		return s;
	}
}

export class Escaper {
	private mappings: Map<string, string> = new Map();

	public constructor(
		public escaper: string = '\\',
		/**
		 * marker --> real
		 *
		 * ### Example
		 *
		 * ```ts
		 * {
		 *    n: '\n',
		 *    t: '\t',
		 *    r: '\r',
		 * }
		 * ```
		 */
		mappings?: Record<string, string>,
	) {
		this.map(mappings ?? {});
	}

	public addDefaultMappings(): this {
		return this.map({
			n: '\n',
			r: '\r',
			t: '\t',
			v: '\v',
			b: '\b',
			f: '\f',
			'0': '\0',
		});
	}

	public map(mappings: Record<string, string>): this;
	public map(marker: string, real: string): this;
	public map(
		...args:
			| [mappings: Record<string, string>]
			| [marker: string, real: string]
	): this {
		if (args.length === 1) {
			this.mappings = new Map(Object.entries(args[0]));
		} else {
			const [marker, real] = args;
			this.mappings.set(marker, real);
		}
		return this;
	}

	public escape(s: string): string {
		let result = s.replaceAll(this.escaper, this.escaper + this.escaper);
		for (const [marker, real] of this.mappings) {
			result = result.replaceAll(real, this.escaper + marker);
		}
		return result;
	}
	public unescape(realString: string): string {
		let result = '';
		let isEscaping = false;
		for (let i = 0; i < realString.length; i++) {
			const ch = realString[i];
			if (isEscaping) {
				result += this.mappings.get(ch) ?? ch;
				isEscaping = false;
			} else if (ch === this.escaper) {
				isEscaping = true;
				continue;
			} else {
				result += ch;
			}
		}
		return result;
	}
}

export function rebasePath(rpath: string, fromBase: string, toBase: string): string {
	if (!rpath.startsWith('/')) {
		rpath = '/' + rpath;
	}
	if (!fromBase.startsWith('/')) {
		fromBase = '/' + fromBase;
	}

	if (!rpath.startsWith(fromBase)) {
		throw new Error(`rpath '${rpath}' does not start with fromBase '${fromBase}'`);
	}

	const relative = posix_path.relative(fromBase, rpath);
	const result = posix_path.join(toBase, relative);
	if (!result.startsWith('/')) {
		return '/' + result;
	}
	return result;
}

export function ord(c: string): number {
	return c.charCodeAt(0);
}
export function chr(n: number): string {
	return String.fromCharCode(n);
}
export function bin(n: number): string {
	return ((n | 0) >>> 0).toString(2).padStart(32, '0');
}
export function hex(n: number): string {
	return ((n | 0) >>> 0).toString(16).padStart(8, '0');
}
export function oct(n: number): string {
	return ((n | 0) >>> 0).toString(8).padStart(11, '0');
}

export function range(to: number): Iterable<number>;
export function range(begin: number, end: number, step?: number): Iterable<number>;
export function* range(...args: [number] | [number, number, step?: number]): Iterable<number> {
	if (args.length === 1) {
		for (let i = 0; i < args[0]; i++) {
			yield i;
		}
	} else {
		const [begin, end, step = 1] = args;
		if (step > 0) {
			for (let i = begin; i < end; i += step) yield i;
		} else if (step < 0) {
			for (let i = begin; i > end; i += step) yield i;
		} else {
			throw new Error('step must not be zero');
		}
	}
}

/**
 * Sorts the keys of an object in a consistent order.
 *
 * This function works recursively on nested objects and arrays.
 *
 * ### Parameters
 *
 * - `obj` - The object to sort.
 * - `compare` - A comparison function for sorting keys. Defaults to lexicographical order.
 * - `depth` - The depth of nested objects to sort. Defaults to Infinity.
 *    -  If set to negative, no sorting is applied.
 *    -  If set to 0, only the top-level keys are sorted.
 */
export function sortObjectKeys<T extends JsonValue>(
	obj: T,
	compare: (a: string, b: string) => number = (a, b) => a > b ? 1 : a < b ? -1 : 0,
	depth = Infinity,
): T {
	if (depth < 0) {
		return obj;
	}
	if (typeof obj === 'object') {
		if (obj === null) {
			return obj;
		} else if (Array.isArray(obj)) {
			return obj.map((item) => sortObjectKeys(item, compare, depth - 1)) as T;
		} else {
			const entries = Object.entries(obj)
				.sort((a, b) => compare(a[0], b[0]))
				.map(([key, value]) => [key, sortObjectKeys(value, compare, depth - 1)]);
			return Object.fromEntries(entries) as T;
		}
	}
	return obj;
}
