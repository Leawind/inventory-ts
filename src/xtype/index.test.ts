import { assertEquals } from '@std/assert/equals';
import * as xtype from './index.ts';

class Cat {
	constructor(
		public catname: string,
		public isHungry: boolean,
		public birthday: number,
	) {}

	talk() {
		return this.miao();
	}

	miao() {
		console.log('miao');
		return 'miao';
	}
}
class Dog {
	constructor(
		public dogname: string,
		public isHungry: boolean,
		public birthday: Date,
	) {}

	talk() {
		return this.wang();
	}

	wang() {
		console.log('wang');
		return 'wang';
	}
}
class Pig {
	constructor(
		public pigname: string,
		public isHungry: boolean,
		public birthday: number,
	) {}

	talk() {
		return this.oink();
	}

	oink() {
		console.log('oink');
		return 'oink';
	}
}

const cat = new Cat('cat', true, 1971);
const dog = new Dog('dog', false, new Date());
const pig = new Pig('pig', true, 1972);

Deno.test('combine', () => {
	const pet = xtype.xorMerge(cat, dog, pig);

	assertEquals(pet.catname, 'cat');
	assertEquals(pet.dogname, 'dog');
	assertEquals(pet.miao(), 'miao');
	assertEquals(pet.wang(), 'wang');

	// assertEquals(pet.isHungry, true);
	// pet.talk();
});
