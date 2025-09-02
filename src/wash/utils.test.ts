import { assertEquals } from '@std/assert/equals';
import { cmd, r } from './utils.ts';

Deno.test('r', () => {
	assertEquals(r`abcd`, 'abcd');
	assertEquals(r`\t\r\n\a\b`, '\\t\\r\\n\\a\\b');
});

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
