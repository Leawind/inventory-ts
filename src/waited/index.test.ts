import { Waited } from '@/waited/index.ts';
import { assert } from '@std/assert';

function wait(ms: number = 0) {
	return new Promise<void>((resolve) => ms === 0 ? resolve() : setTimeout(resolve, ms));
}

Deno.test('wait', async () => {
	const w = new Waited();

	assert(w.isWaiting());

	(async () => {
		await wait();
		w.resolve();
	})();

	assert(w.isWaiting());
	await w.wait();
	assert(w.isWaiting());

	w.reset();
	assert(w.isWaiting());
	w.resolve();
	assert(w.isWaiting());
});

Deno.test('wait autoreset', async () => {
	const w = new Waited(false);

	assert(w.isWaiting());

	(async () => {
		await wait();
		w.resolve();
	})();

	assert(w.isWaiting());
	await w.wait();
	assert(!w.isWaiting());

	w.reset();
	assert(w.isWaiting());
	w.resolve();
	assert(!w.isWaiting());
});

Deno.test('wait callback', async () => {
	let isFinished = false;

	const w = new Waited(false, () => {
		console.log('Finished');
		isFinished = true;
	});

	assert(w.isWaiting());

	(async () => {
		await wait();
		w.resolve();
	})();

	assert(w.isWaiting());
	assert(!isFinished);
	await w.wait();
	assert(isFinished);
	assert(!w.isWaiting());

	isFinished = false;
	w.reset();
	assert(w.isWaiting());
	w.resolve();
	assert(isFinished);
	assert(!w.isWaiting());
});
