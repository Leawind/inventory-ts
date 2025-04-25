import { assert, assertAlmostEquals, assertStrictEquals } from "@std/assert";
import { Lock } from "@leawind/inventory/lock";
import { TimeRuler } from "@leawind/inventory/test_utils";

Deno.test("test lock", () => {
  const lock = new Lock();

  lock.acquire("Steve");

  assert(lock.isLocked());
  assertStrictEquals(lock.getOwner(), "Steve");

  lock.release();

  assert(!lock.isLocked());
});

Deno.test("test test_utils", async () => {
  const t = new TimeRuler(0);
  await t.til(50);
  assertAlmostEquals(t.now(), 50, 20);
});
