import * as std_path from '@std/path@1';
import { r } from '@/tstr/index.ts';

/**
 * Path string template
 *
 * ### Example
 *
 * ```ts
 * p`C:\Windows\System32`;      // 'C:\\Windows\\System32'
 * p`C:\\Windows\\System32`;    // 'C:\\Windows\\System32'
 * ```
 */
export function p(strs: TemplateStringsArray, ...args: unknown[]): string {
	return std_path.normalize(r(strs, ...args));
}

export function isFileSync(path: string): boolean {
	try {
		return Deno.statSync(path).isFile;
	} catch {
		return false;
	}
}

export async function isFile(path: string): Promise<boolean> {
	try {
		return (await Deno.stat(path)).isFile;
	} catch {
		return false;
	}
}

export function isDirectorySync(path: string): boolean {
	try {
		return Deno.statSync(path).isDirectory;
	} catch {
		return false;
	}
}

export async function isDirectory(path: string): Promise<boolean> {
	try {
		return (await Deno.stat(path)).isDirectory;
	} catch {
		return false;
	}
}

export function isSymlinkSync(path: string): boolean {
	try {
		return Deno.statSync(path).isSymlink;
	} catch {
		return false;
	}
}

export async function isSymlink(path: string): Promise<boolean> {
	try {
		return (await Deno.stat(path)).isSymlink;
	} catch {
		return false;
	}
}

export function existsSync(path: string): boolean {
	try {
		Deno.statSync(path);
		return true;
	} catch {
		return false;
	}
}

export async function exists(path: string): Promise<boolean> {
	try {
		await Deno.stat(path);
		return true;
	} catch {
		return false;
	}
}

export function mkdirSync(path: string): void {
	Deno.mkdirSync(path, { recursive: true });
}

export async function mkdir(path: string): Promise<void> {
	await Deno.mkdir(path, { recursive: true });
}

export function makeParentDirSync(path: string): void {
	Deno.mkdirSync(std_path.dirname(path), { recursive: true });
}

export async function makeParentDir(path: string): Promise<void> {
	await Deno.mkdir(std_path.dirname(path), { recursive: true });
}

type WalkItem = {
	path: string;
	files: string[];
	dirs: string[];
	symlinks: string[];
};
export async function* walk(dirPath: string, depth: number = Infinity): AsyncIterable<WalkItem> {
	const files: string[] = [];
	const dirs: string[] = [];
	const symlinks: string[] = [];

	for await (const entry of Deno.readDir(dirPath)) {
		if (entry.isFile) {
			files.push(entry.name);
		} else if (entry.isDirectory) {
			dirs.push(entry.name);
		} else if (entry.isSymlink) {
			symlinks.push(entry.name);
		}
	}

	yield { path: dirPath, files, dirs, symlinks };
	for (const subdir of dirs) {
		const subdirPath = std_path.join(dirPath, subdir);
		for await (const x of walk(subdirPath, depth - 1)) {
			yield x;
		}
	}
}

/**
 * Walk files in a directory
 */
export async function* walkFile(
	root: string,
	filter: RegExp | ((path: string) => boolean) = () => true,
	depth: number = Infinity,
): AsyncIterable<string> {
	if (filter instanceof RegExp) {
		filter = (path) => (filter as RegExp).test(path);
	}

	for await (const { path, files } of walk(root, depth)) {
		for (const file of files) {
			const filePath = p`${path}/${file}`;
			if (filter(filePath)) {
				yield filePath;
			}
		}
	}
}
