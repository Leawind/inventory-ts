/**
 * Synchronously check if a path is a file
 * @param path - The path to check
 * @returns true if the path exists and is a file, false otherwise
 */
export function isFileSync(path: string): boolean {
	try {
		return Deno.statSync(path).isFile;
	} catch {
		return false;
	}
}

/**
 * Check if a path is a file
 * @param path - The path to check
 * @returns true if the path exists and is a file, false otherwise
 */
export async function isFile(path: string): Promise<boolean> {
	try {
		return (await Deno.stat(path)).isFile;
	} catch {
		return false;
	}
}

/**
 * Synchronously check if a path is a directory
 * @param path - The path to check
 * @returns true if the path exists and is a directory, false otherwise
 */
export function isDirectorySync(path: string): boolean {
	try {
		return Deno.statSync(path).isDirectory;
	} catch {
		return false;
	}
}

/**
 * Check if a path is a directory
 * @param path - The path to check
 * @returns true if the path exists and is a directory, false otherwise
 */
export async function isDirectory(path: string): Promise<boolean> {
	try {
		return (await Deno.stat(path)).isDirectory;
	} catch {
		return false;
	}
}

/**
 * Synchronously check if a path is a symbolic link
 * @param path - The path to check
 * @returns true if the path exists and is a symbolic link, false otherwise
 */
export function isSymlinkSync(path: string): boolean {
	try {
		return Deno.statSync(path).isSymlink;
	} catch {
		return false;
	}
}

/**
 * Check if a path is a symbolic link
 * @param path - The path to check
 * @returns true if the path exists and is a symbolic link, false otherwise
 */
export async function isSymlink(path: string): Promise<boolean> {
	try {
		return (await Deno.stat(path)).isSymlink;
	} catch {
		return false;
	}
}

/**
 * Synchronously check if a path exists
 * @param path - The path to check
 * @returns true if the path exists, false otherwise
 */
export function existsSync(path: string): boolean {
	try {
		Deno.statSync(path);
		return true;
	} catch {
		return false;
	}
}

/**
 * Check if a path exists
 * @param path - The path to check
 * @returns true if the path exists, false otherwise
 */
export async function exists(path: string): Promise<boolean> {
	try {
		await Deno.stat(path);
		return true;
	} catch {
		return false;
	}
}
