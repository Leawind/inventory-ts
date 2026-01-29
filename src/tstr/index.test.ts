import { assertEquals } from '@std/assert';
import { interleave, p, r } from './index.ts';
import * as std_path from '@std/path';

Deno.test('xjoin', () => {
	assertEquals(interleave([], []), []);
	assertEquals(interleave([], ['a']), ['a']);
	assertEquals(interleave(['a'], []), ['a']);

	assertEquals(interleave('abcd'.split(''), '123'.split('')).join(''), 'a1b2c3d');
	assertEquals(interleave('abcd'.split(''), '1234'.split('')).join(''), 'a1b2c3d4');
	assertEquals(interleave('abc'.split(''), '12345'.split('')).join(''), 'a1b2c345');
	assertEquals(interleave('abcde'.split(''), '123'.split('')).join(''), 'a1b2c3de');
});

Deno.test('r', () => {
	assertEquals(r``, '');
	assertEquals(r`${''}`, '');
	assertEquals(r`${1}`, '1');

	assertEquals(r`abcd`, 'abcd');
	assertEquals(r`C:\Windows\System32`, 'C:\\Windows\\System32');
	assertEquals(r`\t\r\n\a\b`, '\\t\\r\\n\\a\\b');

	assertEquals(r`ab${12}${'cd'}`, 'ab12cd');
	assertEquals(r`\${a}\${b}`, '\\${a}\\${b}');
});

Deno.test('p', () => {
	assertEquals(p``, '.');
	assertEquals(p`.`, '.');
	assertEquals(p`..`, '..');

	assertEquals(p`abc/def`, std_path.join('abc', 'def'));
	assertEquals(p`abc/def${'123'}`, std_path.join('abc', 'def123'));
	assertEquals(p`abc/def${'123'}/..`, std_path.join('abc'));
	assertEquals(p`abc////def`, std_path.join('abc', 'def'));
	assertEquals(p`abc////def///`, std_path.join('abc', 'def/'));
});
