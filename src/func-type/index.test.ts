import { assertEquals } from '@std/assert/equals';
import { detectFunctionType } from './index.ts';

Deno.test('test detect function type', () => {
	const obj = {
		// normal
		a: function () {},
		// arrow
		b: () => {},
		// method
		c() {},
	};

	for (const f of [obj.a, obj.b, obj.c]) {
		f.toString = () => 'Hello world!';
	}

	assertEquals(detectFunctionType(obj.a), 'normal');
	assertEquals(detectFunctionType(obj.b), 'arrow');
	assertEquals(detectFunctionType(obj.c), 'method');
});

Deno.test('test detect function type for special characters', () => {
	const obj = {
		// normal
		甲: function (_a: string = '():?,;[]{}中a1$-_=>{', ..._args: unknown[]) {},
		// arrow
		乙: (_a: unknown) => {},
		// method
		['丙'](_a: string = '():?,;[]{}中a1$-_=>{', ..._args: unknown[]) {},
	};

	for (const f of [obj.甲, obj.乙, obj.丙]) {
		f.toString = () => 'Hello world!';
	}

	assertEquals(detectFunctionType(obj.甲), 'normal');
	assertEquals(detectFunctionType(obj.乙), 'arrow');
	assertEquals(detectFunctionType(obj.丙), 'method');
});
