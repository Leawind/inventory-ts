import { Lock } from '@leawind/inventory';

const lock = new Lock();

lock.acquire('Steve');

console.log(`Locked:`, lock.isLocked());
console.log(`Owner: `, lock.getOwner());

lock.release();

console.log(`Locked:`, lock.isLocked());

console.log(`Done.`);
