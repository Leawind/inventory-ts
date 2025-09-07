import * as fs from '@std/fs';
import { p } from 'jsr:@leawind/inventory@0.12.0/tstr';

type ExportedItem = {
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

const exporteds: ExportedItem[] = [];

Deno.readDirSync(p`./src`)
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

			exporteds.push({
				id: normalizeName(name),
				import: `@/${entry.name}`,
				export: `./src/${entry.name}`,
			});
		} else if (entry.isDirectory) {
			const name = entry.name;

			if (name === 'bin') {
				return;
			}

			const hasIndex = fs.existsSync(`./src/${name}/index.ts`);
			const hasMod = fs.existsSync(`./src/${name}/mod.ts`);

			if (hasIndex && hasMod) {
				throw new Error(`Both 'index.ts' and 'mod.ts' exist in '${name}'`);
			}

			const main = hasIndex ? 'index' : 'mod';

			exporteds.push({
				id: normalizeName(name),
				import: `@/${name}/${main}.ts`,
				export: `./src/${name}/${main}.ts`,
			});
		}
	});

exporteds.sort((a, b) => a.id.localeCompare(b.id));

{
	// Write index.ts
	const lines: string[] = exporteds.map((item) => `export * as ${item.id} from '${item.import}';`);
	writeIfDifferentSync('./src/index.ts', lines.join('\n') + '\n');
}

{
	// Write deno.json
	const manifest = JSON.parse(Deno.readTextFileSync(p`./deno.json`));

	manifest.exports = exporteds.reduce<Record<string, string>>((exports, item) => {
		exports[`./${item.id}`] = item.export;
		return exports;
	}, {});

	manifest.exports['.'] = './src/index.ts';
	writeIfDifferentSync(p`./deno.json`, JSON.stringify(manifest, null, '\t') + '\n');
}
