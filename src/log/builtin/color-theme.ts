import type { ColorTheme } from '../api.ts';

export const DefaultColorTheme: ColorTheme = {
	trace: '\x1b[36m', // cyan
	debug: '\x1b[34m', // blue
	info: '\x1b[32m', // green
	warn: '\x1b[33m', // yellow
	error: '\x1b[31m', // red
	fatal: '\x1b[35m', // magenta
	scope: '\x1b[37m', // white
	timestamp: '\x1b[90m', // gray
};

export const RESET_COLOR = '\x1b[0m';
