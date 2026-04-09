import { Path, type PathLike } from './path.ts'

/**
 * Synchronously check if a path is a file
 * @param path - The path to check
 * @returns true if the path exists and is a file, false otherwise
 */
export function isFileSync(path: PathLike): boolean {
  try {
    return Deno.statSync(Path.str(path)).isFile
  } catch {
    return false
  }
}

/**
 * Check if a path is a file
 * @param path - The path to check
 * @returns true if the path exists and is a file, false otherwise
 */
export async function isFile(path: PathLike): Promise<boolean> {
  try {
    return (await Deno.stat(Path.str(path))).isFile
  } catch {
    return false
  }
}

/**
 * Synchronously check if a path is a directory
 * @param path - The path to check
 * @returns true if the path exists and is a directory, false otherwise
 */
export function isDirectorySync(path: PathLike): boolean {
  try {
    return Deno.statSync(Path.str(path)).isDirectory
  } catch {
    return false
  }
}

/**
 * Check if a path is a directory
 * @param path - The path to check
 * @returns true if the path exists and is a directory, false otherwise
 */
export async function isDirectory(path: PathLike): Promise<boolean> {
  try {
    return (await Deno.stat(Path.str(path))).isDirectory
  } catch {
    return false
  }
}

/**
 * Synchronously check if a path is a symbolic link
 * @param path - The path to check
 * @returns true if the path exists and is a symbolic link, false otherwise
 */
export function isSymlinkSync(path: PathLike): boolean {
  try {
    return Deno.lstatSync(Path.str(path)).isSymlink
  } catch {
    return false
  }
}

/**
 * Check if a path is a symbolic link
 * @param path - The path to check
 * @returns true if the path exists and is a symbolic link, false otherwise
 */
export async function isSymlink(path: PathLike): Promise<boolean> {
  try {
    return (await Deno.lstat(Path.str(path))).isSymlink
  } catch {
    return false
  }
}

/**
 * Synchronously check if a path exists
 * @param path - The path to check
 * @returns true if the path exists, false otherwise
 */
export function existsSync(path: PathLike): boolean {
  try {
    Deno.lstatSync(Path.str(path))
    return true
  } catch {
    return false
  }
}

/**
 * Check if a path exists
 * @param path - The path to check
 * @returns true if the path exists, false otherwise
 */
export async function exists(path: PathLike): Promise<boolean> {
  try {
    await Deno.lstat(Path.str(path))
    return true
  } catch {
    return false
  }
}

export function lstatSync(path: PathLike): Deno.FileInfo {
  return Deno.lstatSync(Path.str(path))
}

export function lstat(path: PathLike): Promise<Deno.FileInfo> {
  return Deno.lstat(Path.str(path))
}

/**
 * Get the file info of a path synchronously
 * @param path - The path to get the info of
 * @returns The file info
 */
export function statSync(path: PathLike): Deno.FileInfo {
  return Deno.statSync(Path.str(path))
}

/**
 * Get the file info of a path
 * @param path - The path to get the info of
 * @returns The file info
 */
export function stat(path: PathLike): Promise<Deno.FileInfo> {
  return Deno.stat(Path.str(path))
}
