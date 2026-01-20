import * as std_path from '@std/path@1';
import { p } from './utils.ts';

type WalkItem = {
	path: string;
	files: string[];
	dirs: string[];
	symlinks: string[];
};

/**
 * Walk through a directory tree and yield information about each directory
 * @param dirPath - The root directory path to walk
 * @param depth - The maximum depth to traverse (default: Infinity)
 * @returns An async iterable that yields WalkItem objects containing path and file/directory information
 */
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
 * Walk through a directory tree and yield file paths that match the filter
 * @param root - The root directory path to walk
 * @param filter - A RegExp or function to filter files (default: all files)
 * @param depth - The maximum depth to traverse (default: Infinity)
 * @returns An async iterable that yields file paths matching the filter
 *
 * ### Example
 *
 * ```ts
 * // Get all .ts files recursively
 * for await (const file of walkFile(".", /\.ts$/)) {
 *   console.log(file);
 * }
 *
 * // Get all files in current directory only (depth=1)
 * for await (const file of walkFile(".", () => true, 1)) {
 *   console.log(file);
 * }
 * ```
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
