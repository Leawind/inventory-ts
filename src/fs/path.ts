import * as std_path from '@std/path'
import * as fs_basic from './basic.ts'
import * as fs_operate from './operate.ts'
import type { Exact } from '@leawind/lay-sing'

export type PathLike = string | Path

export type PathType = 'void' | 'file' | 'dir' | 'symlink'

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
    return path instanceof Path ? path : new Path(path)
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
    return Path.from(path).path
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
    return new Path(Deno.cwd())
  }

  /**
   * Creates a new Path instance.
   *
   * @param path The path string to represent
   */
  public constructor(public readonly path: string) {}

  public clone(): Path {
    return new Path(this.path)
  }

  /**
   * Gets the string representation of the path.
   *
   * @returns The path as a string
   *
   * @example
   * ```ts
   * const path = new Path("/path/to/file.txt");
   * console.log(path.str); // "/path/to/file.txt"
   * ```
   */
  public get str(): string {
    return this.path
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
    return this.path
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
    return this.path
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
    return std_path.basename(this.path)
  }

  /**
   * ```typescript
   * import { assertEquals } from '@std/assert'
   *
   * assertEquals(new Path("/path/to/file").splitExt(),         ["file", ""])
   * assertEquals(new Path("/path/to/file.tar").splitExt(),     ["file", ".tar"])
   * assertEquals(new Path("/path/to/file.tar.gz").splitExt(),  ["file.tar", ".gz"])
   * assertEquals(new Path("/path/to/file.tar.").splitExt(),    ["file.tar", "."])
   * assertEquals(new Path("..").splitExt(),                    ["..", ""])
   * assertEquals(new Path(".").splitExt(),                     [".", ""])
   * ```
   */
  public splitExt(): [string, '' | `.${string}`] {
    const name = this.name
    if (name === '.' || name === '..') {
      return [name, '']
    }
    for (let i = name.length - 1; i >= 0; i--) {
      if (name[i] === '.') {
        return [name.slice(0, i), name.slice(i) as `.${string}`]
      }
    }
    return [name, '']
  }

  /**
   * Gets the name of the file without extension.
   *
   * @returns The basename of the path without its extension
   *
   * @see splitExt
   */
  public get nameNoExt(): string {
    return this.splitExt()[0]
  }

  /**
   * Gets the extension of the path including the dot.
   * Returns the entire path if no extension is found.
   *
   * @returns The extension of the path including the dot, or the entire path if no extension

   * @see splitExt
   */
  public get dotext(): string {
    if (this.name === '.' || this.name === '..') {
      return ''
    }
    return this.splitExt()[1]
  }

  /**
   * Gets the extension of the path without the dot.
   * Returns the entire path if no extension is found.
   *
   * @returns The extension of the path without the dot, or the entire path if no extension
   *
   * @example
   * ```ts
   * new Path("/path/to/file.txt").ext; // "txt"
   * new Path("/path/to/file").ext;     // ""
   * ```
   */
  public get ext(): string {
    return this.splitExt()[1].replace(/^\./, '')
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
    return /^(\/|[a-zA-Z]+:).*/.test(this.path)
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
    return !this.isAbsolute
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
    return new Path(std_path.resolve(this.path))
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
    return new Path(std_path.relative(Path.str(to), this.path))
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
    return new Path(std_path.dirname(this.path))
  }

  /**
   * Joins paths to the current path.
   *
   * @param paths The paths to join with the current path
   * @returns A new Path instance with the joined path
   *
   * @example
   * ```ts
   * const path = new Path("/path/to");
   * const joinedPath = path.join("file.txt"); // "/path/to/file.txt"
   * ```
   */
  public join(...paths: string[]): Path {
    return new Path(std_path.join(this.path, ...paths))
  }

  private _type(stat: Deno.FileInfo): PathType {
    if (stat.isFile) {
      return 'file'
    } else if (stat.isDirectory) {
      return 'dir'
    } else if (stat.isSymlink) {
      return 'symlink'
    } else {
      return 'void'
    }
  }

  public typeSync(): PathType {
    try {
      return this._type(Deno.lstatSync(this.path))
    } catch {
      return 'void'
    }
  }

  public async typeAsync(): Promise<PathType> {
    try {
      return this._type(await Deno.lstat(this.path))
    } catch {
      return 'void'
    }
  }

  /**
   * Checks if the path exists
   *
   * @returns True if the path exists, false otherwise
   */
  public existsSync(): boolean {
    return fs_basic.existsSync(this.path)
  }

  /**
   * Checks if the path exists asynchronously.
   *
   * @returns A promise that resolves to true if the path exists, false otherwise
   */
  public existsAsync(): Promise<boolean> {
    return fs_basic.exists(this.path)
  }

  /**
   * Checks if the path is a file
   *
   * @returns True if the path is a file, false otherwise
   */
  public isFileSync(): boolean {
    return fs_basic.isFileSync(this.path)
  }

  /**
   * Checks if the path is a file asynchronously.
   *
   * @returns A promise that resolves to true if the path is a file, false otherwise
   */
  public isFileAsync(): Promise<boolean> {
    return fs_basic.isFile(this.path)
  }

  /**
   * Checks if the path is a directory
   *
   * @returns True if the path is a directory, false otherwise
   */
  public isDirectorySync(): boolean {
    return fs_basic.isDirectorySync(this.path)
  }

  /**
   * Checks if the path is a directory asynchronously.
   *
   * @returns A promise that resolves to true if the path is a directory, false otherwise
   */
  public isDirectoryAsync(): Promise<boolean> {
    return fs_basic.isDirectory(this.path)
  }

  /**
   * Checks if the path is a symbolic link
   *
   * @returns True if the path is a symbolic link, false otherwise
   */
  public isSymlinkSync(): boolean {
    return fs_basic.isSymlinkSync(this.path)
  }

  /**
   * Checks if the path is a symbolic link asynchronously.
   *
   * @returns A promise that resolves to true if the path is a symbolic link, false otherwise
   */
  public isSymlinkAsync(): Promise<boolean> {
    return fs_basic.isSymlink(this.path)
  }

  /**
   * Gets file informationwithout following symlinks.
   *
   * @returns FileInfo for the path
   */
  public lstatSync(): Deno.FileInfo {
    return fs_basic.lstatSync(this.path)
  }

  /**
   * Gets file information asynchronously without following symlinks.
   *
   * @returns A promise that resolves to FileInfo for the path
   */
  public lstatAsync(): Promise<Deno.FileInfo> {
    return fs_basic.lstat(this.path)
  }

  /**
   * Gets file information synchronously, following symlinks.
   *
   * @returns FileInfo for the path
   */
  public statSync(): Deno.FileInfo {
    return fs_basic.statSync(this.path)
  }

  /**
   * Gets file information asynchronously, following symlinks.
   *
   * @returns A promise that resolves to FileInfo for the path
   */
  public statAsync(): Promise<Deno.FileInfo> {
    return fs_basic.stat(this.path)
  }

  /**
   * Executes the corresponding callback function based on the actual type of the path.
   *
   * This method asynchronously detects the path type and then executes the appropriate
   * callback function based on the type. If the path does not exist or does not belong
   * to any specific type, no callback will be executed.
   *
   * @param callbacks An object containing callback functions for different path types
   * @returns The return value of the executed callback, or undefined if no callback was executed
   */
  public async matchAsync<R>(callbacks: {
    file?(path: Path): Promise<R> | R
    dir?(path: Path): Promise<R> | R
    symlink?(path: Path): Promise<R> | R
  }): Promise<R | undefined> {
    const type = await this.typeAsync()
    switch (type) {
      case 'file':
        return callbacks.file && callbacks.file(this)
      case 'dir':
        return callbacks.dir && callbacks.dir(this)
      case 'symlink':
        return callbacks.symlink && callbacks.symlink(this)
    }
  }

  /**
   * Executes the corresponding callback function based on the actual type of the path
   *
   * @param callbacks An object containing callback functions for different path types
   * @returns The return value of the executed callback, or undefined if no callback was executed
   */
  public matchSync<R>(callbacks: {
    file?(path: Path): R
    dir?(path: Path): R
    symlink?(path: Path): R
  }): R | undefined {
    const type = this.typeSync()
    switch (type) {
      case 'file':
        return callbacks.file && callbacks.file(this)
      case 'dir':
        return callbacks.dir && callbacks.dir(this)
      case 'symlink':
        return callbacks.symlink && callbacks.symlink(this)
    }
  }

  /**
   * Creates a directory at the path
   *
   * @param options Directory creation options
   * @returns A Path instance representing the created directory
   */
  public mkdirSync(options?: { recursive?: boolean }): Path {
    Deno.mkdirSync(this.path, options)
    return this
  }

  /**
   * Creates a directory at the path asynchronously.
   *
   * @param options Directory creation options
   * @returns A promise that resolves to a Path instance representing the created directory
   */
  public async mkdirAsync(options?: { recursive?: boolean }): Promise<Path> {
    await Deno.mkdir(this.path, options)
    return this
  }

  /**
   * Updates the access and modification times of the file at the path
   * Creates the file if it doesn't exist.
   *
   * @returns This Path instance for method chaining
   *
   * @example
   * ```ts
   * const path = new Path("./file.txt");
   * path.touchSync(); // Creates or updates the file
   * ```
   */
  public touchSync(): this {
    fs_operate.touchSync(this.path)
    return this
  }

  /**
   * Updates the access and modification times of the file at the path asynchronously.
   * Creates the file if it doesn't exist.
   *
   * @returns A promise that resolves to this Path instance for method chaining
   *
   * @example
   * ```ts
   * const path = new Path("./file.txt");
   * await path.touch(); // Creates or updates the file
   * ```
   */
  public async touchAsync(): Promise<this> {
    await fs_operate.touch(this.path)
    return this
  }

  /**
   * Writes data to a file at the path
   *
   * @param data The data to write (string or Uint8Array)
   * @param options Write options
   */
  public writeSync(data: Uint8Array | string, options?: Deno.WriteFileOptions): void {
    fs_operate.makeParentDirSync(this.path)
    if (typeof data === 'string') {
      Deno.writeTextFileSync(this.path, data, options)
    } else {
      Deno.writeFileSync(this.path, data, options)
    }
  }

  /**
   * Writes data to a file at the path asynchronously.
   *
   * @param data The data to write (string or Uint8Array)
   * @param options Write options
   * @returns A promise that resolves when the write is complete
   */
  public async writeAsync(data: Uint8Array | string, options?: Deno.WriteFileOptions): Promise<void> {
    await fs_operate.makeParentDir(this.path)
    if (typeof data === 'string') {
      await Deno.writeTextFile(this.path, data, options)
    } else {
      await Deno.writeFile(this.path, data, options)
    }
  }

  /**
   * Creates a hard link
   *
   * @param target The target path to link from
   * @returns A Path instance representing the created link (this path)
   */
  public linkToSync(target: PathLike): Path {
    Deno.linkSync(Path.str(target), this.path)
    return new Path(this.path)
  }

  /**
   * Creates a hard link asynchronously.
   *
   * @param target The target path to link from
   * @returns A promise that resolves to a Path instance representing the created link (this path)
   */
  public async linkToAsync(target: PathLike): Promise<Path> {
    await Deno.link(Path.str(target), this.path)
    return new Path(this.path)
  }

  /**
   * Removes the path
   *
   * @param options Removal options
   */
  public removeSync(options?: { recursive?: boolean }): void {
    Deno.removeSync(this.path, options)
  }

  /**
   * Removes the path asynchronously.
   *
   * @param options Removal options
   * @returns A promise that resolves when the removal is complete
   */
  public async removeAsync(options?: { recursive?: boolean }): Promise<void> {
    await Deno.remove(this.path, options)
  }

  /**
   * Moves the path to a destination path asynchronously.
   *
   * @param dest The destination path to move to
   * @returns A promise that resolves to a Path instance
   */
  public async moveToAsync(dest: PathLike): Promise<Path> {
    const destPath = Path.from(dest)
    await Deno.rename(this.path, destPath.path)
    return destPath
  }

  /**
   * Moves the path to a destination path
   *
   * @param dest The destination path to move to
   * @returns A Path instance
   */
  public moveToSync(dest: PathLike): Path {
    const destPath = Path.from(dest)
    Deno.renameSync(this.path, destPath.path)
    return destPath
  }

  /**
   * Reads the file contents as bytes
   *
   * @returns The file contents as a Uint8Array
   */
  public readSync(): Uint8Array {
    return Deno.readFileSync(this.path)
  }

  /**
   * Reads the file contents as bytes asynchronously.
   *
   * @returns A promise that resolves to the file contents as a Uint8Array
   */
  public readAsync(): Promise<Uint8Array> {
    return Deno.readFile(this.path)
  }

  /**
   * Reads the file contents as text
   *
   * @returns The file contents as a string
   */
  public readTextSync(): string {
    return Deno.readTextFileSync(this.path)
  }

  /**
   * Reads the file contents as text asynchronously.
   *
   * @returns A promise that resolves to the file contents as a string
   */
  public readTextAsync(): Promise<string> {
    return Deno.readTextFile(this.path)
  }

  /**
   * Lists the contents of the directory
   *
   * @returns An array of Path instances representing the directory entries
   */
  public listSync(): Path[] {
    const entries: Path[] = []
    for (const entry of Deno.readDirSync(this.path)) {
      entries.push(new Path(std_path.join(this.path, entry.name)))
    }
    return entries
  }

  /**
   * Lists the contents of the directory asynchronously.
   *
   * @returns A promise that resolves to an array of Path instances representing the directory entries
   */
  public async listAsync(): Promise<Path[]> {
    const entries: Path[] = []
    for await (const entry of Deno.readDir(this.path)) {
      entries.push(new Path(std_path.join(this.path, entry.name)))
    }
    return entries
  }

  /**
   * Gets the target of the symbolic link
   *
   * @returns A Path instance representing the target of the symlink
   */
  public targetSync(): Path {
    return new Path(Deno.readLinkSync(this.path))
  }

  /**
   * Gets the target of the symbolic link asynchronously.
   *
   * @returns A promise that resolves to a Path instance representing the target of the symlink
   */
  public async targetAsync(): Promise<Path> {
    return new Path(await Deno.readLink(this.path))
  }

  private _async: Path | null = null
  private _sync: Path | null = null

  public get async(): PathAsync {
    return (this._async ??= this._sync ? this : this.clone()) as unknown as PathAsync
  }
  public get sync(): PathSync {
    return (this._sync ??= this._async ? this : this.clone()) as unknown as PathSync
  }

  static {
    console.log(`Init Path.prototype`)
    for (const keySync of Reflect.ownKeys(Path.prototype)) {
      if (typeof keySync === 'string') {
        const m = /^(.+)Sync$/.exec(keySync)
        if (m) {
          const key = m[1]
          const keyAsync = key + 'Async'
          if (!Reflect.has(Path.prototype, keyAsync)) {
            throw new Error(`Unreachable: ${keyAsync} is not a method of Path`)
          }
          Reflect.set(Path.prototype, key, function (this: any, ...args: any[]) {
            switch (this) {
              case this._sync:
                return this[keySync](...args)
              case this._async:
                return this[keyAsync](...args)
              default:
                throw new Error('Invalid path instance')
            }
          })
        }
      }
    }
  }
}

type Replace<T, Old, New> = T extends any ? (
    Exact<T, Old> extends true ? New
      : T extends Promise<infer U> ? Promise<Replace<U, Old, New>>
      : T extends Map<infer K, infer V> ? Map<Replace<K, Old, New>, Replace<V, Old, New>>
      : T extends Set<infer U> ? Set<Replace<U, Old, New>>
      : T extends (...args: infer P) => infer R ? (...args: P) => Replace<R, Old, New>
      : T extends object ? { [K in keyof T]: Replace<T[K], Old, New> }
      : T
  )
  : never

/**
 * Help: search `\): .*Path`
 */
type Filter<T, N extends PathSync | PathAsync> = Replace<T, Path, N>

type KeysSync = { [K in keyof Path]: K extends `${string}Sync` ? K : never }[keyof Path]
type KeysAsync = { [K in keyof Path]: K extends `${string}Async` ? K : never }[keyof Path]

type KeysNaked = {
  [k in keyof Path]: k extends `${infer key extends string}Sync` ? key : never
}[keyof Path]

type KeysSimple = Exclude<keyof Path, KeysSync | KeysAsync>

export type PathSync =
  & { [K in KeysSimple]: Filter<Path[K], PathSync> }
  & { [K in KeysNaked]: Filter<Path[`${K}Sync`], PathSync> }

export type PathAsync =
  & { [K in KeysSimple]: Filter<Path[K], PathAsync> }
  & { [K in KeysNaked]: Filter<Path[`${K}Async`], PathAsync> }
