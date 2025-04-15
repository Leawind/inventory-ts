import { build, emptyDir } from '@deno/dnt';
import META from '../deno.json' with { type: 'json' };

const OUTPUT_DIR = './npm';

await emptyDir(OUTPUT_DIR);

await build({
	packageManager: 'pnpm',
	importMap: 'deno.json',
	entryPoints: [
		'./src/index.ts',
	],
	outDir: OUTPUT_DIR,
	shims: {
		// deno: true,
		timers: true,
	},
	esModule: true,
	typeCheck: 'both',
	test: false,
	declaration: 'inline',
	declarationMap: false,
	scriptModule: false,
	// `package.json` properties
	package: {
		type: 'module',
		name: META.name,
		version: META.version,
		license: META.license,
		description: '',
		private: false,
		files: [
			"esm",
		],
		publishConfig: {
			access: "public"
		},
	},
	compilerOptions: {
		target: "ES2023",
		lib: ["ES2023"],
		inlineSources: true,
		sourceMap: true,
		strictFunctionTypes: false,
		noImplicitThis: false,
		noImplicitReturns: false,
		noImplicitAny: false,
	},
});

[
	'README.md',
	'LICENSE',
].forEach((file) => Deno.copyFileSync(`./${file}`, `./${OUTPUT_DIR}/${file}`));
