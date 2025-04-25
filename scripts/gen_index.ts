import * as fs from '@std/fs';

type ExportItem = {
	id: string;
	export: string;
	import: string;
};

function normalizeName(name: string) {
	return name.replace(/[^a-zA-Z0-9_$]/g, '_');
}

function writeIfDifferentSync(path: string, content: string) {
	if (fs.existsSync(path)) {
		const existing = Deno.readTextFileSync(path);
		if (existing === content) {
			return;
		}
		Deno.writeTextFileSync(path, content);
	}
}

const items: ExportItem[] = [];

Deno.readDirSync('./src')
	.forEach((entry) => {
		if (entry.isFile) {
			if (
				!entry.name.endsWith('.ts') ||
				entry.name === 'index.ts' ||
				entry.name === 'mod.ts'
			) {
				return;
			}

			const name = entry.name.replace(/\.ts$/, '');

			items.push({
				id: normalizeName(name),
				import: `@/${entry.name}`,
				export: `./src/${entry.name}`,
			});
		} else if (entry.isDirectory) {
			const name = entry.name;

			const hasIndex = fs.existsSync(`./src/${name}/index.ts`);
			const hasMod = fs.existsSync(`./src/${name}/mod.ts`);

			if (hasIndex && hasMod) {
				throw new Error(`Both 'index.ts' and 'mod.ts' exist in '${name}'`);
			}

			const main = hasIndex ? 'index' : 'mod';

			items.push({
				id: normalizeName(name),
				import: `@/${name}/${main}.ts`,
				export: `./src/${name}/${main}.ts`,
			});
		}
	});

items.sort((a, b) => a.id.localeCompare(b.id));

{
	// Write index.ts
	const lines: string[] = items.map((item) => `export * as ${item.id} from '${item.import}';`);
	writeIfDifferentSync('./src/index.ts', lines.join('\n') + '\n');
}

{
	// Write deno.json
	const manifest = JSON.parse(Deno.readTextFileSync('./deno.json'));

	manifest.exports = items.reduce<Record<string, string>>((exports, item) => {
		exports[`./${item.id}`] = item.export;
		return exports;
	}, {});

	manifest.exports['.'] = './src/index.ts';
	writeIfDifferentSync('./deno.json', JSON.stringify(manifest, null, '\t') + '\n');
}
