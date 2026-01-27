import * as std_path from '@std/path@1';
import type { Constructor } from '@/types.ts';
import * as fs_basic from './basic.ts';
import * as fs_operate from './operate.ts';

export type PathLike = string | Path;
export type CollapsedPath = VoidPath | DirPath | FilePath | SymlinkPath;
export type PathType = Constructor<CollapsedPath>;

/**
 * Represents a filesystem path and provides utilities for path manipulation and type checking.
 *
 * It provides methods for:
 *
 * 1. Path manipulation: joining paths, getting parent directories, resolving relative/absolute paths
 * 2. Path introspection: checking if a path is absolute/relative, getting basename/extension
 * 3. Type determination: identifying whether a path represents a file, directory, symlink, or void location
 * 4. Conversion to specialized path types: VoidPath, FilePath, DirPath, SymlinkPath
 *
 * The class follows a factory pattern with static methods for creating typed path instances,
 * and provides both synchronous and asynchronous APIs for filesystem operations.
 *
 * @example
 * ```ts
 * // Basic usage
 * const path = new Path("/some/path");
 *
 * // Path manipulation
 * const childPath = path.join("subdir", "file.txt");
 * const parentPath = path.getParent();
 *
 * // Type checking and conversion
 * const filePath = await Path.file("/path/to/existing/file.txt");
 * const dirPath = Path.dirSync("/path/to/existing/directory");
 * ```
 */
export class Path {
	/**
	 * Creates a Path instance from a path string or returns the path if it's already a Path instance.
	 *
	 * @param path A path string or Path instance
	 * @returns A Path instance
	 *
	 * @example
	 * ```ts
	 * const path1 = Path.from("/home/user/documents");
	 * const path2 = Path.from(path1); // Returns path1 itself
	 * ```
	 */
	public static from(path: PathLike): Path {
		return path instanceof Path ? path : new Path(path);
	}

	/**
	 * Creates an VoidPath instance synchronously.
	 *
	 * @param path A path string or Path instance
	 * @returns An VoidPath instance
	 *
	 * @example
	 * ```ts
	 * const voidPath = Path.voidSync("/path/to/void/location");
	 * ```
	 */
	public static voidSync(path: PathLike): VoidPath {
		return Path.from(path).asSync(VoidPath);
	}

	/**
	 * Creates a FilePath instance synchronously.
	 *
	 * @param path A path string or Path instance
	 * @returns A FilePath instance
	 *
	 * @example
	 * ```ts
	 * const filePath = Path.fileSync("/path/to/file.txt");
	 * ```
	 */
	public static fileSync(path: PathLike): FilePath {
		return Path.from(path).asSync(FilePath);
	}

	/**
	 * Creates a DirPath instance synchronously.
	 *
	 * @param path A path string or Path instance
	 * @returns A DirPath instance
	 *
	 * @example
	 * ```ts
	 * const dirPath = Path.dirSync("/path/to/directory");
	 * ```
	 */
	public static dirSync(path: PathLike): DirPath {
		return Path.from(path).asSync(DirPath);
	}

	/**
	 * Creates a SymlinkPath instance synchronously.
	 *
	 * @param path A path string or Path instance
	 * @returns A SymlinkPath instance
	 *
	 * @example
	 * ```ts
	 * const symlinkPath = Path.symlinkSync("/path/to/symlink");
	 * ```
	 */
	public static symlinkSync(path: PathLike): SymlinkPath {
		return Path.from(path).asSync(SymlinkPath);
	}

	/**
	 * Creates an VoidPath instance asynchronously.
	 *
	 * @param path A path string or Path instance
	 * @returns A promise that resolves to an VoidPath instance
	 *
	 * @example
	 * ```ts
	 * const voidPath = await Path.void("/path/to/void/location");
	 * ```
	 */
	public static void(path: PathLike): Promise<VoidPath> {
		return Path.from(path).as(VoidPath);
	}

	/**
	 * Creates a FilePath instance asynchronously.
	 *
	 * @param path A path string or Path instance
	 * @returns A promise that resolves to a FilePath instance
	 *
	 * @example
	 * ```ts
	 * const filePath = await Path.file("/path/to/file.txt");
	 * ```
	 */
	public static file(path: PathLike): Promise<FilePath> {
		return Path.from(path).as(FilePath);
	}

	/**
	 * Creates a DirPath instance asynchronously.
	 *
	 * @param path A path string or Path instance
	 * @returns A promise that resolves to a DirPath instance
	 *
	 * @example
	 * ```ts
	 * const dirPath = await Path.dir("/path/to/directory");
	 * ```
	 */
	public static dir(path: PathLike): Promise<DirPath> {
		return Path.from(path).as(DirPath);
	}

	/**
	 * Creates a SymlinkPath instance asynchronously.
	 *
	 * @param path A path string or Path instance
	 * @returns A promise that resolves to a SymlinkPath instance
	 *
	 * @example
	 * ```ts
	 * const symlinkPath = await Path.symlink("/path/to/symlink");
	 * ```
	 */
	public static symlink(path: PathLike): Promise<SymlinkPath> {
		return Path.from(path).as(SymlinkPath);
	}

	/**
	 * Returns the string representation of the path.
	 *
	 * @param path A path string or Path instance
	 * @returns The string representation of the path
	 *
	 * @example
	 * ```ts
	 * const pathStr = Path.str("/path/to/file.txt"); // Returns "/path/to/file.txt"
	 * ```
	 */
	public static str(path: PathLike): string {
		return Path.from(path).path;
	}

	/**
	 * Creates a Path instance representing the current working directory.
	 *
	 * @returns A Path instance for the current working directory
	 *
	 * @example
	 * ```ts
	 * const cwd = Path.cwd(); // Current working directory
	 * ```
	 */
	public static cwd(): Path {
		return new Path(Deno.cwd());
	}

	/**
	 * Creates a new Path instance.
	 *
	 * @param path The path string to represent
	 */
	public constructor(public readonly path: string) {}

	public get str(): string {
		return this.path;
	}

	/**
	 * Returns the string representation of the path.
	 *
	 * @returns The path string
	 *
	 * @example
	 * ```ts
	 * const path = new Path("/path/to/file.txt");
	 * console.log(path.toString()); // "/path/to/file.txt"
	 * ```
	 */
	public toString(): string {
		return this.path;
	}

	/**
	 * Allows the Path object to be converted to a primitive value (string).
	 *
	 * @returns The path string
	 *
	 * @example
	 * ```ts
	 * const path = new Path("/path/to/file.txt");
	 * const str = `${path}`; // "/path/to/file.txt"
	 * ```
	 */
	public [Symbol.toPrimitive](): string {
		return this.path;
	}

	/**
	 * Gets the basename of the path (the last portion of the path).
	 *
	 * @returns The basename of the path
	 *
	 * @example
	 * ```ts
	 * const path = new Path("/path/to/file.txt");
	 * console.log(path.name); // "file.txt"
	 * ```
	 */
	public get name(): string {
		return std_path.basename(this.path);
	}

	/**
	 * Gets the extension of the path including the dot.
	 *
	 * @returns The extension of the path including the dot
	 *
	 * @example
	 * ```ts
	 * const path = new Path("/path/to/file.txt");
	 * console.log(path.dotext); // ".txt"
	 * ```
	 */
	public get dotext(): string {
		return this.path.replace(/.*(\.[^.]+)$/, '$1');
	}

	/**
	 * Gets the extension of the path without the dot.
	 *
	 * @returns The extension of the path without the dot
	 *
	 * @example
	 * ```ts
	 * const path = new Path("/path/to/file.txt");
	 * console.log(path.ext); // "txt"
	 * ```
	 */
	public get ext(): string {
		return this.path.replace(/.*\.([^.]+)$/, '$1');
	}

	/**
	 * Checks if the path is absolute.
	 *
	 * @returns True if the path is absolute, false otherwise
	 *
	 * @example
	 * ```ts
	 * const absPath = new Path("/absolute/path");
	 * const relPath = new Path("./relative/path");
	 * console.log(absPath.isAbsolute); // true
	 * console.log(relPath.isAbsolute); // false
	 * ```
	 */
	public get isAbsolute(): boolean {
		return /^(\/|[a-zA-Z]+:).*/.test(this.path);
	}

	/**
	 * Checks if the path is relative.
	 *
	 * @returns True if the path is relative, false otherwise
	 *
	 * @example
	 * ```ts
	 * const absPath = new Path("/absolute/path");
	 * const relPath = new Path("./relative/path");
	 * console.log(absPath.isRelative); // false
	 * console.log(relPath.isRelative); // true
	 * ```
	 */
	public get isRelative(): boolean {
		return !this.isAbsolute;
	}

	/**
	 * Converts the path to an absolute path.
	 *
	 * @returns A new Path instance with the absolute path
	 *
	 * @example
	 * ```ts
	 * const relPath = new Path("./relative/path");
	 * const absPath = relPath.absolute(); // Absolute path based on current working directory
	 * ```
	 */
	public absolute(): Path {
		return new Path(std_path.resolve(this.path));
	}

	/**
	 * Creates a relative path from a base path.
	 *
	 * @param to The base path to make the current path relative to (defaults to current working directory)
	 * @returns A new Path instance with the relative path
	 *
	 * @example
	 * ```ts
	 * const basePath = new Path("/home/user");
	 * const fullPath = new Path("/home/user/documents/file.txt");
	 * const relativePath = fullPath.relative(basePath); // "documents/file.txt"
	 * ```
	 */
	public relative(to: PathLike = Deno.cwd()): Path {
		return new Path(std_path.relative(Path.str(to), this.path));
	}

	/**
	 * Gets the parent directory of the current path.
	 *
	 * @returns A new Path instance representing the parent directory
	 *
	 * @example
	 * ```ts
	 * const path = new Path("/path/to/file.txt");
	 * const parent = path.getParent(); // "/path/to"
	 * ```
	 */
	public getParent(): Path {
		return new Path(std_path.dirname(this.path));
	}

	/**
	 * Joins the current path with additional path segments.
	 *
	 * @param paths Additional path segments to join
	 * @returns A new Path instance with the joined path
	 *
	 * @example
	 * ```ts
	 * const basePath = new Path("/path/to");
	 * const fullPath = basePath.join("directory", "file.txt"); // "/path/to/directory/file.txt"
	 * ```
	 */
	public join(...paths: string[]): Path {
		return new Path(std_path.join(this.path, ...paths));
	}

	private _type(stat: Deno.FileInfo): PathType {
		if (stat.isFile) {
			return FilePath;
		} else if (stat.isDirectory) {
			return DirPath;
		} else if (stat.isSymlink) {
			return SymlinkPath;
		} else {
			throw new Error('Unreachable code');
		}
	}

	/**
	 * Determines the type of the path synchronously.
	 *
	 * @returns The type of the path (FilePath, DirPath, SymlinkPath, or VoidPath)
	 *
	 * @example
	 * ```ts
	 * const path = new Path("/path/to/existing/file.txt");
	 * const type = path.typeSync(); // Returns FilePath constructor
	 * ```
	 */
	public typeSync(): PathType {
		try {
			return this._type(Deno.lstatSync(this.path));
		} catch {
			return VoidPath;
		}
	}

	/**
	 * Determines the type of the path asynchronously.
	 *
	 * @returns A promise that resolves to the type of the path (FilePath, DirPath, SymlinkPath, or VoidPath)
	 *
	 * @example
	 * ```ts
	 * const path = new Path("/path/to/existing/file.txt");
	 * const type = await path.type(); // Returns FilePath constructor
	 * ```
	 */
	public async type(): Promise<PathType> {
		try {
			return this._type(await Deno.lstat(this.path));
		} catch {
			return VoidPath;
		}
	}

	/**
	 * Checks if the path exists synchronously.
	 *
	 * @returns True if the path exists, false otherwise
	 *
	 * @example
	 * ```ts
	 * const path = new Path("/path/to/check");
	 * const exists = path.existsSync(); // true or false
	 * ```
	 */
	public existsSync(): boolean {
		return fs_basic.existsSync(this.path);
	}

	/**
	 * Checks if the path exists asynchronously.
	 *
	 * @returns A promise that resolves to true if the path exists, false otherwise
	 *
	 * @example
	 * ```ts
	 * const path = new Path("/path/to/check");
	 * const exists = await path.exists(); // true or false
	 * ```
	 */
	public exists(): Promise<boolean> {
		return fs_basic.exists(this.path);
	}

	/**
	 * Checks if the path is a file synchronously.
	 *
	 * @returns True if the path is a file, false otherwise
	 *
	 * @example
	 * ```ts
	 * const path = new Path("/path/to/file.txt");
	 * const isFile = path.isFileSync(); // true or false
	 * ```
	 */
	public isFileSync(): boolean {
		return fs_basic.isFileSync(this.path);
	}

	/**
	 * Checks if the path is a file asynchronously.
	 *
	 * @returns A promise that resolves to true if the path is a file, false otherwise
	 *
	 * @example
	 * ```ts
	 * const path = new Path("/path/to/file.txt");
	 * const isFile = await path.isFileSync(); // true or false
	 * ```
	 */
	public isFile(): Promise<boolean> {
		return fs_basic.isFile(this.path);
	}

	/**
	 * Checks if the path is a directory synchronously.
	 *
	 * @returns True if the path is a directory, false otherwise
	 *
	 * @example
	 * ```ts
	 * const path = new Path("/path/to/directory");
	 * const isDir = path.isDirectorySync(); // true or false
	 * ```
	 */
	public isDirectorySync(): boolean {
		return fs_basic.isDirectorySync(this.path);
	}

	/**
	 * Checks if the path is a directory asynchronously.
	 *
	 * @returns A promise that resolves to true if the path is a directory, false otherwise
	 *
	 * @example
	 * ```ts
	 * const path = new Path("/path/to/directory");
	 * const isDir = await path.isDirectory(); // true or false
	 * ```
	 */
	public isDirectory(): Promise<boolean> {
		return fs_basic.isDirectory(this.path);
	}

	/**
	 * Checks if the path is a symbolic link synchronously.
	 *
	 * @returns True if the path is a symbolic link, false otherwise
	 *
	 * @example
	 * ```ts
	 * const path = new Path("/path/to/symlink");
	 * const isSymlink = path.isSymlinkSync(); // true or false
	 * ```
	 */
	public isSymlinkSync(): boolean {
		return fs_basic.isSymlinkSync(this.path);
	}

	/**
	 * Checks if the path is a symbolic link asynchronously.
	 *
	 * @returns A promise that resolves to true if the path is a symbolic link, false otherwise
	 *
	 * @example
	 * ```ts
	 * const path = new Path("/path/to/symlink");
	 * const isSymlink = await path.isSymlink(); // true or false
	 * ```
	 */
	public isSymlink(): Promise<boolean> {
		return fs_basic.isSymlink(this.path);
	}

	/**
	 * Gets file information synchronously without following symlinks.
	 *
	 * @returns FileInfo for the path
	 *
	 * @example
	 * ```ts
	 * const path = new Path("/path/to/file.txt");
	 * const fileInfo = path.lstatSync();
	 * console.log(fileInfo.size); // Size of the file
	 * ```
	 */
	public lstatSync(): Deno.FileInfo {
		return fs_basic.lstatSync(this.path);
	}

	/**
	 * Gets file information asynchronously without following symlinks.
	 *
	 * @returns A promise that resolves to FileInfo for the path
	 *
	 * @example
	 * ```ts
	 * const path = new Path("/path/to/file.txt");
	 * const fileInfo = await path.lstat();
	 * console.log(fileInfo.size); // Size of the file
	 * ```
	 */
	public lstat(): Promise<Deno.FileInfo> {
		return fs_basic.lstat(this.path);
	}

	/**
	 * Gets file information synchronously, following symlinks.
	 *
	 * @returns FileInfo for the path
	 *
	 * @example
	 * ```ts
	 * const path = new Path("/path/to/file.txt");
	 * const fileInfo = path.statSync();
	 * console.log(fileInfo.size); // Size of the file
	 * ```
	 */
	public statSync(): Deno.FileInfo {
		return fs_basic.statSync(this.path);
	}

	/**
	 * Gets file information asynchronously, following symlinks.
	 *
	 * @returns A promise that resolves to FileInfo for the path
	 *
	 * @example
	 * ```ts
	 * const path = new Path("/path/to/file.txt");
	 * const fileInfo = await path.stat();
	 * console.log(fileInfo.size); // Size of the file
	 * ```
	 */
	public stat(): Promise<Deno.FileInfo> {
		return fs_basic.stat(this.path);
	}

	private _as(type: PathType): Path {
		switch (type) {
			case VoidPath:
				return new VoidPath(this.path);
			case FilePath:
				return new FilePath(this.path);
			case DirPath:
				return new DirPath(this.path);
			case SymlinkPath:
				return new SymlinkPath(this.path);
			default:
				throw new Error('Unreachable code');
		}
	}

	/**
	 * Converts the path to the specified type synchronously.
	 *
	 * @template T The type to convert to (FilePath, DirPath, etc.)
	 * @param type The constructor of the target type
	 * @returns An instance of the specified type
	 *
	 * @throws Error if the path is not of the expected type
	 *
	 * @example
	 * ```ts
	 * const path = new Path("/path/to/existing/file.txt");
	 * const filePath = path.asSync(FilePath); // Returns FilePath instance
	 * ```
	 */
	public asSync<T extends CollapsedPath>(type: Constructor<T>): T {
		const actualType = this.typeSync();
		if (actualType !== type) {
			throw new Error(`Path ${this.path} is not a ${type.name}`);
		}
		return this._as(type) as T;
	}

	/**
	 * Converts the path to the specified type asynchronously.
	 *
	 * @template T The type to convert to (FilePath, DirPath, etc.)
	 * @param type The constructor of the target type
	 * @returns A promise that resolves to an instance of the specified type
	 *
	 * @throws Error if the path is not of the expected type
	 *
	 * @example
	 * ```ts
	 * const path = new Path("/path/to/existing/file.txt");
	 * const filePath = await path.as(FilePath); // Returns FilePath instance
	 * ```
	 */
	public async as<T extends CollapsedPath>(type: Constructor<T>): Promise<T> {
		const actualType = await this.type();
		if (actualType !== type) {
			throw new Error(`Path ${this.path} is not a ${type.name}`);
		}
		return this._as(type) as T;
	}
}

/**
 * Represents an void path (a path that doesn't exist yet).
 * Provides methods for creating files and directories.
 */
export class VoidPath extends Path {
	/**
	 * Creates a directory at the path synchronously.
	 *
	 * @param options Directory creation options
	 * @returns A DirPath instance representing the created directory
	 *
	 * @example
	 * ```ts
	 * const voidPath = new VoidPath("/path/to/new/directory");
	 * const dirPath = voidPath.mkdirSync(); // Creates directory and returns DirPath
	 * ```
	 */
	public mkdirSync(options?: { recursive?: boolean }): DirPath {
		Deno.mkdirSync(this.path, options);
		return new DirPath(this.path);
	}

	/**
	 * Creates a directory at the path asynchronously.
	 *
	 * @param options Directory creation options
	 * @returns A promise that resolves to a DirPath instance representing the created directory
	 *
	 * @example
	 * ```ts
	 * const voidPath = new VoidPath("/path/to/new/directory");
	 * const dirPath = await voidPath.mkdir(); // Creates directory and returns DirPath
	 * ```
	 */
	public async mkdir(options?: { recursive?: boolean }): Promise<DirPath> {
		await Deno.mkdir(this.path, options);
		return new DirPath(this.path);
	}

	/**
	 * Creates an void file at the path synchronously.
	 *
	 * @returns A FilePath instance representing the created file
	 *
	 * @example
	 * ```ts
	 * const voidPath = new VoidPath("/path/to/new/file.txt");
	 * const filePath = voidPath.touchSync(); // Creates file and returns FilePath
	 * ```
	 */
	public touchSync(): FilePath {
		fs_operate.touchSync(this.path);
		return new FilePath(this.path);
	}

	/**
	 * Creates an void file at the path asynchronously.
	 *
	 * @returns A promise that resolves to a FilePath instance representing the created file
	 *
	 * @example
	 * ```ts
	 * const voidPath = new VoidPath("/path/to/new/file.txt");
	 * const filePath = await voidPath.touch(); // Creates file and returns FilePath
	 * ```
	 */
	public async touch(): Promise<FilePath> {
		await fs_operate.touch(this.path);
		return new FilePath(this.path);
	}

	/**
	 * Writes data to a file at the path synchronously.
	 *
	 * @param data The data to write (string or Uint8Array)
	 * @param options Write options
	 *
	 * @example
	 * ```ts
	 * const voidPath = new VoidPath("/path/to/new/file.txt");
	 * voidPath.writeSync("Hello, world!"); // Creates and writes to file
	 * ```
	 */
	public writeSync(data: Uint8Array | string, options?: Deno.WriteFileOptions): void {
		fs_operate.makeParentDirSync(this.path);
		if (typeof data === 'string') {
			Deno.writeTextFileSync(this.path, data, options);
		} else {
			Deno.writeFileSync(this.path, data, options);
		}
	}

	/**
	 * Writes data to a file at the path asynchronously.
	 *
	 * @param data The data to write (string or Uint8Array)
	 * @param options Write options
	 * @returns A promise that resolves when the write is complete
	 *
	 * @example
	 * ```ts
	 * const voidPath = new VoidPath("/path/to/new/file.txt");
	 * await voidPath.write("Hello, world!"); // Creates and writes to file
	 * ```
	 */
	public async write(data: Uint8Array | string, options?: Deno.WriteFileOptions): Promise<void> {
		await fs_operate.makeParentDir(this.path);
		if (typeof data === 'string') {
			await Deno.writeTextFile(this.path, data, options);
		} else {
			await Deno.writeFile(this.path, data, options);
		}
	}

	/**
	 * Creates a hard link to the target path synchronously.
	 *
	 * @param target The target path to link to
	 * @returns A SymlinkPath instance representing the created link
	 *
	 * @example
	 * ```ts
	 * const voidPath = new VoidPath("/path/to/link");
	 * const symlinkPath = voidPath.linkSync("/path/to/target"); // Creates hard link
	 * ```
	 */
	public linkSync(target: PathLike): SymlinkPath {
		Deno.linkSync(this.path, Path.str(target));
		return new SymlinkPath(this.path);
	}

	/**
	 * Creates a hard link to the target path asynchronously.
	 *
	 * @param target The target path to link to
	 * @returns A promise that resolves to a SymlinkPath instance representing the created link
	 *
	 * @example
	 * ```ts
	 * const voidPath = new VoidPath("/path/to/link");
	 * const symlinkPath = await voidPath.link("/path/to/target"); // Creates hard link
	 * ```
	 */
	public async link(target: PathLike): Promise<SymlinkPath> {
		await Deno.link(this.path, Path.str(target));
		return new SymlinkPath(this.path);
	}
}

/**
 * Abstract base class for non-void paths (existing files, directories, or symlinks).
 * Provides methods for removing paths.
 */
abstract class NonVoidPath extends Path {
	/**
	 * Removes the path synchronously.
	 *
	 * @param options Removal options
	 *
	 * @example
	 * ```ts
	 * const filePath = new FilePath("/path/to/file.txt");
	 * filePath.removeSync(); // Removes the file
	 * ```
	 */
	public removeSync(options?: { recursive?: boolean }): void {
		Deno.removeSync(this.path, options);
	}

	/**
	 * Removes the path asynchronously.
	 *
	 * @param options Removal options
	 * @returns A promise that resolves when the removal is complete
	 *
	 * @example
	 * ```ts
	 * const filePath = new FilePath("/path/to/file.txt");
	 * await filePath.remove(); // Removes the file
	 * ```
	 */
	public async remove(options?: { recursive?: boolean }): Promise<void> {
		await Deno.remove(this.path, options);
	}
}

/**
 * Represents a file path.
 * Provides methods for reading and writing file contents.
 */
export class FilePath extends NonVoidPath {
	/**
	 * Reads the file contents as bytes synchronously.
	 *
	 * @returns The file contents as a Uint8Array
	 *
	 * @example
	 * ```ts
	 * const filePath = new FilePath("/path/to/file.txt");
	 * const data = filePath.readSync(); // File contents as bytes
	 * ```
	 */
	public readSync(): Uint8Array {
		return Deno.readFileSync(this.path);
	}

	/**
	 * Reads the file contents as bytes asynchronously.
	 *
	 * @returns A promise that resolves to the file contents as a Uint8Array
	 *
	 * @example
	 * ```ts
	 * const filePath = new FilePath("/path/to/file.txt");
	 * const data = await filePath.read(); // File contents as bytes
	 * ```
	 */
	public read(): Promise<Uint8Array> {
		return Deno.readFile(this.path);
	}

	/**
	 * Reads the file contents as text synchronously.
	 *
	 * @returns The file contents as a string
	 *
	 * @example
	 * ```ts
	 * const filePath = new FilePath("/path/to/file.txt");
	 * const content = filePath.readTextSync(); // File contents as string
	 * ```
	 */
	public readTextSync(): string {
		return Deno.readTextFileSync(this.path);
	}

	/**
	 * Reads the file contents as text asynchronously.
	 *
	 * @returns A promise that resolves to the file contents as a string
	 *
	 * @example
	 * ```ts
	 * const filePath = new FilePath("/path/to/file.txt");
	 * const content = await filePath.readText(); // File contents as string
	 * ```
	 */
	public readText(): Promise<string> {
		return Deno.readTextFile(this.path);
	}

	/**
	 * Writes data to the file synchronously.
	 *
	 * @param data The data to write (string or Uint8Array)
	 * @param options Write options
	 *
	 * @example
	 * ```ts
	 * const filePath = new FilePath("/path/to/file.txt");
	 * filePath.writeSync("New content"); // Updates file contents
	 * ```
	 */
	public writeSync(data: Uint8Array | string, options?: Deno.WriteFileOptions): void {
		if (typeof data === 'string') {
			const encoder = new TextEncoder();
			data = encoder.encode(data);
		}
		fs_operate.makeParentDirSync(this.path);
		Deno.writeFileSync(this.path, data, options);
	}

	/**
	 * Writes data to the file asynchronously.
	 *
	 * @param data The data to write (string or Uint8Array)
	 * @param options Write options
	 * @returns A promise that resolves when the write is complete
	 *
	 * @example
	 * ```ts
	 * const filePath = new FilePath("/path/to/file.txt");
	 * await filePath.write("New content"); // Updates file contents
	 * ```
	 */
	public async write(data: Uint8Array | string, options?: Deno.WriteFileOptions): Promise<void> {
		if (typeof data === 'string') {
			const encoder = new TextEncoder();
			data = encoder.encode(data);
		}
		await fs_operate.makeParentDir(this.path);
		await Deno.writeFile(this.path, data as Uint8Array, options);
	}
}

/**
 * Represents a directory path.
 * Provides methods for listing directory contents.
 */
export class DirPath extends NonVoidPath {
	/**
	 * Lists the contents of the directory synchronously.
	 *
	 * @returns An array of Path instances representing the directory entries
	 *
	 * @example
	 * ```ts
	 * const dirPath = new DirPath("/path/to/directory");
	 * const entries = dirPath.listSync(); // Array of paths in the directory
	 * ```
	 */
	public listSync(): Path[] {
		const entries: Path[] = [];
		for (const entry of Deno.readDirSync(this.path)) {
			entries.push(new Path(std_path.join(this.path, entry.name)));
		}
		return entries;
	}

	/**
	 * Lists the contents of the directory asynchronously.
	 *
	 * @returns A promise that resolves to an array of Path instances representing the directory entries
	 *
	 * @example
	 * ```ts
	 * const dirPath = new DirPath("/path/to/directory");
	 * const entries = await dirPath.list(); // Array of paths in the directory
	 * ```
	 */
	public async list(): Promise<Path[]> {
		const entries: Path[] = [];
		for await (const entry of Deno.readDir(this.path)) {
			entries.push(new Path(std_path.join(this.path, entry.name)));
		}
		return entries;
	}
}

/**
 * Represents a symbolic link path.
 * Provides methods for getting the target of the symlink.
 */
export class SymlinkPath extends NonVoidPath {
	/**
	 * Gets the target of the symbolic link synchronously.
	 *
	 * @returns A Path instance representing the target of the symlink
	 *
	 * @example
	 * ```ts
	 * const symlinkPath = new SymlinkPath("/path/to/symlink");
	 * const target = symlinkPath.targetSync(); // Path to which the symlink points
	 * ```
	 */
	public targetSync(): Path {
		return new Path(Deno.readLinkSync(this.path));
	}

	/**
	 * Gets the target of the symbolic link asynchronously.
	 *
	 * @returns A promise that resolves to a Path instance representing the target of the symlink
	 *
	 * @example
	 * ```ts
	 * const symlinkPath = new SymlinkPath("/path/to/symlink");
	 * const target = await symlinkPath.target(); // Path to which the symlink points
	 * ```
	 */
	public async target(): Promise<Path> {
		return new Path(await Deno.readLink(this.path));
	}
}
