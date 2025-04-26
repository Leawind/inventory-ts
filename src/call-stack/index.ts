export class CallStackItem {
	private static readonly STACK_LINE_PATTERNS: ((line: string) => CallStackItem | null)[] = [
		(line: string) => {
			///    at Array.every (<anonymous>)
			const m = line.match(/^\s*at ([^(]+) \(<anonymous>\)$/);
			return !m ? null : this.of({
				caller: m[1],
			});
		},
		(line: string) => {
			///    at <anonymous>:1:26
			const m = line.match(/^\s*at <anonymous>:(\d+):(\d+)$/);
			return !m ? null : this.of({
				line: parseInt(m[1]),
				column: parseInt(m[2]),
			});
		},
		(line: string) => {
			///    at file:///D:/inventory-ts/src/index.test.ts:4:18
			const m = line.match(/^\s*at (([^)]+):(\d+):(\d+))$/);
			return !m ? null : this.of({
				url: new URL(m[2]),
				line: parseInt(m[3]),
				column: parseInt(m[4]),
			});
		},
		(line: string) => {
			///    at outerWrapped (ext:cli/40_test.js:123:20)
			const m = line.match(/^\s*at ([^(]+) \(([^)]+):(\d+):(\d+)\)$/);
			return !m ? null : this.of({
				caller: m[1],
				url: new URL(m[2]),
				line: parseInt(m[3]),
				column: parseInt(m[4]),
			});
		},
	];

	///    at file:///D:/inventory-ts/src/index.test.ts:4:18
	///    at outerWrapped (ext:cli/40_test.js:123:20)
	///    at new RedisClient (https://jsr.io/@iuioiua/redis/1.1.1/mod.ts:374:25)
	///    at Module.parseArgs (https://jsr.io/@std/cli/1.0.17/parse_args.ts:732:22)
	///    at Array.every (<anonymous>)
	///    at <anonymous>:1:26
	public static parse(line: string): CallStackItem | null {
		for (const pattern of this.STACK_LINE_PATTERNS) {
			const result = pattern(line);
			if (result) {
				return result;
			}
		}
		return null;
	}

	private static of(options: Partial<CallStackItem>): CallStackItem {
		return new CallStackItem(options.caller, options.url, options.line, options.column);
	}

	private constructor(
		/**
		 * Function name
		 */
		public readonly caller?: string,
		/**
		 * Source url
		 *
		 * `undefined` means `<anonymous>`
		 *
		 * Possible protocols:
		 *
		 * - `file:`
		 * - `ext:`
		 * - `https:`
		 * - `http:`
		 */
		public readonly url?: URL,
		/**
		 * Line number
		 */
		public readonly line?: number,
		/**
		 * Column number
		 */
		public readonly column?: number,
	) {}

	public get raw(): string {
		const pos = this.line ? `:${this.line}:${this.column}` : '';
		if (this.caller) {
			return `    at ${this.caller} (${this.url ?? '<anonymous>'}${pos})`;
		} else {
			return `    at ${this.url ?? '<anonymous>'}${pos}`;
		}
	}
}

/**
 * Get the call stack
 *
 * The stack in this function is excluded.
 */
export function getCallStack(): CallStackItem[] {
	const stack = new Error().stack?.split('\n') ?? [];
	const result: CallStackItem[] = [];

	for (let i = 0; i < stack.length; i++) {
		const item = CallStackItem.parse(stack[i]);
		if (item) {
			result.push(item);
		}
	}

	return result.slice(1);
}
