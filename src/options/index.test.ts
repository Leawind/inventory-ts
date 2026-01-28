import { overwrite } from './index.ts';
import { assert, assertEquals, assertStrictEquals } from '@std/assert';

Deno.test('overwrite - primitive values', () => {
	const target = { a: 1, c: true };
	const source = { a: 2, d: 'new' };

	const result = overwrite(target, source);

	assert(result === target);

	assertEquals(result.a, 2);
	assertEquals(result.c, true);
	assertEquals(result.d, 'new');
});

Deno.test('overwrite - undefined handling - replace', () => {
	const target = { a: 1, b: 2, c: 3 };
	const source = { a: undefined, b: 20 };

	const result = overwrite(target, source, { undefined: 'replace' });

	assertEquals(Object.keys(result).length, 3);
	assertEquals(result.a, undefined);
	assertEquals(result.b, 20);
	assertEquals(result.c, 3);
});

Deno.test('overwrite - undefined handling - ignore', () => {
	const target = { a: 1, b: 2, c: 3 };
	const source = { a: undefined, b: 20 };

	const result = overwrite(target, source, { undefined: 'ignore' });

	assertEquals(Object.keys(result).length, 3);
	assertEquals(result.a, 1);
	assertEquals(result.b, 20);
	assertEquals(result.c, 3);
});

Deno.test('overwrite - undefined source handling', () => {
	const target = { a: 1, b: 2 };
	const source = undefined;

	const result = overwrite(target, source, { undefined: 'replace' });

	assertStrictEquals(result, undefined);
});

Deno.test('overwrite - undefined source handling with ignore', () => {
	const target = { a: 1, b: 2 };
	const source = undefined;

	const result = overwrite(target, source, { undefined: 'ignore' });

	assertEquals(result, target);
});

Deno.test('overwrite - object handling - merge', () => {
	const target = { obj: { a: 1, b: 2 }, x: 10 };
	const source = { obj: { c: 3 }, y: 20 };

	const result = overwrite(target, source);

	assertEquals(Object.keys(result).length, 3); // obj, x, y
	assertEquals(Object.keys(result.obj).length, 3); // only a, b, c
	assertEquals(result.obj.c, 3);
	assertStrictEquals(result.obj.a, 1);
	assertStrictEquals(result.obj.b, 2);
	assertEquals(result.x, 10);
	assertEquals(result.y, 20);
});

Deno.test('overwrite - array handling - concat-tail (default)', () => {
	const target = { arr: [1, 2] } as const;
	const source = { arr: [3, 4] } as const;

	const result = overwrite(target, source, { array: 'concat-tail' });

	assertEquals(result.arr, [1, 2, 3, 4]);
});

Deno.test('overwrite - array handling - concat-head', () => {
	const target = { arr: [1, 2] };
	const source = { arr: [3, 4] };

	const result = overwrite(target, source, { array: 'concat-head' });

	assertEquals(result.arr, [3, 4, 1, 2]);
});

Deno.test('overwrite - array handling - replace', () => {
	const target = { arr: [1, 2, 5] };
	const source = { arr: [3, 4] };

	const result = overwrite(target, source, { array: 'replace' });

	assertEquals(result.arr, [3, 4]);
});

Deno.test('overwrite - array handling - union', () => {
	const target = { arr: [1, 3, 2] } as const;
	const source = { arr: [3, 4, 5] } as const;

	const result = overwrite(target, source, { array: 'union' });

	// Union mode creates a unique combination of both arrays
	assertEquals(result.arr.length, 5);
	assertEquals(new Set(result.arr), new Set([1, 3, 2, 4, 5]));
});

Deno.test('overwrite - array handling - union with duplicates in same array', () => {
	const target = { arr: [1, 2, 2, 3] };
	const source = { arr: [2, 3, 4, 4, 5] };

	const result = overwrite(target, source, { array: 'union' });

	// Union mode combines unique values from both arrays
	// Target has [1, 2, 2, 3] -> unique: [1, 2, 3]
	// Source has [2, 3, 4, 4, 5] -> unique: [2, 3, 4, 5]
	// Combined unique: [1, 2, 3, 4, 5] but also keeping the duplicate in original sequence
	// Actually the implementation adds non-duplicate items from source to target in sequence
	// Original target: [1, 2, 2, 3]
	// From source [2, 3, 4, 4, 5]: 2 and 3 already exist, first 4 gets added, second 4 skipped, 5 added
	// Final: [1, 2, 2, 3, 4, 5] which is length 6
	assertEquals(result.arr.length, 6);
	assertEquals(new Set(result.arr), new Set([1, 2, 3, 4, 5]));
});

Deno.test('overwrite - function handling', () => {
	const fn1 = () => 'original';
	const fn2 = () => 'updated';
	const target = { fn: fn1, val: 10 };
	const source = { fn: fn2 };

	const result = overwrite(target, source);

	assertStrictEquals(result.fn, fn2);
	assertEquals(result.val, 10);
});

Deno.test('overwrite - string handling', () => {
	const target = { str: 'original', num: 42 };
	const source = { str: 'updated' };

	const result = overwrite(target, source);

	assertEquals(result.str, 'updated');
	assertEquals(result.num, 42);
});

Deno.test('overwrite - number handling', () => {
	const target = { num: 42, str: 'hello' };
	const source = { num: 99 };

	const result = overwrite(target, source);

	assertEquals(result.num, 99);
	assertEquals(result.str, 'hello');
});

Deno.test('overwrite - boolean handling', () => {
	const target = { bool: true, str: 'hello' };
	const source = { bool: false };

	const result = overwrite(target, source);

	assertEquals(result.bool, false);
	assertEquals(result.str, 'hello');
});

Deno.test('overwrite - symbol handling', () => {
	const sym1 = Symbol('sym1');
	const sym2 = Symbol('sym2');
	const target = { sym: sym1, str: 'hello' };
	const source = { sym: sym2 };

	const result = overwrite(target, source);

	assertStrictEquals(result.sym, sym2);
	assertEquals(result.str, 'hello');
});

Deno.test('overwrite - bigint handling', () => {
	const big1 = BigInt(123);
	const big2 = BigInt(456);
	const target = { big: big1, str: 'hello' };
	const source = { big: big2 };

	const result = overwrite(target, source);

	assertStrictEquals(result.big, big2);
	assertEquals(result.str, 'hello');
});

Deno.test('overwrite - null handling', () => {
	const target = { a: 1, b: null };
	const source = { a: 2, b: null };

	const result = overwrite(target, source);

	assertEquals(result.a, 2);
	assertStrictEquals(result.b, null);
});

Deno.test('overwrite - deeply nested objects with different options', () => {
	interface DeepObj {
		a: {
			b: {
				c: {
					d: number[];
					e: { f: string };
				};
			};
		};
	}

	const target: DeepObj = {
		a: {
			b: {
				c: {
					d: [1, 2],
					e: { f: 'old' },
				},
			},
		},
	};

	const source: DeepObj = {
		a: {
			b: {
				c: {
					d: [3, 4],
					e: { f: 'new' },
				},
			},
		},
	};

	const result = overwrite(target, source, { array: 'concat-tail' });

	assertEquals(result.a.b.c.d, [1, 2, 3, 4]);
	assertEquals(result.a.b.c.e.f, 'new');
});

Deno.test('overwrite - array of objects with merge', () => {
	const target = {
		items: [
			{ id: 1, name: 'first' },
			{ id: 2, name: 'second' },
		],
	};

	const source = {
		items: [
			{ id: 3, name: 'third' },
			{ id: 4, name: 'fourth' },
		],
	};

	const result = overwrite(target, source, { array: 'concat-tail' });

	assertEquals(result.items.length, 4);
	assertEquals(result.items[0].id, 1);
	assertEquals(result.items[1].id, 2);
	assertEquals(result.items[2].id, 3);
	assertEquals(result.items[3].id, 4);
});

Deno.test('overwrite - objects with same keys but different values', () => {
	const target = { shared: 'target_value', target_only: 'data' };
	const source = { shared: 'source_value', source_only: 'info' };

	const result = overwrite(target, source);

	assertEquals(result.shared, 'source_value');
	assertEquals(result.target_only, 'data');
	assertEquals(result.source_only, 'info');
});

Deno.test('overwrite - empty objects and arrays', () => {
	const target = { obj: {}, arr: [] };
	const source = { obj: { a: 1 }, arr: [42] };

	const result = overwrite(target, source);

	assertEquals(Object.keys(result.obj).length, 1);
	assertEquals(result.obj.a, 1);
	assertEquals(result.arr.length, 1);
	assertEquals(result.arr[0], 42);
});

Deno.test('overwrite - properties with undefined values in target', () => {
	const target = { a: undefined, b: 1 };
	const source = { c: 3 };

	const result = overwrite(target, source, { undefined: 'replace' });

	assertEquals(Object.keys(result).length, 3);
	assertStrictEquals(result.a, undefined);
	assertEquals(result.b, 1);
	assertEquals(result.c, 3);
});

Deno.test('overwrite - deep merge scenario', () => {
	const target = {
		level1: {
			level2: {
				a: 1,
				b: [1, 2],
				c: { x: 10 },
			},
			m: 5,
		},
		top: 100,
	};

	const source = {
		level1: {
			level2: {
				a: 2,
				b: [3, 4],
				c: { y: 20 },
			},
			n: 6,
		},
		top2: 200,
	};

	const result = overwrite(target, source, { array: 'concat-tail' });

	// Check merged top level
	assertEquals(result.top, 100);
	assertEquals(result.top2, 200);

	// Check merged level1
	const level1 = result.level1;
	assertEquals(level1.m, 5);
	assertEquals(level1.n, 6);

	// Check merged level2 (with merge option)
	const level2 = level1.level2;
	assertEquals(level2.a, 2); // from source
	assertEquals(level2.b, [1, 2, 3, 4]); // concatenated
	assertEquals(level2.c.x, 10); // from target
	assertEquals(level2.c.y, 20); // from source
});

Deno.test('overwrite - mixed types replacement', () => {
	const target = {
		str: 'string',
		num: 42,
		arr: [1, 2, 3],
		obj: { a: 1 },
		bool: true,
	};

	const source = {
		str: ['now', 'an', 'array'],
		num: { now: 'an object' },
		arr: 'now string',
		obj: 123, // becomes number
		bool: new Date(), // becomes date
	};

	const result = overwrite(target, source);

	assertEquals(result.str, ['now', 'an', 'array']);
	assertEquals(result.num, { now: 'an object' });
	assertEquals(result.arr, 'now string');
	assertEquals(result.obj, 123);
	assertStrictEquals(typeof result.bool, 'object'); // Date is an object
});
