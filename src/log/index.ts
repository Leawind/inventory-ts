/**
 * ```ts
 * import log from 'jsr:@leawind/inventory@^0/log'
 *
 * log.info`hello world`
 * ```
 *
 * @module log
 */

import { Logger, type LoggerApiMini } from './logger.ts';
export * from './logger.ts';

/**
 * Global logger
 */
const log: LoggerApiMini = Logger.createDefault().mini;
export default log;
