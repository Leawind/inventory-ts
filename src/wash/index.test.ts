import { Wash } from './index.ts';
import { assertEquals } from '@std/assert';
const wash = Wash.default();

Deno.test('wash', async () => {
	// console.log(wash.getPaths());

	console.log(wash.findExecutableFile('help'));

	wash.stdout = false;
	wash.stderr = false;

	const output = await wash.run('echo', 'hello world');
	console.log('stdout:', output.stdout.utf8);
	console.log('stderr:', output.stderr.utf8);
});

Deno.test('run', async () => {
	const output = await wash.run('echo', 'hey');
	assertEquals(output.stdout.utf8.trim(), 'hey');
});

Deno.test('e', async () => {
	assertEquals((await wash.e`echo "hello"`).stdout.utf8.trim(), 'hello');
});
