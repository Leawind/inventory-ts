import * as std_path from '@std/path'
import { walk } from './walk.ts'
import { exists, existsSync } from './basic.ts'
import { Path, type PathLike } from './path.ts'

/**
 * Synchronously create a directory recursively
 * @param path - The directory path to create
 */
export function mkdirSync(path: PathLike): void {
  Deno.mkdirSync(Path.str(path), { recursive: true })
}

/**
 * Create a directory recursively
 * @param path - The directory path to create
 */
export async function mkdir(path: PathLike): Promise<void> {
  await Deno.mkdir(Path.str(path), { recursive: true })
}

/**
 * Synchronously create the parent directory of a file path
 * @param path - The file path whose parent directory should be created
 */
export function makeParentDirSync(path: PathLike): void {
  Deno.mkdirSync(std_path.dirname(Path.str(path)), { recursive: true })
}

/**
 * Create the parent directory of a file path
 * @param path - The file path whose parent directory should be created
 */
export async function makeParentDir(path: PathLike): Promise<void> {
  await Deno.mkdir(std_path.dirname(Path.str(path)), { recursive: true })
}

/**
 * Create a file with the given path
 * @param path - The file path to create
 * @param createParent - Whether to create the parent directory of the file
 */
export async function touch(path: PathLike, createParent: boolean = true): Promise<void> {
  if (await exists(path)) { return }
  if (createParent) {
    await makeParentDir(path)
  }
  await Deno.writeFile(Path.str(path), new Uint8Array(), { create: true })
}

/**
 * Synchronously create a file with the given path
 * @param path - The file path to create
 * @param createParent - Whether to create the parent directory of the file
 */
export function touchSync(path: PathLike, createParent: boolean = true): void {
  if (existsSync(path)) { return }
  if (createParent) {
    makeParentDirSync(path)
  }
  Deno.writeFileSync(Path.str(path), new Uint8Array(), { create: true })
}

/**
 * Synchronously remove a file or directory
 * @param path - The path to remove
 * @param recursive - Whether to recursively remove the directory
 */
export function removeSync(path: PathLike, recursive: boolean = true): void {
  Deno.removeSync(Path.str(path), { recursive })
}

/**
 * Remove a file or directory
 * @param path - The path to remove
 * @param recursive - Whether to recursively remove the directory
 */
export async function remove(path: PathLike, recursive: boolean = true): Promise<void> {
  await Deno.remove(Path.str(path), { recursive })
}

/**
 * Move a file or directory
 * @param src - The source path
 * @param dest - The destination path
 */
export async function move(src: PathLike, dest: PathLike): Promise<void> {
  // TODO need to create parent dir?
  await makeParentDir(dest)
  await Deno.rename(Path.str(src), Path.str(dest))
}

/**
 * Synchronously move a file or directory
 * @param src - The source path
 * @param dest - The destination path
 */
export function moveSync(src: PathLike, dest: PathLike): void {
  makeParentDirSync(dest)
  Deno.renameSync(Path.str(src), Path.str(dest))
}

/**
 * Copy a file
 * @param src - The source path
 * @param dest - The destination path
 */
export async function copyFile(src: PathLike, dest: PathLike): Promise<void> {
  // TODO need to create parent dir?
  await makeParentDir(dest)
  await Deno.copyFile(Path.str(src), Path.str(dest))
}

/**
 * Synchronously copy a file
 * @param src - The source path
 * @param dest - The destination path
 */
export function copyFileSync(src: PathLike, dest: PathLike): void {
  // TODO need to create parent dir?
  makeParentDirSync(dest)
  Deno.copyFileSync(Path.str(src), Path.str(dest))
}

/**
 * Copy the structure of a directory
 * @param src - The source directory
 * @param dest - The destination directory
 */
export async function copyDirStructure(src: PathLike, dest: PathLike): Promise<void> {
  for await (const entry of walk(Path.str(src))) {
    await mkdir(std_path.dirname(std_path.join(Path.str(dest), std_path.relative(Path.str(src), entry.path))))
  }
}

export type DirectoryStructure = {
  [key: string]: DirectoryStructure | string
}
export function makeDirectoryStructure(directory: PathLike, structure: DirectoryStructure): void {
  for (const key in structure) {
    const item = structure[key]
    if (typeof item === 'string') {
      Deno.writeFileSync(std_path.join(Path.str(directory), key), new TextEncoder().encode(item))
    } else {
      mkdirSync(std_path.join(Path.str(directory), key))
      makeDirectoryStructure(std_path.join(Path.str(directory), key), item)
    }
  }
}

export async function link(src: PathLike, dest: PathLike): Promise<void> {
  await Deno.link(Path.str(src), Path.str(dest))
}

export function linkSync(src: PathLike, dest: PathLike): void {
  Deno.linkSync(Path.str(src), Path.str(dest))
}

export async function symlink(src: PathLike, dest: PathLike): Promise<void> {
  await Deno.symlink(Path.str(src), Path.str(dest))
}

export function symlinkSync(src: PathLike, dest: PathLike): void {
  Deno.symlinkSync(Path.str(src), Path.str(dest))
}
