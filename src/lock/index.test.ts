import { assert, assertAlmostEquals, assertStrictEquals, assertThrows } from '@std/assert';
import { TimeRuler, wait } from '@/test-utils.ts';
import { Lock } from '@/lock/index.ts';

Deno.test('Simple lock', async () => {
	const lock = new Lock();
	assert(!lock.isLocked());
	await lock.acquire();
	assert(lock.isLocked());
	lock.release();
	assert(!lock.isLocked());
});

Deno.test('Lock', async () => {
	const lock = new Lock();

	async function criticalSection(id: number) {
		await lock.acquire();
		assert(lock.isLocked());
		try {
			console.log(`Task ${id} entered`);
			await wait(100);
		} finally {
			console.log(`Task ${id} start to left`);
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

Deno.test('Lock queue order with multiple acquirers', async () => {
	const lock = new Lock();
	const order: number[] = [];

	lock.acquire().then(() => {
		order.push(1);
		assertStrictEquals(order.join(','), '1');
		lock.release();
	});

	lock.acquire().then(() => {
		order.push(2);
		assertStrictEquals(order.join(','), '1,2');
		lock.release();
	});

	lock.acquire().then(() => {
		order.push(3);
		assertStrictEquals(order.join(','), '1,2,3');
		lock.release();
	});

	await lock.acquire();
	assertStrictEquals(order.join(','), '1,2,3');
	lock.release();
});

Deno.test('Throw when releasing unlocked lock', () => {
	const lock = new Lock();
	assertThrows(() => lock.release(), Error, 'Cannot release an unlocked lock');
});

Deno.test('Concurrent stress test', async () => {
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
	assertStrictEquals(counter, concurrency, 'All operations should complete');
});

Deno.test('Immediate release before acquisition', () => {
	const lock = new Lock();
	assertThrows(() => lock.release(), Error);
});

Deno.test('Lock state consistency', async () => {
	const lock = new Lock();

	await lock.acquire();

	const lateAcquire = lock.acquire();
	let acquired = false;
	lateAcquire.then(() => acquired = true);

	await wait(0);
	assert(!acquired, 'Should not acquire while locked');

	lock.release();
	await wait(0);
	assert(acquired, 'Should acquire after release');

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

Deno.test('Dead lock', async () => {
	const lockA = new Lock();
	const lockB = new Lock();

	let aliceGotA = false;
	let aliceGotB = false;

	let bobGotB = false;
	let bobGotA = false;

	lockA.acquire().then(async () => {
		aliceGotA = true;
		await lockB.acquire();
		aliceGotB = true;
		lockB.release();
		lockA.release();
	});
	lockB.acquire().then(async () => {
		bobGotB = true;
		await lockA.acquire();
		bobGotA = true;
		lockA.release();
		lockB.release();
	});

	await wait(50);

	assert(aliceGotA);
	assert(!aliceGotB);
	assert(bobGotB);
	assert(!bobGotA);
});

Deno.test('getOwner', async () => {
	const lock = new Lock();
	const owner1 = { id: 'owner1' };
	const owner2 = { id: 'owner2' };

	assertStrictEquals(lock.getOwner(), undefined);

	await lock.acquire(owner1);
	assertStrictEquals(lock.getOwner(), owner1);
	lock.release();

	assertStrictEquals(lock.getOwner(), undefined);

	await lock.acquire(owner2);
	assertStrictEquals(lock.getOwner(), owner2);
	lock.release();

	assertStrictEquals(lock.getOwner(), undefined);

	await lock.acquire();
	assertStrictEquals(lock.getOwner(), undefined);
	lock.release();
});

Deno.test('getOwner maintains correct owner during queued acquisitions', async () => {
	const lock = new Lock();
	const owner1 = { id: 'owner1' };
	const owner2 = { id: 'owner2' };

	await lock.acquire(owner1);
	assertStrictEquals(lock.getOwner(), owner1);

	let secondAcquired = false;
	lock.acquire(owner2).then(() => {
		secondAcquired = true;
		assertStrictEquals(lock.getOwner(), owner2);
		lock.release();
	});

	await wait(0);
	assert(!secondAcquired, 'Second acquisition should be waiting');
	assertStrictEquals(lock.getOwner(), owner1);

	lock.release();

	await wait(0);
	assert(secondAcquired, 'Second acquisition should complete');
	assertStrictEquals(lock.getOwner(), undefined);
});

Deno.test('Lock.of', async () => {
	for (let i = 0; i < 100; i++) {
		const key = `key-${i}`;

		const lock1 = Lock.of(key);
		const lock2 = Lock.of(key);

		assert(lock1 === lock2);

		await lock1.acquire();
		lock1.release();
	}

	assertStrictEquals(Lock['locks'].size, 0);

	for (let i = 0; i < 100; i++) {
		const lock = Lock.of(`key-${i}`);

		await lock.acquire();
	}

	assertStrictEquals(Lock['locks'].size, 100);

	for (let i = 0; i < 100; i++) {
		const lock = Lock.of(`key-${i}`);
		lock.release();
	}

	assertStrictEquals(Lock['locks'].size, 0);
});

Deno.test('Lock.untilReleased', async () => {
	const lock = new Lock();

	const t = new TimeRuler(0);

	await lock.untilReleased();
	assertAlmostEquals(t.now(), 0, 25);

	await lock.acquire();

	await Promise.all([
		(async () => {
			await lock.untilReleased();
			assertAlmostEquals(t.now(), 150, 25);
		})(),
		(async () => {
			await t.til(150);
			lock.release();
		})(),
	]);
});
