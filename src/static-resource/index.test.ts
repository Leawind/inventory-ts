import { StaticResourceManager } from '@/static-resource/index.ts';
import { assertStrictEquals } from '@std/assert/strict-equals';

Deno.test('Test static resource', async () => {
	const srm = new StaticResourceManager('../../test/static_resource');

	assertStrictEquals(await srm.fetch('readme.md'), 'hello\n');

	const steveData = await srm.fetch('data.json');
	assertStrictEquals(steveData.name, 'Steve');
});
