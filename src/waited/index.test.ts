import { Waited } from '@/waited/index.ts';
import { assert, assertStrictEquals, assertThrows } from '@std/assert';

function wait(ms: number) {
	return new Promise<void>((resolve) => ms === 0 ? resolve() : setTimeout(resolve, ms));
}

Deno.test('wait with auto reset', async () => {
	const w = new Waited({ autoReset: true });
	for (let i = 0; i < 3; i++) {
		wait(0).then(() => w.resolve());

		assert(w.isWaiting());
		await w.wait();
		assert(w.wait() instanceof Promise);
		assert(w.isWaiting());

		w.reset();
		assert(w.isWaiting());
		w.resolve();
		assert(w.isWaiting());
	}
});

Deno.test('wait without auto reset', async () => {
	const w = new Waited({ autoReset: false });
	for (let i = 0; i < 3; i++) {
		w.reset();
		assert(w.isWaiting());

		wait(0).then(() => w.resolve());

		assert(w.isWaiting());
		assert(w.wait() instanceof Promise);
		await w.wait();
		assert(w.wait() === undefined);
		assert(!w.isWaiting());

		w.reset();
		assert(w.isWaiting());
		assert(w.wait() instanceof Promise);
		w.resolve();
		assert(w.wait() === undefined);
		assert(!w.isWaiting());
	}
});

Deno.test('keepResult: true (default)', () => {
	const w = new Waited<number>({ autoReset: false });

	w.reset();
	w.resolve(42);
	assertStrictEquals(w.wait(), 42, 'Should keep the resolved value');
	assert(!w.isWaiting(), 'Should not be waiting after resolution');

	w.reset();
	w.resolve(100);
	assertStrictEquals(w.wait(), 100, 'Should keep the new resolved value');
	assert(!w.isWaiting(), 'Should not be waiting after resolution');
});

Deno.test('keepResult: false', () => {
	const w = new Waited<number>({
		autoReset: false,
		keepResult: false,
	});

	w.reset();
	w.resolve(42);
	assertStrictEquals(w.wait(), undefined, 'Should not keep the resolved value when keepResult is false');
	assert(!w.isWaiting(), 'Should not be waiting after resolution');

	w.reset();
	w.resolve(100);
	assertStrictEquals(w.wait(), undefined, 'Should not keep the new resolved value when keepResult is false');
	assert(!w.isWaiting(), 'Should not be waiting after resolution');
});

Deno.test('keepResult with async resolution', async () => {
	const w = new Waited<string>({
		autoReset: false,
		keepResult: true,
	});
	for (let i = 0; i < 3; i++) {
		w.reset();

		wait(0).then(() => w.resolve('async result'));

		const result = await w.wait();

		assertStrictEquals(result, 'async result', 'Should get the resolved value');
		assertStrictEquals(w.wait(), 'async result', 'Should keep the resolved value');
		assertStrictEquals(await w.wait(), 'async result', 'Should keep the resolved value');
	}
});

Deno.test('keepResult: false with async resolution', async () => {
	const w = new Waited<string>({
		autoReset: false,
		keepResult: false,
	});

	for (let i = 0; i < 3; i++) {
		w.reset();

		wait(0).then(() => w.resolve('async result'));

		const result = await w.wait();
		assertStrictEquals(result, 'async result', 'Should get the resolved value');
		assertStrictEquals(w.wait(), undefined, 'Should not keep the resolved value when keepResult is false');
		assertStrictEquals(await w.wait(), undefined, 'Should not keep the resolved value when keepResult is false');
	}
});

Deno.test('onresolved', async () => {
	let isFinished = false;

	const w = new Waited<string>({
		autoReset: false,
		onresolved: () => {
			isFinished = true;
		},
	});

	for (let i = 0; i < 3; i++) {
		isFinished = false;
		w.reset();

		assert(w.isWaiting());

		wait(0).then(() => w.resolve('the first result'));

		assert(w.isWaiting());
		assert(!isFinished);
		const result1 = await w.wait();
		assertStrictEquals(result1, 'the first result');
		assert(isFinished);
		assert(!w.isWaiting());

		isFinished = false;
		w.reset();
		assert(w.isWaiting());
		w.resolve('the second result');
		const result2 = await w.wait();
		assertStrictEquals(result2, 'the second result');
		assert(isFinished);
		assert(!w.isWaiting());
	}
});

Deno.test('onrejected', async () => {
	let isFinished = false;
	const w = new Waited({
		autoReset: false,
		onresolved: () => {
			isFinished = true;
		},
	});

	for (let i = 0; i < 3; i++) {
		w.reset();
		isFinished = false;

		assert(w.isWaiting());

		wait(0).then(() => w.reject('the reason'));

		assert(w.isWaiting());
		assert(!isFinished);
		try {
			await w.wait();
			assert(isFinished);
		} catch (e: unknown) {
			assertStrictEquals(e, 'the reason');
			assert(!isFinished);
		}
		assert(!w.isWaiting());
	}
});

Deno.test('resolve/reject on non-waiting Waited', () => {
	const w = new Waited({ autoReset: false });
	assertThrows(() => w.resolve(), Error);
	assertThrows(() => w.reject(), Error);
});
