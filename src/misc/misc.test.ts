import { assertEquals } from '@std/assert';
import { Escaper, range, sortObjectKeys } from '@/misc/index.ts';

Deno.test('Escaper', () => {
	const esc = new Escaper().addDefaultMappings();

	const cases = [
		['\\', '\\\\'],
		['\n', '\\n'],
		['\r', '\\r'],
		['\t', '\\t'],
		['\v', '\\v'],
		['\b', '\\b'],
		['\f', '\\f'],
		['\0', '\\0'],
	];
	for (const [real, escaped] of cases) {
		assertEquals(esc.escape(real), escaped, `Escaping ${real}`);
		assertEquals(esc.unescape(escaped), real, `Unescaping ${escaped}`);
	}

	assertEquals(esc.unescape('\\q'), 'q');
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

Deno.test('misc/sortObjectKeys/basic', () => {
	const obj = {
		b: 1,
		a: 2,
		c: {
			f: 9,
			e: 10,
			d: 3,
		},
	};
	assertEquals(Object.keys(obj), ['b', 'a', 'c']);
	const sorted = sortObjectKeys(obj);
	assertEquals(Object.keys(sorted), ['a', 'b', 'c']);
	assertEquals(Object.keys(sorted.c), ['d', 'e', 'f']);
});

Deno.test('misc/sortObjectKeys/consistency', () => {
	const obj = {
		b: 1,
		a: null,
		c: {
			f: null,
			e: 10,
			d: 3,
		},
	};
	const sorted = sortObjectKeys(obj);
	assertEquals(obj, sorted);
});
