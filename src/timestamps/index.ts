type CharNumber = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
type Time60 = `${'' | 0 | 1 | 2 | 3 | 4 | 5}${CharNumber}`;
// hh:mm:ss
// hh:mm:ss.sss
export type PosTimestampExpr =
	| `${number}${'' | `.${number}`}`
	| `${number}:${number}${'' | `.${number}`}`
	| `${number}:${number}:${number}${'' | `.${number}`}`;
export type NegTimestampExpr = `-${PosTimestampExpr}`;
export type TimestampExpr = PosTimestampExpr | NegTimestampExpr;

/**
 * ### `number`
 *
 * `[-MS_MAX, 2*MS_MAX]`
 */
export type TimestampLike = TimestampExpr | number | Timestamp;

export type TimeSpanExpr =
	| [TimestampLike, TimestampLike]
	| { ss: TimestampLike; to: TimestampLike }
	| { ss: TimestampLike; du: TimestampLike };
export type TimeSpanLike = TimeSpanExpr | TimeSpan;

export type TimeSpansLike = TimeSpanLike[] | TimeSpans;

export class Timestamp {
	private static RGX_TIMESTAMP = /^(-|\+|)(\d+(:\d+)+)((,|\.)(\d+))?/;
	public static MS_MAX = 0x8000_0000;

	/**
	 * - `[0, MS_MAX]` Positive
	 * - `(MS_MAX, 2*MS_MAX]` Negative
	 */
	#msp: number;
	/**
	 * @param positive true for positive, false for negative
	 * @param msp in `[-MS_MAX, MS_MAX]`
	 */
	private constructor(msp: number) {
		if (Timestamp.MS_MAX * 2 < msp) {
			throw new Error(`ms out of range: ${Timestamp.MS_MAX * 2} < ${msp}`);
		} else if (msp < 0) {
			throw new Error(`ms out of range: ${msp} < 0`);
		}
		this.#msp = msp;
	}

	/** `[-MS_MAX, MS_MAX]` */
	public get ms(): number {
		return this.#msp <= Timestamp.MS_MAX ? this.#msp : this.#msp - 2 * Timestamp.MS_MAX;
	}

	/** `[0, 2*MS_MAX]` */
	public get msp(): number {
		return this.#msp;
	}

	public get sign(): 1 | -1 {
		return this.#msp > Timestamp.MS_MAX ? -1 : 1;
	}

	public negate(): Timestamp {
		return new Timestamp(Timestamp.MS_MAX * 2 - this.#msp);
	}

	public isPositive(): boolean {
		return this.#msp <= Timestamp.MS_MAX;
	}
	public isNegative(): boolean {
		return this.#msp > Timestamp.MS_MAX;
	}

	public isEdge(): boolean {
		return this.ms === 0;
	}

	/** Alias of `toString()` */
	public get str(): TimestampExpr {
		return this.toString() as TimestampExpr;
	}

	public toString(): string {
		const absMs = Math.abs(this.ms);

		const hh = Math.floor(absMs / 3600000)
			.toString()
			.padStart(2, '0');
		const mm = Math.floor((absMs % 3600000) / 60000)
			.toString()
			.padStart(2, '0');
		const ss = Math.floor((absMs % 60000) / 1000)
			.toString()
			.padStart(2, '0');
		const mmm = Math.floor(absMs % 1000)
			.toString()
			.padStart(3, '0');

		return `${this.isNegative() ? '-' : ''}${hh}:${mm}:${ss}.${mmm}`;
	}

	public clone(): Timestamp {
		return new Timestamp(this.#msp);
	}

	public add(other: TimestampLike): Timestamp {
		const that = Timestamp.from(other);
		const result = new Timestamp(this.msp + that.ms);
		if (result.isEdge() && this.sign !== result.sign) {
			return result.negate();
		} else {
			return result;
		}
	}
	public sub(other: TimestampLike): Timestamp {
		const that = Timestamp.from(other);
		if (this.sign !== that.sign) {
			throw new Error(`Can't sub with different sign: ${this} ${that}`);
		}
		return new Timestamp(this.msp - that.msp);
	}
	public static ms(v: TimestampLike): number {
		return Timestamp.from(v).ms;
	}
	public static str(v: TimestampLike): TimestampExpr {
		return Timestamp.from(v).str;
	}

	public static from(v: TimestampLike): Timestamp {
		if (v instanceof Timestamp) {
			return v;
		} else if (typeof v === 'number') {
			if (v <= -Timestamp.MS_MAX || Timestamp.MS_MAX * 2 < v) {
				throw new Error(`ms out of range: ${v}`);
			}
			if (v < 0) {
				v += 2 * Timestamp.MS_MAX;
			}
			return new Timestamp(v);
		} else {
			return Timestamp.parse(v);
		}
	}

	private static parse(expr: string): Timestamp {
		expr = expr.replace(/\s/, '');

		const match = Timestamp.RGX_TIMESTAMP.exec(expr);
		if (!match) {
			throw new Error(`Invalid time string: '${expr}'`);
		}

		// ['-12:34:56:78:90.12345', '-', '12:34:56:78:90', ':90', '.12345', '.', '12345', index: 0, input: '-12:34:56:78:90.12345', groups: undefined]
		const [_0, sign, cols, _3, _4, _5, mmm] = match;

		// hh:mm:ss
		const parts = cols!
			.split(':')
			.map((x) => parseInt(x))
			.slice(-4);

		while (parts.length < 4) {
			parts.unshift(0);
		}

		let ms = 0;

		ms += parts[0]! * 86400000;
		ms += parts[1]! * 3600000;
		ms += parts[2]! * 60000;
		ms += parts[3]! * 1000;
		ms += ~~mmm!;

		ms = sign === '-' ? -ms : ms;
		return Timestamp.from(ms);
	}

	public static END = Timestamp.from(Timestamp.MS_MAX * 2);
	public static LIMIT_POS = Timestamp.from(Timestamp.MS_MAX);
	public static LIMIT_NEG = Timestamp.from(1 - Timestamp.MS_MAX);
	public static BEGIN = Timestamp.from(0);
}

export class TimeSpan {
	#a: Timestamp;
	#b: Timestamp;

	constructor(ss: Timestamp, to: Timestamp) {
		this.#a = ss;
		this.#b = to;
	}
	public sameSign(): boolean {
		return this.#a.sign === this.#b.sign;
	}

	public get ss(): Timestamp {
		return this.#a;
	}

	public get to(): Timestamp {
		return this.#b;
	}
	/**
	 * @throws when [t, -t]
	 */
	public get du(): Timestamp {
		if (!this.sameSign()) {
			throw new Error(`Start and stop timestamp have different sign, can't calculate duration`);
		}
		return Timestamp.from(this.#b.msp - this.#a.msp);
	}
	public clone(): TimeSpan {
		return new TimeSpan(this.#a, this.#b);
	}

	public toString(): string {
		return `${this.#a} --> ${this.#b}`;
	}

	public inverse(): [TimeSpan, TimeSpan] {
		return [TimeSpan.head(this.#a), TimeSpan.tail(this.#b)];
	}

	public intersect(other: TimeSpan): TimeSpan | null {
		if (this.#b.msp <= other.#a.msp || this.#a.msp >= other.#b.msp) {
			return null;
		}
		return TimeSpan.from([Math.max(this.#a.msp, other.#a.msp), Math.min(this.#b.msp, other.#b.msp)]);
	}

	public exclude(other: TimeSpan): TimeSpan[] {
		if (other.#b.msp <= this.#a.msp || other.#a.msp >= this.#b.msp) {
			return [this];
		}

		if (this.#a.msp < other.#a.msp && this.#b.msp > other.#b.msp) {
			return [new TimeSpan(this.#a, other.#a), new TimeSpan(other.#b, this.#b)];
		}

		if (this.#a.msp === other.#a.msp) {
			return [new TimeSpan(other.#b, this.#b)];
		}
		if (this.#b.msp === other.#b.msp) {
			return [new TimeSpan(this.#a, other.#a)];
		}

		return [];
	}

	public merge(other: TimeSpan): TimeSpan[] {
		if (other.#b.msp < this.#a.msp || other.#a.msp > this.#b.msp) {
			return [this, other];
		}
		return [TimeSpan.from([Math.min(this.#a.msp, other.#a.msp), Math.max(this.#b.msp, other.#b.msp)])];
	}

	public static from(v: TimeSpanLike): TimeSpan {
		if (v instanceof TimeSpan) {
			// TimeSpan
			return v;
		} else if (Array.isArray(v)) {
			// [start, stop]
			const [a, b] = v;
			return new TimeSpan(Timestamp.from(a), Timestamp.from(b));
		} else if ('to' in v) {
			// {ss, to}
			return TimeSpan.from([v.ss, v.to]);
		} else {
			// {ss, du}
			const ss = Timestamp.from(v.ss);
			const du = Timestamp.from(v.du);
			if (du.isNegative()) {
				throw new Error(`Duration can't be negative: ${du}`);
			}
			const to = Timestamp.from(ss.msp + du.ms);
			return new TimeSpan(ss, to);
		}
	}

	public static FULL = new TimeSpan(Timestamp.BEGIN, Timestamp.END);

	public static head(ts: TimestampLike): TimeSpan {
		return TimeSpan.from([Timestamp.BEGIN, ts]);
	}
	public static tail(ts: TimestampLike): TimeSpan {
		return TimeSpan.from([ts, Timestamp.END]);
	}
}

export class TimeSpans {
	#spans: TimeSpan[];

	private constructor(spans: TimeSpan[] = []) {
		this.#spans = spans;
		TimeSpans.mergeOverlapsInplace(this.#spans);
	}

	public iter(): Iterable<TimeSpan> {
		return this.#spans.values();
	}

	public clone(): TimeSpans {
		return new TimeSpans(this.#spans);
	}

	public toString(): string {
		return `${TimeSpans.name}:\n` + [...this.iter()].map((span, i) => `  [${i}] ${span.toString()}`).join(',\n');
	}

	public inverse(): TimeSpans {
		return TimeSpans.FULL.exclude(this);
	}

	public with(span: TimeSpanLike): TimeSpans {
		const newSpan = TimeSpan.from(span);
		const newSpans = [...this.#spans, newSpan];
		return new TimeSpans(newSpans);
	}

	public merge(spans: TimeSpansLike): TimeSpans {
		const that = TimeSpans.from(spans);
		const allSpans = [...this.#spans, ...that.#spans];
		return new TimeSpans(allSpans);
	}

	public exclude(spans: TimeSpansLike): TimeSpans {
		const that = TimeSpans.from(spans);

		let resultSpans: TimeSpan[] = [...this.#spans];

		for (const otherSpan of that.iter()) {
			const newResult: TimeSpan[] = [];

			for (const span of resultSpans) {
				const exclusions = span.exclude(otherSpan);
				newResult.push(...exclusions);
			}

			resultSpans = newResult;
		}

		return new TimeSpans(resultSpans);
	}

	public intersect(spans: TimeSpansLike): TimeSpans {
		const that = TimeSpans.from(spans);
		const result: TimeSpan[] = [];

		for (const thisSpan of this.#spans) {
			for (const otherSpan of that.iter()) {
				const intersection = thisSpan.intersect(otherSpan);
				if (intersection) {
					result.push(intersection);
				}
			}
		}

		return new TimeSpans(result);
	}

	public static from(spans: TimeSpansLike): TimeSpans {
		if (spans instanceof TimeSpans) {
			return spans.clone();
		} else {
			const timeSpans = spans.map((span) => TimeSpan.from(span));
			return new TimeSpans(timeSpans);
		}
	}

	private static mergeOverlapsInplace(spans: TimeSpan[]) {
		spans.sort((a, b) => a.ss.msp - b.ss.msp);
		for (let i = 1; i < spans.length; i++) {
			const current = spans[i - 1]!;
			const next = spans[i]!;

			// If current span overlaps with next span, merge them
			if (current.to.msp >= next.ss.msp) {
				const span = TimeSpan.from([current.ss.msp, Math.max(current.to.msp, next.to.msp)]);
				spans.splice(i - 1, 2, span);
			}
		}
	}

	public static FULL = new TimeSpans([TimeSpan.FULL]);
}
