import * as std_path from '@std/path@1';
import { r } from '@/tstr/index.ts';

/**
 * Path string template
 *
 * ### Example
 *
 * ```ts
 * p`C:\Windows\System32`;      // 'C:\\Windows\\System32'
 * p`C:\\Windows\\System32`;    // 'C:\\Windows\\System32'
 * ```
 */
export function p(strs: TemplateStringsArray, ...args: unknown[]): string {
	return std_path.normalize(r(strs, ...args));
}
