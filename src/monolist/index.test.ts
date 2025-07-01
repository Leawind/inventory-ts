import { StaticMonoList } from '@/monolist/static.ts';
import { DeferedMonoList } from '@/monolist/defered.ts';
import { assertEquals } from '@std/assert';

const array = [1, 3, 4, 9, 11, 12, 13];

Deno.test('Test Monolist', () => {
	for (
		const ml of [
			StaticMonoList.of(array),
			DeferedMonoList.ofArray(array),
		]
	) {
		assertEquals(ml.get(2), 4);
		assertEquals(ml.sign(), 1);
		assertEquals(ml.length(), 7);

		assertEquals(ml.nearestIndex(3.4), 1);
		assertEquals(ml.nearestIndex(3.5), 2);
		assertEquals(ml.nearestIndex(0.9), 0);
		assertEquals(ml.nearestIndex(9), 3);

		assertEquals(ml.nearestValue(3.4), 3);
		assertEquals(ml.nearestValue(3.5), 4);
		assertEquals(ml.nearestValue(0.9), 1);
		assertEquals(ml.nearestValue(9), 9);

		assertEquals(ml.offsetValue(3.4, -1), 1);
		assertEquals(ml.offsetValue(3.4, -2), 1);
		assertEquals(ml.offsetValue(0, -2), 1);
		assertEquals(ml.offsetValue(0, 2), 4);
		assertEquals(ml.offsetValue(0, 100), 13);

		assertEquals(ml.nextValue(3.4), 4);
		assertEquals(ml.nextValue(0), 3);
		assertEquals(ml.nextValue(13), 13);

		assertEquals(ml.previousValue(3.4), 1);
		assertEquals(ml.previousValue(0), 1);

		assertEquals(ml.toArray(), array);
	}
});
