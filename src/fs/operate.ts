import * as std_path from '@std/path@1';
import { walk } from './walk.ts';

/**
 * Synchronously create a directory recursively
 * @param path - The directory path to create
 */
export function mkdirSync(path: string): void {
	Deno.mkdirSync(path, { recursive: true });
}

/**
 * Create a directory recursively
 * @param path - The directory path to create
 */
export async function mkdir(path: string): Promise<void> {
	await Deno.mkdir(path, { recursive: true });
}

/**
 * Synchronously create the parent directory of a file path
 * @param path - The file path whose parent directory should be created
 */
export function makeParentDirSync(path: string): void {
	Deno.mkdirSync(std_path.dirname(path), { recursive: true });
}

/**
 * Create the parent directory of a file path
 * @param path - The file path whose parent directory should be created
 */
export async function makeParentDir(path: string): Promise<void> {
	await Deno.mkdir(std_path.dirname(path), { recursive: true });
}

export async function copyDirStructure(src: string, dest: string): Promise<void> {
	for await (const entry of walk(src)) {
		if (entry.dirs.length > 0) {
			continue;
		}

		const destPath = std_path.join(dest, std_path.relative(src, entry.path));
		await mkdir(destPath);
	}
}
