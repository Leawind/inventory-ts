/**
 * ```ts
 * import log from 'jsr:@leawind/inventory@^0/log'
 *
 * log.info`hello world`
 * ```
 *
 * @module log
 */

import { Logger } from './logger.ts';
export * from './logger.ts';

/**
 * Global logger
 */
export const log = Logger.createDefault();
export default log.mini;
