import { imagine, META } from '@/imagine.ts';

Deno.test('imagine', () => {
	type A = {
		name: string;
		born: number;
		parent: A;
		children: Set<A>;
		arr: number[];

		getAge(): number;
		greet(to: A): string;
	};
	const a = imagine<A>();

	console.log(a.parent.getAge()[META]);
	console.log(a[META]);
	console.log(a.getAge[META]);
	console.log(a.name.padEnd(2)[META]);
	console.log(a.parent.arr[0].toFixed()[META]);
	console.log(a.parent.getAge().toFixed()[META]);
	console.log(a.parent.arr[1].toString()[META]);

	console.log(a.greet(imagine<A>())[META]);
});
