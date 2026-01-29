import { assertEquals } from '@std/assert';
import { cmd } from './utils.ts';

Deno.test('cmd', () => {
	assertEquals(cmd``, []);
	assertEquals(cmd`""`, ['']);
	assertEquals(cmd`"" ""`, ['', '']);

	assertEquals(cmd`abcd`, ['abcd']);
	assertEquals(cmd`echo "hello"`, ['echo', 'hello']);
	assertEquals(cmd`hey "you" -f`, ['hey', 'you', '-f']);
	assertEquals(cmd`hey "I said \"yes\"" -f`, ['hey', 'I said "yes"', '-f']);
	assertEquals(cmd`a "" b "" c`, ['a', '', 'b', '', 'c']);
});
