import { assert, assertRejects, assertStrictEquals } from '@std/assert';
import { Deferred } from '@/deferred/index.ts';

Deno.test('Deferred basic functionality', async () => {
	const deferred = new Deferred<string>();

	let resolvedValue = '';
	deferred.then((v) => resolvedValue = v);

	deferred.resolve('success');
	assertStrictEquals(await deferred, 'success');
	assertStrictEquals(resolvedValue, 'success');
});

Deno.test('Deferred error handling', async () => {
	const deferred = new Deferred();
	const testError = new Error('test error');

	deferred.catch((e) => assertStrictEquals(e, testError));
	deferred.reject(testError);

	await assertRejects(() => deferred, Error, 'test error');
});

Deno.test('Deferred chaining', async () => {
	const deferred = new Deferred<number>();

	const result = deferred
		.then((v) => v * 2)
		.then((v) => v + 10);

	deferred.resolve(5);
	assertStrictEquals(await result, 20);
});

Deno.test('Deferred finally execution', async () => {
	const deferred = new Deferred();
	let finallyCalled = false;

	deferred.finally(() => finallyCalled = true);
	deferred.resolve('done');

	await deferred;
	assert(finallyCalled);
});

Deno.test('Deferred synchronous resolution', async () => {
	const deferred = new Deferred<string>();
	deferred.resolve('immediate');

	assertStrictEquals(await deferred, 'immediate');
});

Deno.test('Deferred custom executor', async () => {
	let capturedResolve!: (v: string) => void;
	const deferred = new Deferred<string>((resolve, _) => {
		capturedResolve = resolve;
	});

	capturedResolve('custom');
	assertStrictEquals(await deferred, 'custom');
});

Deno.test('Deferred inheritance check', () => {
	const deferred = new Deferred();
	assert(deferred instanceof Promise);
});
