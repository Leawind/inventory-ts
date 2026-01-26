import type { Awaitable } from '@/types.ts';
import { existsSync } from './basic.ts';
import { mkdir, mkdirSync, remove, removeSync, touch, touchSync } from './operate.ts';
import { p } from './utils.ts';

function generateRandomString(): string {
	return Math.random().toString(36).slice(2);
}

/**
 * Options for configuring temporary file or directory creation
 *
 * ```typescript
 * fileName = `${prefix}${randomString}${suffix}`;
 * filePath = fileName; // if parent is not specified
 * filePath = `${parent}/${fileName}`; // if parent is specified
 * ```
 */
export type TempOptions = {
	/** Parent directory where the temporary file/directory will be created. If not specified, uses the system default temporary directory */
	parent?: string;
	/** Prefix string to be added to the generated temporary name */
	prefix: string;
	/** Suffix string to be added to the generated temporary name */
	suffix: string;
	/** Maximum number of attempts to find an unused temporary path */
	maxTries: number;
};

const DEFAULT_OPTIONS: TempOptions = {
	parent: undefined,
	prefix: '',
	suffix: '',
	maxTries: 8,
};

function findTempPath(options: Partial<TempOptions> | undefined, message: string = 'Failed to find temp path'): string {
	const { parent, prefix, suffix, maxTries } = Object.assign({}, DEFAULT_OPTIONS, options);

	let tempPath: string | null = null;
	for (let i = 0; i < maxTries; i++) {
		const randomString = generateRandomString();
		const name = `${prefix}${randomString}${suffix}`;
		const path = parent ? p`${parent}/${name}` : name;
		if (!existsSync(path)) {
			tempPath = path;
			break;
		}
	}

	if (tempPath === null) {
		throw new Error(message);
	}
	return tempPath;
}

/**
 * Creates a temporary directory and passes its path to a callback function.
 * The directory is automatically removed after the callback finishes executing.
 * This synchronous version executes the callback synchronously.
 *
 * @param callback A function that receives the temporary directory path
 * @param options Optional configuration for the temporary path
 *
 * @example
 * ```typescript
 * withTempDirSync((dirPath) => {
 *   console.log(`Temporary directory: ${dirPath}`);
 *   // Perform operations with the directory
 *   // Directory will be removed automatically after this function ends
 * });
 * ```
 *
 * @example Using custom options
 * ```typescript
 * withTempDirSync((dirPath) => {
 *   // Work with the temp directory
 * }, { prefix: 'tmp-' });
 * ```
 */
export function withTempDirSync(callback: (path: string) => void, options?: Partial<TempOptions>): void;
/**
 * Returns a curried function that accepts a callback to work with a temporary directory.
 * The directory is automatically removed after the callback finishes executing.
 *
 * @param options Optional configuration for the temporary path
 * @returns A function that accepts a callback to work with the temporary directory
 *
 * @example
 * ```typescript
 * const withMyTempDir = withTempDirSync({ prefix: 'tmp-' });
 * withMyTempDir((dirPath) => {
 *   // Work with the temp directory
 * });
 * ```
 */
export function withTempDirSync(options?: Partial<TempOptions>): (callback: (path: string) => void) => void;
export function withTempDirSync(
	...args:
		| [callback: (path: string) => void, options?: Partial<TempOptions>]
		| [options?: Partial<TempOptions>]
) {
	function inner(callback: (path: string) => void, options?: Partial<TempOptions>) {
		const path = findTempPath(options, 'Failed to create temp dir');
		mkdirSync(path);
		try {
			callback(path);
		} finally {
			removeSync(path);
		}
	}

	if (typeof args[0] === 'function') {
		const [callback, options] = args;
		return inner(callback, options);
	} else {
		const options = args[0];
		return (callback: (path: string) => void) => inner(callback, options);
	}
}

/**
 * Asynchronously creates a temporary directory and passes its path to a callback function.
 * The directory is automatically removed after the callback finishes executing.
 * This asynchronous version awaits the callback function.
 *
 * @param callback A function that receives the temporary directory path (can return a Promise)
 * @param options Optional configuration for the temporary path
 *
 * @example
 * ```typescript
 * await withTempDir(async (dirPath) => {
 *   console.log(`Temporary directory: ${dirPath}`);
 *   await someAsyncOperation(dirPath);
 *   // Directory will be removed automatically after this function ends
 * });
 * ```
 *
 * @example Using custom options
 * ```typescript
 * await withTempDir(async (dirPath) => {
 *   // Work with the temp directory
 * }, { prefix: 'myapp-', suffix: '-tmp' });
 * ```
 */
export function withTempDir(callback: (path: string) => Awaitable<void>, options?: Partial<TempOptions>): Promise<void>;
/**
 * Returns a curried function that accepts a callback to work with a temporary directory.
 * The directory is automatically removed after the callback finishes executing.
 *
 * @param options Optional configuration for the temporary path
 * @returns A function that accepts a callback to work with the temporary directory (asynchronously)
 *
 * @example
 * ```typescript
 * const withMyTempDir = withTempDir({ prefix: 'my-' });
 * await withMyTempDir(async (dirPath) => {
 *   // Work with the temp directory
 * });
 * ```
 */
export function withTempDir(
	options?: Partial<TempOptions>,
): (callback: (path: string) => Awaitable<void>) => Promise<void>;
export function withTempDir(
	...args:
		| [callback: (path: string) => Awaitable<void>, options?: Partial<TempOptions>]
		| [options?: Partial<TempOptions>]
) {
	async function inner(callback: (path: string) => Awaitable<void>, options?: Partial<TempOptions>) {
		const path = findTempPath(options, 'Failed to create temp dir');
		await mkdir(path);
		try {
			await callback(path);
		} finally {
			await remove(path);
		}
	}

	if (typeof args[0] === 'function') {
		const [callback, options] = args;
		return inner(callback, options);
	} else {
		const options = args[0];
		return (callback: (path: string) => Awaitable<void>) => inner(callback, options);
	}
}

/**
 * Creates a temporary file and passes its path to a callback function.
 * The file is automatically removed after the callback finishes executing.
 * This synchronous version executes the callback synchronously.
 *
 * @param callback A function that receives the temporary file path
 * @param options Optional configuration for the temporary path
 *
 * @example
 * ```typescript
 * withTempFileSync((filePath) => {
 *   console.log(`Temporary file: ${filePath}`);
 *   // Perform operations with the file
 *   // File will be removed automatically after this function ends
 * });
 * ```
 *
 * @example Using custom options
 * ```typescript
 * withTempFileSync((filePath) => {
 *   // Work with the temp file
 * }, { prefix: 'myapp-', suffix: '.tmp' });
 * ```
 */
export function withTempFileSync(callback: (path: string) => void, options?: Partial<TempOptions>): void;
/**
 * Returns a curried function that accepts a callback to work with a temporary file.
 * The file is automatically removed after the callback finishes executing.
 *
 * @param options Optional configuration for the temporary path
 * @returns A function that accepts a callback to work with the temporary file
 *
 * @example
 * ```typescript
 * const withMyTempFile = withTempFileSync({ prefix: 'my-', suffix: '.log' });
 * withMyTempFile((filePath) => {
 *   // Work with the temp file
 * });
 * ```
 */
export function withTempFileSync(options?: Partial<TempOptions>): (callback: (path: string) => void) => void;
export function withTempFileSync(
	...args:
		| [callback: (path: string) => void, options?: Partial<TempOptions>]
		| [options?: Partial<TempOptions>]
) {
	function inner(callback: (path: string) => void, options?: Partial<TempOptions>) {
		const path = findTempPath(options, 'Failed to create temp file');
		touchSync(path);
		try {
			callback(path);
		} finally {
			removeSync(path);
		}
	}

	if (typeof args[0] === 'function') {
		const [callback, options] = args;
		return inner(callback, options);
	} else {
		const options = args[0];
		return (callback: (path: string) => void) => inner(callback, options);
	}
}

/**
 * Asynchronously creates a temporary file and passes its path to a callback function.
 * The file is automatically removed after the callback finishes executing.
 * This asynchronous version awaits the callback function.
 *
 * @param callback A function that receives the temporary file path (can return a Promise)
 * @param options Optional configuration for the temporary path
 *
 * @example
 * ```typescript
 * await withTempFile(async (filePath) => {
 *   console.log(`Temporary file: ${filePath}`);
 *   await writeFile(filePath, 'some content');
 *   // File will be removed automatically after this function ends
 * });
 * ```
 *
 * @example Using custom options
 * ```typescript
 * await withTempFile(async (filePath) => {
 *   // Work with the temp file
 * }, { prefix: 'myapp-', suffix: '.tmp' });
 * ```
 */
export function withTempFile(
	callback: (path: string) => Awaitable<void>,
	options?: Partial<TempOptions>,
): Promise<void>;
/**
 * Returns a curried function that accepts a callback to work with a temporary file.
 * The file is automatically removed after the callback finishes executing.
 *
 * @param options Optional configuration for the temporary path
 * @returns A function that accepts a callback to work with the temporary file (asynchronously)
 *
 * @example
 * ```typescript
 * const withMyTempFile = withTempFile({ prefix: 'my-', suffix: '.log' });
 * await withMyTempFile(async (filePath) => {
 *   // Work with the temp file
 * });
 * ```
 */
export function withTempFile(
	options?: Partial<TempOptions>,
): (callback: (path: string) => Awaitable<void>) => Promise<void>;
export function withTempFile(
	...args:
		| [callback: (path: string) => Awaitable<void>, options?: Partial<TempOptions>]
		| [options?: Partial<TempOptions>]
) {
	async function inner(callback: (path: string) => Awaitable<void>, options?: Partial<TempOptions>) {
		const path = findTempPath(options, 'Failed to create temp file');
		await touch(path);
		try {
			await callback(path);
		} finally {
			await remove(path);
		}
	}

	if (typeof args[0] === 'function') {
		const [callback, options] = args;
		return inner(callback, options);
	} else {
		const options = args[0];
		return (callback: (path: string) => Awaitable<void>) => inner(callback, options);
	}
}
