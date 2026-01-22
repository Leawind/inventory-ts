import * as std_fs from '@std/fs@1';
import * as std_path from '@std/path@1';
import { r } from '@/tstr/index.ts';
import { EnvManager } from '@/env-manager/index.ts';
import { cmd, collectStream, Uint8ArrayCollector } from './utils.ts';
export * from './utils.ts';

const ENV_PATH_SEPARATOR = Deno.build.os === 'windows' ? ';' : ':';

type WashCommand = (
	args: string[],
	stdout: WritableStream<Uint8Array>,
	stderr: WritableStream<Uint8Array>,
) => Promise<number>;

type Executable = {
	execute(): Promise<WashOutput>;
	toString(): string;
};

export class Wash {
	private static readonly encoder = new TextEncoder();
	private static readonly decoder = new TextDecoder();

	/**
	 * Current working directory for command execution
	 */
	public cwd: string = Deno.cwd();

	public stdout: boolean = true;
	public stderr: boolean = true;

	/**
	 * Environment variables manager
	 */
	public readonly env: EnvManager = EnvManager.platform();

	/**
	 * Custom registered commands
	 */
	public readonly commands: Map<string, WashCommand> = new Map();

	#omitExtutableExt: boolean = false;

	/**
	 * Set whether to omit executable file extensions on Windows
	 *
	 * ### Params
	 *
	 * - `v` Whether to omit executable extensions
	 */
	public omitExecutableExtOnWindows(v: boolean): this {
		this.#omitExtutableExt = v && Deno.build.os === 'windows';
		return this;
	}

	public constructor() {}

	/**
	 * Create a executable object
	 *
	 * Throws an error if the specified executable file is not found.
	 *
	 * ### Params
	 *
	 * - `name` Name of executable file
	 * - `args` The arguments to pass to the executable file
	 *
	 * ### Example
	 *
	 * ```ts
	 * const wash = Wash.default();
	 * const exe = wash.executable('node', '--version');
	 * const output = await exe.execute();
	 * console.log(output.stdout.utf8);
	 * ```
	 */
	public executable(exe: string, ...args: string[]): Executable {
		const exePath = this.findExecutableFile(exe);
		if (exePath === null) {
			throw new Error(r`Executable not found: ${exe}`);
		}

		return {
			execute: async () => {
				const child = new Deno.Command(exePath, {
					args,
					cwd: this.cwd,
					env: this.getEnvObject(),
					stdout: this.stdout ? 'piped' : 'null',
					stderr: this.stderr ? 'piped' : 'null',
				}).spawn();

				const [stdout, stderr] = await Promise.all([
					collectStream(child.stdout, (chunk) => Deno.stdout.write(chunk)),
					collectStream(child.stderr, (chunk) => Deno.stderr.write(chunk)),
				]);

				const { success, code, signal } = await child.status;
				return new WashOutput(success, code, signal, stdout, stderr);
			},
			toString: () => `${exePath} ${args.map(wrapArg).join(' ')}`,
		};

		function wrapArg(arg: string): string {
			if (arg.includes(' ') || arg.includes('"')) {
				arg = arg.replaceAll('"', '"');
				arg = `"${arg}"`;
			}
			return arg;
		}
	}

	/**
	 * Execute an executable file
	 *
	 * ### Params
	 *
	 * - `name` Name of executable file
	 * - `args` The arguments to pass to the executable file
	 *
	 * ### Returns
	 *
	 * An object represents the output of the execution
	 */
	public exec(exe: string, ...args: string[]): Promise<WashOutput> {
		return this.executable(exe, ...args).execute();
	}

	/**
	 * Generates a shell command string for the given executable and arguments.
	 *
	 * ### Params
	 *
	 * - `name` Name of executable file
	 * - `args` The arguments to pass to the command
	 *
	 * ### Example
	 *
	 * ```ts
	 * const wash = Wash.default();
	 * const commandString = wash.generateShellCommand('ls', '-la', '/home/user');
	 * // Returns something like: "/bin/ls -la /home/user"
	 * ```
	 */
	public generateShellCommand(exe: string, ...args: string[]): string {
		return this.executable(exe, ...args).toString();
	}

	/**
	 * Run a command
	 *
	 * ### Params
	 *
	 * - `name` The name of the command, can be:
	 *   - executable file
	 *   - custom command
	 *   - built-in command
	 * - `args` The arguments to pass to the command
	 *
	 * ### Returns
	 *
	 * An object represents the output of the command
	 */
	public async run(cmd: string, ...args: string[]): Promise<WashOutput> {
		const stdout = new Uint8ArrayCollector();
		if (this.stdout) {
			stdout.ondata = (chunk) => Deno.stdout.write(chunk);
		}

		const stderr = new Uint8ArrayCollector();
		if (this.stderr) {
			stderr.ondata = (chunk) => Deno.stderr.write(chunk);
		}

		try {
			return await this.exec(cmd, ...args);
		} catch (_err) {
			const command = this.commands.get(cmd);
			let code: number;
			if (command === undefined) {
				stderr.writable.getWriter().write(Wash.encoder.encode(r`Unrecognized command: ${cmd}`));
				code = 1;
			} else {
				code = await command(args, stdout.writable, stderr.writable);
			}
			return new WashOutput(code === 0, code, null, stdout.collect(), stderr.collect());
		}
	}

	/**
	 * Register custom commands
	 *
	 * ### Params
	 *
	 * - `commands` Record mapping command names to functions
	 */
	public registerCommand(commands: Record<string, WashCommand>): this;
	/**
	 * Register custom command
	 *
	 * - `name` Single command name
	 * - `command` Single command function
	 */
	public registerCommand(name: string, command: WashCommand): this;
	public registerCommand(
		...args:
			| [commands: Record<string, WashCommand>]
			| [name: string, command: WashCommand]
	): this {
		if (args.length === 1) {
			const [commands] = args;
			for (const [name, command] of Object.entries(commands)) {
				this.commands.set(name, command);
			}
		} else {
			const [name, command] = args;
			this.commands.set(name, command);
		}
		return this;
	}

	/**
	 * Register default built-in commands (cd, pwd, echo)
	 */
	public registerDefaultCommands(): this {
		const self = this as Wash;
		return this.registerCommand({
			cd(args, _stdout, stderr) {
				if (args.length === 0) {
					throw new Error('cd: missing argument');
				}
				const newWorkdir = std_path.resolve(self.cwd, args[0]);

				try {
					if (Deno.statSync(newWorkdir).isDirectory) {
						self.cwd = newWorkdir;
						return Promise.resolve(0);
					}
				} catch (err: unknown) {
					stderr.getWriter().write(Wash.encoder.encode(`${err}`));
					return Promise.resolve(1);
				}
				stderr.getWriter().write(Wash.encoder.encode(`No such file or directory: ${newWorkdir}`));
				return Promise.resolve(1);
			},
			pwd(_args, stdout, _stderr) {
				stdout.getWriter().write(Wash.encoder.encode(self.cwd));
				return Promise.resolve(0);
			},
			echo(args, stdout) {
				stdout.getWriter().write(Wash.encoder.encode(args.join(' ') + '\n'));
				return Promise.resolve(0);
			},
		});
	}

	/**
	 * Convert environment variables to a record object, with PATH properly formatted for the current OS
	 *
	 * ### Returns
	 *
	 * Record of environment variables
	 */
	public getEnvObject(): Record<string, string> {
		const records = this.env.toRecords();
		records.PATH = this.env.get('PATH')?.split(';').join(ENV_PATH_SEPARATOR) ?? '';
		return records;
	}

	/**
	 * Import environment variables from the parent process
	 */
	public importParentEnvs(): this {
		for (const [key, value] of Object.entries(Deno.env.toObject())) {
			this.env.set(key.toUpperCase(), value);
		}
		// PATH
		const path = this.env.get('PATH')?.split(ENV_PATH_SEPARATOR).join(';') ?? '';
		this.env.set('PATH', path);
		return this;
	}

	/**
	 * Get the list of paths in the PATH environment variable
	 *
	 * ### Returns
	 *
	 * Array of path strings
	 */
	public getPaths(): string[] {
		return this.env.get('PATH')?.split(';') ?? [];
	}

	/**
	 * Get the list of executable file extensions from PATHEXT environment variable
	 *
	 * ### Returns
	 *
	 * Array of file extension strings
	 */
	public getPathExts(): string[] {
		return this.env.get('PATHEXT')?.split(';') ?? [];
	}

	/**
	 * Find an executable file in the current directory or PATH directories
	 *
	 * ### Params
	 *
	 * - `name` Name of the executable to find
	 *
	 * ### Returns
	 *
	 * Full path to the executable file, or null if not found
	 */
	public findExecutableFile(name: string): string | null {
		try {
			if (std_fs.existsSync(name)) {
				if (Deno.statSync(name).isFile) {
					return name;
				}
			}

			const dirs = [this.cwd, ...this.getPaths()];
			for (const dir of dirs) {
				const path = std_path.join(dir, name);
				if (this.#omitExtutableExt) {
					for (const ext of this.getPathExts()) {
						const pathext = path + ext;
						if (std_fs.existsSync(pathext)) {
							if (Deno.statSync(pathext).isFile) {
								return pathext;
							}
						}
					}
				} else {
					if (std_fs.existsSync(path)) {
						if (Deno.statSync(path).isFile) {
							return path;
						}
					}
				}
			}
		} catch { /* ignore */ }
		return null;
	}

	/**
	 * Execute a command using template string syntax
	 *
	 * ### Params
	 *
	 * - `strs` Template strings array
	 * - `intercepts` Template values
	 *
	 * ### Returns
	 *
	 * Promise resolving to command output
	 *
	 * ### Example
	 *
	 * ```ts
	 * const e = Wash.default().e;
	 * await e`echo Hello World`;
	 * ```
	 */
	public e(strs: TemplateStringsArray, ...intercepts: unknown[]): Promise<WashOutput> {
		const [command, ...args] = cmd(strs, ...intercepts);
		return this.run(command, ...args);
	}

	/**
	 * Create a Wash instance with default configuration
	 *
	 * Includes default commands, parent environment variables, and Windows executable extension handling
	 *
	 * ### Returns
	 *
	 * Configured Wash instance
	 */
	public static default(): Wash {
		return new Wash()
			.registerDefaultCommands()
			.importParentEnvs()
			.omitExecutableExtOnWindows(true);
	}
}

class WashOutput {
	public readonly stdout: WashOutputData;
	public readonly stderr: WashOutputData;

	public constructor(
		public readonly success: boolean,
		public readonly code: number,
		public readonly signal: Deno.Signal | null,
		stdout: Uint8Array,
		stderr: Uint8Array,
	) {
		this.stdout = new WashOutputData(stdout);
		this.stderr = new WashOutputData(stderr);
	}

	public static success(): WashOutput {
		return new WashOutput(true, 0, null, new Uint8Array(), new Uint8Array());
	}
}

class WashOutputData {
	public constructor(public array: Uint8Array) {}
	private static decoder = new TextDecoder();
	public get utf8(): string {
		return WashOutputData.decoder.decode(this.array);
	}
}
