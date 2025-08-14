import * as posix_path from '@std/path@1/posix';

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

export function escapeMarkers(s: string, markers: string[], esc: string = '\\'): string {
	s = s.replaceAll(esc, esc + esc);
	for (let i = 0; i < markers.length; i++) {
		const marker = markers[i];
		s = s.replaceAll(marker, `${esc}${marker}`);
	}
	return s;
}

export function unescapeMarkers(s: string, markers: string[], esc: string = '\\'): string {
	for (let i = 0; i < markers.length; i++) {
		const marker = markers[i];
		s = s.replaceAll(`${esc}${marker}`, marker);
	}
	s = s.replaceAll(esc + esc, esc);
	return s;
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
