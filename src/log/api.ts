import type { Awaitable } from '@leawind/inventory/types';
import type { InverseAccess } from '../types/object.ts';

export const LEVEL_REGISTRY = {
	all: -2147483648,
	trace: -20,
	debug: -10,
	info: 0,
	warn: 10,
	error: 20,
	fatal: 30,
	none: 2147483647,
} as const;
export const SORTED_LEVELS = Object.entries(LEVEL_REGISTRY).sort((a, b) => a[1] - b[1]) as [LevelName, LevelNumber][];
export type LEVEL_REGISTRY = typeof LEVEL_REGISTRY;

export type LevelName = keyof LEVEL_REGISTRY;
export type LevelNumber = LEVEL_REGISTRY[LevelName];
export type LevelLike = LevelName | LEVEL_REGISTRY[LevelName] | number;

export type LevelNumberOf<T extends LevelLike> = T extends LevelName ? LEVEL_REGISTRY[T] : T;
export type LevelNameOf<T extends LevelLike> = T extends LevelName ? T
	: T extends LevelNumber ? InverseAccess<LEVEL_REGISTRY, T>
	: T extends number ? T
	: never;

export type LevelOf<T extends LevelLike> = T extends keyof LEVEL_REGISTRY ? LEVEL_REGISTRY[T] : T;

export type LogEntry = {
	timestamp: Date;
	scope: string;
	level: LevelLike;
	data: unknown[];
	useColors?: boolean;
	formatted?: string;
};

export interface Formatter {
	format(entry: LogEntry): string;
}

export abstract class BaseFormatter implements Formatter {
	protected constructor() {}
	format(entry: LogEntry): string {
		const { timestamp, scope, level, data } = entry;
		return `${timestamp.toISOString()} [${scope}] [${level}] ${data.join(' ')}`;
	}
}

export interface Transport {
	log(entry: LogEntry): Awaitable<void>;
}

export abstract class BaseTransport implements Transport {
	public formatter?: Formatter;
	protected constructor() {}

	public setFormatter(formatter: Formatter): this {
		this.formatter = formatter;
		return this;
	}

	protected getFormatted(entry: LogEntry): string | null {
		return this.formatter?.format(entry) ?? entry.formatted ?? null;
	}

	log(entry: LogEntry): Awaitable<void> {
		console.log(entry);
	}
}

export type ColorSeq = `\x1b[${number}m`;
export type ColorTheme = Partial<
	Record<LevelName, ColorSeq> & {
		scope: ColorSeq;
		timestamp: ColorSeq;
	}
>;
