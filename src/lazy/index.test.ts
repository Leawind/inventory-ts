import { LazyAction } from '@/lazy/index.ts';
import { assert, assertGreater, assertRejects } from '@std/assert';

function wait(ms: number) {
	return new Promise((resolve) => setTimeout(resolve, Math.max(0, ms)));
}

Deno.test('LazyAction simple urge', async () => {
	let executed = false;

	const la = new LazyAction(() => {
		executed = true;
		console.log(performance.now());
	});

	// Time = 0
	la.urge(200, 1000);

	assert(!executed);
	assertGreater(la.sinceLastExecute(), 10000000);

	await wait(100);
	assert(!executed);
	await wait(100);

	await wait(50);

	assert(executed);
});

/**
 * - `U` urge()
 * - `[` Scheduled execution
 * - `]` Deadline
 * - `!` Not executed yet
 * - `O` Executed
 */
const _doc = null;

Deno.test('LazyAction delayed', async () => {
	let executed = false;

	const la = new LazyAction(() => {
		executed = true;
		console.log(performance.now());
	});

	///       0       100       200       300       400       500       600       700       800       900      1000
	///      -|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|-
	///    0  U-------------------[---------------------------------------]
	///  100            U-------------------[-----------------------------]
	///  250                           U-------------------[--------------]
	///  400                                          !
	///  500                                                    O

	// time =   0
	la.urge(200, 600);

	await wait(100);
	// time = 100

	la.urge(200, 600);

	await wait(150);
	// time = 250

	la.urge(200, 600);

	await wait(150);
	// time = 400
	assert(!executed);

	await wait(100);
	// time = 500
	assert(executed);
});

Deno.test('LazyAction deadline', async () => {
	let executed = false;

	const la = new LazyAction(() => {
		executed = true;
		console.log(performance.now());
	});

	///       0       100       200       300       400       500       600       700       800       900      1000
	///      -|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|-
	///    0  U-------------------[-------------------------------------------------]
	///  100            U---------------------------------------[---------]
	///  200                      U-------------------]
	///                                          !         O

	// time =   0
	la.urge(200, 700);

	await wait(100);
	// time = 100
	la.urge(400, 500);

	await wait(100);
	// time = 200
	la.urge(100, 200);

	await wait(150);
	// time = 350
	assert(!executed);

	await wait(100);
	// time = 450
	assert(executed);
});

Deno.test('LazyAction cancel then re-urge', async () => {
	let executed = false;
	const la = new LazyAction(() => {
		executed = true;
	});

	///       0       100       200       300       400       500       600       700       800       900      1000
	///      -|---------|---------|---------|---------|---------|---------|---------|---------|---------|---------|-
	///    0  U-------------------[---------]
	///    0  Cancel
	///    0  U---------[---------]

	la.urge(200, 300);
	la.cancel();
	la.urge(100, 200);

	await wait(50);
	assert(!executed, 'Should wait for new delay period');

	await wait(100);
	assert(executed, 'Should execute after new urge');
});

Deno.test('LazyAction cancel before execution', async () => {
	let executed = false;
	const la = new LazyAction(() => {
		executed = true;
	});

	const promise = la.urge(100, 1000);
	la.cancel();
	assertRejects(async () => await promise);
	await wait(150);
	assert(!executed);
});

Deno.test('LazyAction cancel during multiple urges', async () => {
	let executionCount = 0;
	const la = new LazyAction(() => {
		executionCount++;
	});

	const promise1 = la.urge(200, 1000);
	await wait(100);
	const promise2 = la.urge(300, 1500);

	la.cancel();
	assert(promise1 === promise2);
	assertRejects(async () => await promise2);
	assert(executionCount === 0, 'Should not execute after cancel');
});

Deno.test('Immediate execution', async () => {
	let executed = false;
	const la = new LazyAction(() => {
		executed = true;
	});

	const result = la.urge(0, 0);
	assert(executed);
	assert(result === undefined);
	la.cancel();
	await wait(10);
});
