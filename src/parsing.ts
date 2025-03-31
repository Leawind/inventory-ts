export class StringParsingContext {
	/** The source string being parsed */
	src: string;
	/** The current position in the source string */
	pos: number;

	/**
	 * Creates a new ParseContext instance.
	 * @param src - The source string to parse
	 */
	constructor(src: string, pos: number = 0) {
		this.src = src;
		this.pos = pos;
	}

	/**
	 * Checks if there are remaining characters to parse.
	 * @returns true if there are more characters, false otherwise
	 */
	hasRemaining(): boolean {
		return this.pos < this.src.length;
	}

	/**
	 * Returns the remaining unparsed portion of the source string.
	 * @returns The substring from the current position to the end
	 */
	remaining(): string {
		return this.src.slice(this.pos);
	}

	/**
	 * Creates a new ParseContext instance with the remaining unparsed text.
	 * @returns A new ParseContext starting from the current position
	 */
	cloneRemaining(): StringParsingContext {
		return new StringParsingContext(this.remaining());
	}

	clone(): StringParsingContext {
		return new StringParsingContext(this.src, this.pos);
	}

	/**
	 * Looks ahead in the source string without advancing the position.
	 * @param length - The number of characters to peek
	 * @returns The substring of the specified length starting at the current position
	 */
	peek(length: number): string {
		return this.src.slice(this.pos, this.pos + length);
	}

	/**
	 * Advances the current position in the source string.
	 * @param length - The number of characters to advance
	 */
	step(length: number): void {
		this.pos += length;
	}

	/**
	 * Attempts to match the next portion of the source string against an expected pattern.
	 * @param expect - A string, RegExp, or array of string/RegExp to match against
	 * @param map - Optional function to transform the matched string
	 * @returns The matched string, transformed result, or array of matches if successful; null if no match
	 */
	expect(expect: string | RegExp): string | null;
	expect<T>(expect: string | RegExp, map: (s: string) => T): T | null;
	expect(expect: (string | RegExp)[]): string[] | null;
	expect<T>(
		expect: string | RegExp | (string | RegExp)[],
		map?: (s: string) => T,
	): string | T | string[] | null {
		if (typeof expect === 'string') {
			if (this.peek(expect.length) === expect) {
				this.step(expect.length);
				return map ? map(expect) : expect;
			}
		} else if (expect instanceof RegExp) {
			const match = this.remaining().match(expect);
			if (match !== null) {
				this.step(match[0].length);
				return map ? map(match[0]) : match[0];
			}
		} else if (Array.isArray(expect)) {
			const matches: string[] = [];
			const ctx = this.cloneRemaining();
			for (const e of expect) {
				const match = ctx.expect(e);
				if (match === null) {
					return null;
				}
				matches.push(match);
			}
			this.step(ctx.pos);
			return matches;
		}
		return null;
	}

	/**
	 * Skip whitespaces including \n
	 */
	skipWhitespace(): void {
		this.expect(/^\s*/m);
	}
}
