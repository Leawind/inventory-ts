import { assert, assertEquals } from '@std/assert';
import { escapeMarkers, range, unescapeMarkers } from '@/misc/index.ts';

Deno.test('escape', () => {
	for (
		const [markers, str, esc] of [
			[["'"], `I say 'you'!`, `I say \\'you\\'!`],
			[[], `\\`, `\\\\`],
			[['"'], `\\"'\\`, `\\\\\\"'\\\\`],
		] as [string[], string, string][]
	) {
		assert(escapeMarkers(str, markers) === esc);
		assert(unescapeMarkers(esc, markers) === str);
	}
});

Deno.test('misc/range', () => {
	assertEquals([...range(5)], [0, 1, 2, 3, 4]);
	assertEquals([...range(1, 5)], [1, 2, 3, 4]);
	assertEquals([...range(1, 5, 2)], [1, 3]);
	assertEquals([...range(5, 1, -1)], [5, 4, 3, 2]);
	assertEquals([...range(5, 1, -2)], [5, 3]);
	assertEquals([...range(1, 5, -1)], []);
	assertEquals([...range(5, 1)], []);
	assertEquals([...range(5, 1, 1)], []);
});
