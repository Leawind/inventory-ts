import { LazyAction } from '@/lazy/index.ts';
import { assertStrictEquals } from '@std/assert';
import { TimeRuler } from '@/test-utils.ts';

Deno.test('LazyAction simple', async () => {
	let executeTimes = 0;

	const la = new LazyAction(() => {
		executeTimes++;
	}, 200);

	///   0       100       200       300       400       500
	///  -|---------|---------|---------|---------|---------|-
	///   E-------------------|
	///             e---------T

	const t = new TimeRuler(0);
	la.urge();
	assertStrictEquals(executeTimes, 1);

	await t.til(100);
	la.urge();

	await t.til(150);
	assertStrictEquals(executeTimes, 1);

	await t.til(250);
	assertStrictEquals(executeTimes, 2);
});

Deno.test('LazyAction crazy', async () => {
	let executeTimes = 0;

	const la = new LazyAction(() => {
		executeTimes++;
	}, 100);

	///   0       100       200       300       400       500
	///  -|---------|---------|---------|---------|---------|-
	///   EeeeeeeeeeEeeeeeeeeeEeeeeeeeeeEeeeee    E

	const t = new TimeRuler(0);
	for (let i = 0; i < 350; i++) {
		await t.til(i);
		la.urge();
	}
	await t.til(450);
	assertStrictEquals(executeTimes, 5);
});

Deno.test('LazyAction executeImmediately should run instantly', async () => {
	let times = 0;
	const la = new LazyAction(() => {
		times++;
	});
	assertStrictEquals(times, 0);
	la.urge();
	assertStrictEquals(times, 1);
	la.executeImmediately();
	assertStrictEquals(times, 2);
	la.urge();
	assertStrictEquals(times, 2);
	await la.urge();
	assertStrictEquals(times, 3);
});

Deno.test('LazyAction setAction replaces the function', () => {
	let val = 0;
	const la = new LazyAction(() => 1);
	la.setAction(() => {
		val = 42;
		return 42;
	});
	const result = la.executeImmediately();
	assertStrictEquals(result, 42);
	assertStrictEquals(val, 42);
});

Deno.test('LazyAction byInterval and byFrequency create instances with expected behavior', () => {
	let a = 0, b = 0;

	const byInterval = LazyAction.byInterval(() => a++, 100);
	const byFreq = LazyAction.byFrequency(() => b++, 10); // every 100ms

	const result1 = byInterval.executeImmediately();
	const result2 = byFreq.executeImmediately();

	assertStrictEquals(result1, 0);
	assertStrictEquals(result2, 0);
	assertStrictEquals(a, 1);
	assertStrictEquals(b, 1);
});

Deno.test('LazyAction urge returns a promise if executed later', async () => {
	let val = 0;
	const la = new LazyAction(() => {
		return ++val;
	}, 200);

	const t = new TimeRuler(0);
	la.urge(); // execute immediately
	assertStrictEquals(val, 1);

	await t.til(50);
	const promise = la.urge(); // will delay
	assertStrictEquals(val, 1); // still only one execution

	await t.til(250);
	const result2 = await promise;

	assertStrictEquals(result2, 2);
	assertStrictEquals(val, 2);
});
