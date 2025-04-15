import { assert, assertStrictEquals } from "@std/assert";
import { Lock } from '@leawind/inventory';

Deno.test('teset', () => {
	const lock = new Lock();

	lock.acquire('Steve');

	assert(lock.isLocked());
	assertStrictEquals(lock.getOwner(), 'Steve');

	lock.release();

	assert(!lock.isLocked());
});
