import { assert } from '@std/assert';
import { escapeMarkers, unescapeMarkers } from '@/misc/index.ts';

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
