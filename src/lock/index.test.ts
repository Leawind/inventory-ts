import { Lock } from '@/lock/index.ts';
import { assert, assertStrictEquals, assertThrows } from '@std/assert';

function wait(ms: number): Promise<void> {
	return new Promise((resolve) => ms === 0 ? resolve() : setTimeout(resolve, ms));
}

Deno.test('Lock', async () => {
	const lock = new Lock();

	async function criticalSection(id: number) {
		await lock.acquire();
		try {
			console.log(`Task ${id} entered`);
			await wait(100);
		} finally {
			lock.release();
			console.log(`Task ${id} left`);
		}
	}

	criticalSection(1);
	criticalSection(2);
	criticalSection(3);

	await lock.acquire();
	lock.release();
});

Deno.test("Lock queue order with multiple acquirers", async () => {
	const lock = new Lock();
	const order: number[] = [];

	lock.acquire().then(() => {
		order.push(1);
		assertStrictEquals(order.join(','), "1");
		lock.release();
	});

	lock.acquire().then(() => {
		order.push(2);
		assertStrictEquals(order.join(','), "1,2");
		lock.release();
	});

	lock.acquire().then(() => {
		order.push(3);
		assertStrictEquals(order.join(','), "1,2,3");
		lock.release();
	});

	await lock.acquire();
	assertStrictEquals(order.join(','), "1,2,3");
	lock.release();
});

Deno.test("Throw when releasing unlocked lock", () => {
	const lock = new Lock();
	assertThrows(() => lock.release(), Error, "Cannot release an unlocked lock");
});

Deno.test("Concurrent stress test", async () => {
	const lock = new Lock();
	let counter = 0;
	const concurrency = 100;

	let totalCost = 0;

	const start = Date.now();

	await Promise.all(Array.from({ length: concurrency }, async () => {
		await lock.acquire();
		const current = ++counter;
		const cost = Math.random() * 5;
		totalCost += cost;
		await wait(cost);
		lock.release();
		return current;
	}));

	const end = Date.now();
	const duration = end - start;

	assert(duration > totalCost);
	assertStrictEquals(counter, concurrency, "All operations should complete");
});

Deno.test("Immediate release before acquisition", () => {
	const lock = new Lock();
	assertThrows(() => lock.release(), Error);
});

Deno.test("Lock state consistency", async () => {
	const lock = new Lock();

	await lock.acquire();

	const lateAcquire = lock.acquire();
	let acquired = false;
	lateAcquire.then(() => acquired = true);

	await wait(0);
	assert(!acquired, "Should not acquire while locked");

	lock.release();
	await wait(0);
	assert(acquired, "Should acquire after release");

	lock.release();
	assertThrows(() => lock.release(), Error);
});

Deno.test('Lock delay', async () => {
	const WAIT_TIME = 50;

	const lock = new Lock();

	(async () => {
		await lock.acquire();
		await wait(WAIT_TIME);
		lock.release();
	})();

	const start = Date.now();
	await lock.acquire();
	const end = Date.now();

	const duration = end - start;
	assert(duration >= WAIT_TIME);

	lock.release();
});
