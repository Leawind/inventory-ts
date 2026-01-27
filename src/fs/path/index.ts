import * as std_path from '@std/path@1';
import type { Constructor } from '@/types.ts';
import * as fs_basic from '../basic.ts';
import * as fs_operate from '../operate.ts';

export type PathLike = string | Path;
export type CollapsedPath = EmptyPath | DirPath | FilePath | SymlinkPath;
export type PathType = Constructor<CollapsedPath>;

export class Path {
	public static from(path: PathLike): Path {
		return path instanceof Path ? path : new Path(path);
	}
	public static str(path: PathLike): string {
		return Path.from(path).path;
	}
	public static cwd(): Path {
		return new Path(Deno.cwd());
	}

	public constructor(public readonly path: string) {}

	public toString(): string {
		return this.path;
	}

	public [Symbol.toPrimitive](): string {
		return this.path;
	}

	public get name(): string {
		return std_path.basename(this.path);
	}

	public get dotext(): string {
		return this.path.replace(/.*(\.[^.]+)$/, '$1');
	}

	public get ext(): string {
		return this.path.replace(/.*\.([^.]+)$/, '$1');
	}

	public get isAbsolute(): boolean {
		return /^(\/|[a-zA-Z]+:).*/.test(this.path);
	}

	public get isRelative(): boolean {
		return !this.isAbsolute;
	}

	public absolute(): Path {
		return new Path(std_path.resolve(this.path));
	}

	public relative(to: PathLike = Deno.cwd()): Path {
		return new Path(std_path.relative(Path.str(to), this.path));
	}

	public getparent(): Path {
		return new Path(std_path.dirname(this.path));
	}

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
	public typeSync(): PathType {
		try {
			return this._type(Deno.lstatSync(this.path));
		} catch {
			return EmptyPath;
		}
	}
	public async type(): Promise<PathType> {
		try {
			return this._type(await Deno.lstat(this.path));
		} catch {
			return EmptyPath;
		}
	}

	public existsSync(): boolean {
		return fs_basic.existsSync(this.path);
	}
	public exists(): Promise<boolean> {
		return fs_basic.exists(this.path);
	}

	public isFileSync(): boolean {
		return fs_basic.isFileSync(this.path);
	}
	public isFile(): Promise<boolean> {
		return fs_basic.isFile(this.path);
	}

	public isDirectorySync(): boolean {
		return fs_basic.isDirectorySync(this.path);
	}
	public isDirectory(): Promise<boolean> {
		return fs_basic.isDirectory(this.path);
	}

	public isSymlinkSync(): boolean {
		return fs_basic.isSymlinkSync(this.path);
	}
	public isSymlink(): Promise<boolean> {
		return fs_basic.isSymlink(this.path);
	}

	public lstatSync(): Deno.FileInfo {
		return fs_basic.lstatSync(this.path);
	}

	public lstat(): Promise<Deno.FileInfo> {
		return fs_basic.lstat(this.path);
	}

	public statSync(): Deno.FileInfo {
		return fs_basic.statSync(this.path);
	}

	public stat(): Promise<Deno.FileInfo> {
		return fs_basic.stat(this.path);
	}

	private _as(type: PathType): Path {
		switch (type) {
			case EmptyPath:
				return new EmptyPath(this.path);
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
	public asSync<T extends CollapsedPath>(type: Constructor<T>): T {
		const actualType = this.typeSync();
		if (actualType !== type) {
			throw new Error(`Path ${this.path} is not a ${type.name}`);
		}
		return this._as(type) as T;
	}
	public async as<T extends CollapsedPath>(type: Constructor<T>): Promise<T> {
		const actualType = await this.type();
		if (actualType !== type) {
			throw new Error(`Path ${this.path} is not a ${type.name}`);
		}
		return this._as(type) as T;
	}
}

export class EmptyPath extends Path {
	public mkdirSync(options?: { recursive?: boolean }): DirPath {
		Deno.mkdirSync(this.path, options);
		return new DirPath(this.path);
	}

	public async mkdir(options?: { recursive?: boolean }): Promise<DirPath> {
		await Deno.mkdir(this.path, options);
		return new DirPath(this.path);
	}

	public touchSync(): FilePath {
		fs_operate.touchSync(this.path);
		return new FilePath(this.path);
	}
	public async touch(): Promise<FilePath> {
		await fs_operate.touch(this.path);
		return new FilePath(this.path);
	}

	public writeSync(data: Uint8Array | string, options?: Deno.WriteFileOptions): void {
		fs_operate.makeParentDirSync(this.path);
		if (typeof data === 'string') {
			Deno.writeTextFileSync(this.path, data, options);
		} else {
			Deno.writeFileSync(this.path, data, options);
		}
	}

	public async write(data: Uint8Array | string, options?: Deno.WriteFileOptions): Promise<void> {
		await fs_operate.makeParentDir(this.path);
		if (typeof data === 'string') {
			await Deno.writeTextFile(this.path, data, options);
		} else {
			await Deno.writeFile(this.path, data, options);
		}
	}

	public linkSync(target: PathLike): SymlinkPath {
		Deno.linkSync(this.path, Path.str(target));
		return new SymlinkPath(this.path);
	}
	public async link(target: PathLike): Promise<SymlinkPath> {
		await Deno.link(this.path, Path.str(target));
		return new SymlinkPath(this.path);
	}
}

abstract class NonEmptyPath extends Path {
	public removeSync(options?: { recursive?: boolean }): void {
		Deno.removeSync(this.path, options);
	}

	public async remove(options?: { recursive?: boolean }): Promise<void> {
		await Deno.remove(this.path, options);
	}
}

export class FilePath extends NonEmptyPath {
	public readSync(): Uint8Array {
		return Deno.readFileSync(this.path);
	}
	public read(): Promise<Uint8Array> {
		return Deno.readFile(this.path);
	}

	public readTextSync(): string {
		return Deno.readTextFileSync(this.path);
	}
	public readText(): Promise<string> {
		return Deno.readTextFile(this.path);
	}

	public writeSync(data: Uint8Array | string, options?: Deno.WriteFileOptions): void {
		if (typeof data === 'string') {
			const encoder = new TextEncoder();
			data = encoder.encode(data);
		}
		fs_operate.makeParentDirSync(this.path);
		Deno.writeFileSync(this.path, data, options);
	}

	public async write(data: Uint8Array | string, options?: Deno.WriteFileOptions): Promise<void> {
		if (typeof data === 'string') {
			const encoder = new TextEncoder();
			data = encoder.encode(data);
		}
		await fs_operate.makeParentDir(this.path);
		await Deno.writeFile(this.path, data as Uint8Array, options);
	}
}

export class DirPath extends NonEmptyPath {
	public listSync(): Path[] {
		const entries: Path[] = [];
		for (const entry of Deno.readDirSync(this.path)) {
			entries.push(new Path(std_path.join(this.path, entry.name)));
		}
		return entries;
	}

	public async list(): Promise<Path[]> {
		const entries: Path[] = [];
		for await (const entry of Deno.readDir(this.path)) {
			entries.push(new Path(std_path.join(this.path, entry.name)));
		}
		return entries;
	}
}

export class SymlinkPath extends NonEmptyPath {
	public targetSync(): Path {
		return new Path(Deno.readLinkSync(this.path));
	}

	public async target(): Promise<Path> {
		return new Path(await Deno.readLink(this.path));
	}
}
