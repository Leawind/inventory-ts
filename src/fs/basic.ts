/**
 * Synchronously check if a path is a file
 * @param path - The path to check
 * @returns true if the path exists and is a file, false otherwise
 */
export function isFileSync(path: string): boolean {
  try {
    return Deno.statSync(path).isFile
  } catch {
    return false
  }
}

/**
 * Check if a path is a file
 * @param path - The path to check
 * @returns true if the path exists and is a file, false otherwise
 */
export async function isFile(path: string): Promise<boolean> {
  try {
    return (await Deno.stat(path)).isFile
  } catch {
    return false
  }
}

/**
 * Synchronously check if a path is a directory
 * @param path - The path to check
 * @returns true if the path exists and is a directory, false otherwise
 */
export function isDirectorySync(path: string): boolean {
  try {
    return Deno.statSync(path).isDirectory
  } catch {
    return false
  }
}

/**
 * Check if a path is a directory
 * @param path - The path to check
 * @returns true if the path exists and is a directory, false otherwise
 */
export async function isDirectory(path: string): Promise<boolean> {
  try {
    return (await Deno.stat(path)).isDirectory
  } catch {
    return false
  }
}

/**
 * Synchronously check if a path is a symbolic link
 * @param path - The path to check
 * @returns true if the path exists and is a symbolic link, false otherwise
 */
export function isSymlinkSync(path: string): boolean {
  try {
    return Deno.lstatSync(path).isSymlink
  } catch {
    return false
  }
}

/**
 * Check if a path is a symbolic link
 * @param path - The path to check
 * @returns true if the path exists and is a symbolic link, false otherwise
 */
export async function isSymlink(path: string): Promise<boolean> {
  try {
    return (await Deno.lstat(path)).isSymlink
  } catch {
    return false
  }
}

/**
 * Synchronously check if a path exists
 * @param path - The path to check
 * @returns true if the path exists, false otherwise
 */
export function existsSync(path: string): boolean {
  try {
    Deno.lstatSync(path)
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
export async function exists(path: string): Promise<boolean> {
  try {
    await Deno.lstat(path)
    return true
  } catch {
    return false
  }
}

export function lstatSync(path: string): Deno.FileInfo {
  return Deno.lstatSync(path)
}

export function lstat(path: string): Promise<Deno.FileInfo> {
  return Deno.lstat(path)
}

/**
 * Get the file info of a path synchronously
 * @param path - The path to get the info of
 * @returns The file info
 */
export function statSync(path: string): Deno.FileInfo {
  return Deno.statSync(path)
}

/**
 * Get the file info of a path
 * @param path - The path to get the info of
 * @returns The file info
 */
export function stat(path: string): Promise<Deno.FileInfo> {
  return Deno.stat(path)
}
