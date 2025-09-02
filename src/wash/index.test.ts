import { assertEquals } from '@std/assert/equals';
import { Wash } from './index.ts';
const wash = Wash.default();

Deno.test('wash', async () => {
	console.log(wash.getPaths());
	console.log(wash.findExecutableFile('help'));

	const output = await wash.run('echo', 'hello world');
	console.log('stdout:', output.stdout.utf8);
	console.log('stderr:', output.stderr.utf8);
});

Deno.test('run', async () => {
	await wash.run('cd', '.');
	const pwd = (await wash.run('pwd')).stdout.utf8.trim();
	assertEquals(pwd, Deno.cwd());
});

Deno.test('e', async () => {
	assertEquals((await wash.e`echo "hello"`).stdout.utf8.trim(), 'hello');
});
