import { Options } from './index.ts';
import { assert } from '@std/assert';

Deno.test('options example', () => {
	const ListenOptions = Options.define({
		host: '127.0.0.1',
		port: 51120,
		limit: 0,
	});

	function listen(options?: typeof ListenOptions.DeepPartial) {
		const opts = ListenOptions.fill(options);
		console.log(`Host: ${opts.host}`);
		console.log(`Port: ${opts.port}`);
		console.log(`Limit: ${opts.limit}`);
	}

	listen({
		host: 'localhost',
		port: 1234,
		limit: 1,
	});

	// listen();
});

Deno.test('options plain', () => {
	class A {}

	type MyOptionsType = {
		foo: string;
		bool: boolean;
		num: number;
		bi: bigint;
		a: A;
		fun: () => void;
		nested: {
			foo: string;
			bool: boolean;
			num: number;
			bi: bigint;
			a: A;
			fun: () => void;
		};
		subOptions: MyOptionsType[];
	};

	const MyOptions = Options.define<MyOptionsType>({
		foo: 'bar',
		bool: false,
		num: 13500,
		bi: 108000n,
		a: new A(),
		fun: () => {},
		nested: {
			foo: 'bar',
			bool: false,
			num: 13500,
			bi: 108000n,
			a: new A(),
			fun: () => {},
		},
		subOptions: [],
	});

	function applyOptions(_arg: string, opts: typeof MyOptions.DeepPartial): MyOptionsType {
		return MyOptions.fill(opts);
	}

	const options = applyOptions('foo', {
		foo: 'baz',
		bool: true,
		num: 13501,
		nested: {
			foo: 'car',
			bool: true,
			num: 12138,
		},
	});

	assert(options.foo === 'baz');
	assert(options.bool === true);
	assert(options.num === 13501);
	assert(options.nested.foo === 'car');
	assert(options.nested.bool === true);
	assert(options.nested.num === 12138);

	assert(options.nested.bi === 108000n);
	assert(options.nested.a instanceof A);
});

Deno.test('FillOptions: objects', () => {
	const MyOptions = Options.define<{
		nested: {
			a: number;
			b: { c: number; d: number };
		};
	}>({
		nested: {
			a: 1,
			b: { c: 2, d: 3 },
		},
	});
	{
		const opts = MyOptions.fill({
			nested: {
				b: { c: 9 },
			},
		}, { objects: 'merge' });

		assert(opts.nested.a === 1);
		assert(opts.nested.b.c === 9);
		assert(opts.nested.b.d === 3);
	}
	{
		const opts = MyOptions.fill({
			nested: {
				b: { c: 9 },
			},
		}, { objects: 'replace' });

		assert(opts.nested.a === undefined);
		assert(opts.nested.b.c === 9);
		assert(opts.nested.b.d === undefined);
	}
});

Deno.test('FillOptions: arrays', () => {
	const MyOptions = Options.define({ list: [1, 2] });
	{
		const opts = MyOptions.fill({ list: [2, 3] }, { arrays: 'merge' });

		assert(opts.list.length === 3);
		assert(opts.list[0] === 1);
		assert(opts.list[1] === 2);
		assert(opts.list[2] === 3);
	}
	{
		const opts = MyOptions.fill({ list: [2, 3] }, { arrays: 'replace' });
		assert(opts.list.length === 2);
		assert(opts.list[0] === 2);
		assert(opts.list[1] === 3);
	}
	{
		const opts = MyOptions.fill({ list: [2, 3] }, { arrays: 'concat' });
		assert(opts.list.length === 4);
		assert(opts.list[0] === 1);
		assert(opts.list[1] === 2);
		assert(opts.list[2] === 2);
		assert(opts.list[3] === 3);
	}
});
