import type { ColorSeq, ColorTheme, LevelLike, LevelName, LogEntry } from '../api.ts';
import { BaseFormatter } from '../api.ts';
import { Logger } from '../logger.ts';
import { DefaultColorTheme, RESET_COLOR } from './color-theme.ts';

export class ColorFormatter extends BaseFormatter {
	public theme: ColorTheme = DefaultColorTheme;
	public useColors: boolean = true;

	constructor() {
		super();
	}
	public setTheme(theme: ColorTheme): this {
		this.theme = theme;
		return this;
	}
	override format(entry: LogEntry): string {
		const color = (color: ColorSeq | '', text: string): string => {
			if (entry.useColors || (entry.useColors ?? this.useColors)) {
				return color + text + (color ? RESET_COLOR : '');
			} else {
				return text;
			}
		};

		const timestampColor = this.theme.timestamp || '';
		const scopeColor = this.theme.scope || '';
		const levelColor = this.getLevelColor(entry.level);
		return [
			color(timestampColor, entry.timestamp.toISOString()),
			color(scopeColor, `[${entry.scope}]`),
			color(levelColor, `[${entry.level}]`),
			color(levelColor, `${entry.data.join(' ')}`),
			// entry.data.join(' '),
		].join(' ');
	}
	private getLevelColor(level: LevelLike): ColorSeq | '' {
		if (this.useColors) {
			return this.theme[Logger.levelNameOf(level) as LevelName] || '';
		}
		return '';
	}
}
