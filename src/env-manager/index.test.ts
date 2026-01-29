import { assertEquals } from '@std/assert';
import { EnvManager } from './index.ts';

Deno.test('EnvManager caseSensitive', () => {
	const em = EnvManager.caseSensitive();

	em.set('a', '1');
	em.set('A', '3');
	em.set('b', '2');

	assertEquals(em.get('a'), '1');
	assertEquals(em.get('A'), '3');
	assertEquals(em.get('b'), '2');
	assertEquals(em.get('c'), '');
});

Deno.test('EnvManager caseInsensitive', () => {
	const em = EnvManager.caseInsensitive();

	em.set('a', '1');
	em.set('A', '3');
	em.set('b', '2');

	assertEquals(em.get('a'), '3');
	assertEquals(em.get('A'), '3');
	assertEquals(em.get('b'), '2');
	assertEquals(em.get('c'), '');
});

Deno.test('EnvManager parse', () => {
	const em = EnvManager.caseInsensitive();

	em.set('name', 'Steve');
	em.set('greet', em.expand('Hello, $NAME'));

	assertEquals(em.expand('$NAME'), 'Steve');
	assertEquals(em.expand('${NAME}'), 'Steve');
	assertEquals(em.expand('%NAME%'), 'Steve');
	assertEquals(em.get('greet'), 'Hello, Steve');
});
