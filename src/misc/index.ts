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
