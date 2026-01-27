import * as std_path from '@std/path@1';
import { walk } from './walk.ts';
import { exists, existsSync } from './basic.ts';

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

/**
 * Create a file with the given path
 * @param path - The file path to create
 * @param createParent - Whether to create the parent directory of the file
 */
export async function touch(path: string, createParent: boolean = true): Promise<void> {
	if (await exists(path)) return;
	if (createParent) {
		await makeParentDir(path);
	}
	await Deno.writeFile(path, new Uint8Array(), { create: true });
}

/**
 * Synchronously create a file with the given path
 * @param path - The file path to create
 * @param createParent - Whether to create the parent directory of the file
 */
export function touchSync(path: string, createParent: boolean = true): void {
	if (existsSync(path)) return;
	if (createParent) {
		makeParentDirSync(path);
	}
	Deno.writeFileSync(path, new Uint8Array(), { create: true });
}

/**
 * Synchronously remove a file or directory
 * @param path - The path to remove
 * @param recursive - Whether to recursively remove the directory
 */
export function removeSync(path: string, recursive: boolean = true): void {
	Deno.removeSync(path, { recursive });
}

/**
 * Remove a file or directory
 * @param path - The path to remove
 * @param recursive - Whether to recursively remove the directory
 */
export async function remove(path: string, recursive: boolean = true): Promise<void> {
	await Deno.remove(path, { recursive });
}

/**
 * Move a file or directory
 * @param src - The source path
 * @param dest - The destination path
 */
export async function move(src: string, dest: string): Promise<void> {
	// TODO need to create parent dir?
	await makeParentDir(dest);
	await Deno.rename(src, dest);
}

/**
 * Synchronously move a file or directory
 * @param src - The source path
 * @param dest - The destination path
 */
export function moveSync(src: string, dest: string): void {
	// TODO need to create parent dir?
	makeParentDirSync(dest);
	Deno.renameSync(src, dest);
}

/**
 * Copy a file
 * @param src - The source path
 * @param dest - The destination path
 */
export async function copyFile(src: string, dest: string): Promise<void> {
	// TODO need to create parent dir?
	await makeParentDir(dest);
	await Deno.copyFile(src, dest);
}

/**
 * Synchronously copy a file
 * @param src - The source path
 * @param dest - The destination path
 */
export function copyFileSync(src: string, dest: string): void {
	// TODO need to create parent dir?
	makeParentDirSync(dest);
	Deno.copyFileSync(src, dest);
}

/**
 * Copy the structure of a directory
 * @param src - The source directory
 * @param dest - The destination directory
 */
export async function copyDirStructure(src: string, dest: string): Promise<void> {
	for await (const entry of walk(src)) {
		if (entry.dirs.length > 0) {
			continue;
		}

		const destPath = std_path.join(dest, std_path.relative(src, entry.path));
		await mkdir(destPath);
	}
}
