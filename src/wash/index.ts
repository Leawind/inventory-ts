import * as std_fs from 'jsr:@std/fs@1';
import * as std_path from 'jsr:@std/path@1';
import { cmd, collectStream, r, Uint8ArrayCollector } from './utils.ts';
export * from './utils.ts';

const ENV_PATH_SEPARATOR = Deno.build.os === 'windows' ? ';' : ':';

type WashCommand = (
	args: string[],
	stdout: WritableStream<Uint8Array>,
	stderr: WritableStream<Uint8Array>,
) => Promise<number>;

export class Wash {
	private static readonly encoder = new TextEncoder();
	private static readonly decoder = new TextDecoder();

	public cwd: string = Deno.cwd();
	public env: Map<string, string> = new Map();
	public commands: Map<string, WashCommand> = new Map();

	#omitExtutableExt: boolean = false;
	public omitExecutableExtOnWindows(v: boolean): this {
		this.#omitExtutableExt = v && Deno.build.os === 'windows';
		return this;
	}

	public constructor() {}

	/**
	 * Execute a executable file
	 *
	 * ### Params
	 *
	 * - `name` The name of the executable file
	 * - `args` The arguments to pass to the executable file
	 *
	 * ### Returns
	 *
	 * An object represents the output of the execution
	 */
	public async exec(name: string, ...args: string[]): Promise<WashOutput> {
		const executable = this.findExecutableFile(name);
		if (executable === null) {
			throw new Error(r`Executable not found: ${name}`);
		}

		const child = new Deno.Command(executable, {
			args,
			cwd: this.cwd,
			env: this.getEnvObject(),
			stdout: 'piped',
			stderr: 'piped',
		}).spawn();

		const [stdout, stderr] = await Promise.all([
			collectStream(child.stdout, (chunk) => Deno.stdout.write(chunk)),
			collectStream(child.stderr, (chunk) => Deno.stderr.write(chunk)),
		]);

		const { success, code, signal } = await child.status;
		return new WashOutput(success, code, signal, stdout, stderr);
	}

	/**
	 * Run a command
	 *
	 * ### Params
	 *
	 * - `name` The name of the command
	 * - `args` The arguments to pass to the command
	 *
	 * ### Returns
	 *
	 * An object represents the output of the command
	 */
	public async run(commandName: string, ...args: string[]): Promise<WashOutput> {
		const stdout = new Uint8ArrayCollector();
		stdout.ondata = (chunk) => Deno.stdout.write(chunk);

		const stderr = new Uint8ArrayCollector();
		stderr.ondata = (chunk) => Deno.stderr.write(chunk);

		try {
			return await this.exec(commandName, ...args);
		} catch (_err) {
			const command = this.commands.get(commandName);
			let code: number;
			if (command === undefined) {
				stderr.writable.getWriter().write(Wash.encoder.encode(r`Unrecognized command: ${commandName}`));
				code = 1;
			} else {
				code = await command(args, stdout.writable, stderr.writable);
			}
			return new WashOutput(code === 0, code, null, stdout.collect(), stderr.collect());
		}
	}

	public registerCommand(commands: Record<string, WashCommand>): this;
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

	public registerDefaultCommand(): this {
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

	public getEnvObject(): Record<string, string> {
		const obj = Object.fromEntries(this.env);
		obj.PATH = this.env.get('PATH')?.split(';').join(ENV_PATH_SEPARATOR) ?? '';
		return obj;
	}

	public importParentEnvs(): this {
		for (const [key, value] of Object.entries(Deno.env.toObject())) {
			this.env.set(key.toUpperCase(), value);
		}
		// PATH
		const path = this.env.get('PATH')?.split(ENV_PATH_SEPARATOR).join(';') ?? '';
		this.env.set('PATH', path);
		return this;
	}

	public getPaths(): string[] {
		return this.env.get('PATH')?.split(';') ?? [];
	}
	public getPathExts(): string[] {
		return this.env.get('PATHEXT')?.split(';') ?? [];
	}
	public findExecutableFile(name: string): string | null {
		const dirs = [this.cwd, ...this.getPaths()];
		for (const dir of dirs) {
			const path = std_path.join(dir, name);
			try {
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
			} catch { /* ignore */ }
		}
		return null;
	}

	public e(strs: TemplateStringsArray, ...intercepts: unknown[]): Promise<WashOutput> {
		const [command, ...args] = cmd(strs, ...intercepts);
		return this.run(command, ...args);
	}

	public static default(): Wash {
		return new Wash()
			.registerDefaultCommand()
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
