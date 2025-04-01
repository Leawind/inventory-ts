import { Options } from '../src/misc/options.ts';
import { assert } from '@std/assert';
import type { DeepPartial } from '@/types.ts';

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

	function applyOptions(_arg: string, opts: DeepPartial<MyOptionsType>): MyOptionsType {
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
