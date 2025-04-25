import { Lock } from '@leawind/inventory/lock';

const lock = new Lock();

await lock.acquire('Steve');

console.log(`Locked:`, lock.isLocked());
console.log(`Owner: `, lock.getOwner());

lock.release();

console.log(`Locked:`, lock.isLocked());

console.log(`Done.`);
