import { assert, assertEquals } from '@std/assert';
import { Logger } from './logger.ts';
import type { LogEntry, Transport } from './api.ts';

Deno.test('static', () => {
	{
		assert(Logger.isValidScopeName('foo'));
		assert(Logger.isValidScopeName('Hello/World'));
		assert(Logger.isValidScopeName('Hello World/with spaces'));
		assert(Logger.isValidScopeName('中文'));
	}

	{
		assertEquals(Logger.levelNumberOf(0), 0);
		assertEquals(Logger.levelNumberOf('info'), 0);
		assertEquals(Logger.levelNumberOf('warn'), 10);
		assertEquals(Logger.levelNumberOf(15), 15);
	}
	{
		assertEquals(Logger.levelNameOf('trace'), 'trace');
		assertEquals(Logger.levelNameOf('debug'), 'debug');
		assertEquals(Logger.levelNameOf('info'), 'info');
		assertEquals(Logger.levelNameOf('warn'), 'warn');
		assertEquals(Logger.levelNameOf('error'), 'error');
		assertEquals(Logger.levelNameOf('fatal'), 'fatal');

		assertEquals(Logger.levelNameOf(-20), 'trace');
		assertEquals(Logger.levelNameOf(-10), 'debug');
		assertEquals(Logger.levelNameOf(0), 'info');
		assertEquals(Logger.levelNameOf(10), 'warn');
		assertEquals(Logger.levelNameOf(20), 'error');
		assertEquals(Logger.levelNameOf(30), 'fatal');

		assertEquals(Logger.levelNameOf(5), 5);
	}
});

Deno.test('logger basic', () => {
	const log = Logger.create();
	assertEquals(log.api.getLevel(), 0);

	log.api.setLevel(10);
	assertEquals(log.api.getLevel(), 10);
});

Deno.test('logger scope inheritance', async (t) => {
	await t.step('no scope', () => {
		const log = Logger.create();
		assertEquals(log.getScope(), undefined);
		assertEquals(log.getScopeChain(), '');
	});
	await t.step('with scope', () => {
		const log = Logger.create();
		log.setScope('foo');
		assertEquals(log.getScope(), 'foo');
		assertEquals(log.getScopeChain(), 'foo');
	});
	await t.step('sub logger', () => {
		const log = Logger.create('foo');

		const sub = log.getSubLogger('bar');
		assertEquals(sub.getScope(), 'bar');
		assertEquals(sub.getScopeChain(), 'foo/bar');

		const subsub = sub.getSubLogger('baz');
		assertEquals(subsub.getScope(), 'baz');
		assertEquals(subsub.getScopeChain(), 'foo/bar/baz');

		sub.setScope('src');
		assertEquals(sub.getScope(), 'src');
		assertEquals(sub.getScopeChain(), 'foo/src');
		assertEquals(subsub.getScopeChain(), 'foo/src/baz');
	});
});

Deno.test('logger log', () => {
	const log = Logger.createDefault();
	log.api.setLevel('debug');
	log
		.trace('Level: trace')
		.debug('Level: debug')
		.info('Level: info')
		.warn('Level: warn')
		.error('Level: error')
		.fatal('Level: fatal');

	log.api.setLevel('error');
	log
		.trace`Level: trace`
		.debug`Level: debug`
		.info`Level: info`
		.warn`Level: warn`
		.error`Level: error`
		.fatal`Level: fatal`;
});

Deno.test('logger set formatter', () => {
	const log = Logger.createDefault();

	log.api.setFormatter({
		format(entry) {
			return `[${entry.level}] ${entry.data.join(' ')}`;
		},
	});

	log
		.trace('Level: trace')
		.debug('Level: debug')
		.info('Level: info')
		.warn('Level: warn')
		.error('Level: error')
		.fatal('Level: fatal');
});

Deno.test('logger with transports', () => {
	const log = Logger.create();

	class MemoryTransport implements Transport {
		logs: any[] = [];
		log(entry: LogEntry) {
			this.logs.push(entry);
		}
	}
	const transport = new MemoryTransport();
	log.api.transports.push(transport);
	log.api.setLevel('debug');

	log.info('Test message');

	assertEquals(transport.logs.length, 1);
	assertEquals(transport.logs[0].data[0], 'Test message');
});

Deno.test('logger error handling', () => {
	const log = Logger.createDefault();

	try {
		throw new Error('Test error message');
	} catch (e) {
		log.error('An error occurred:', e);
	}

	const error = new Error('Template string error');
	log.error`Error in template: ${error}`;

	log.error(new Error('Standalone error'));
});

Deno.test('logger multiple errors handling', () => {
	const log = Logger.createDefault();

	try {
		const error1 = new Error('First error');
		const error2 = new Error('Second error');

		log.error('Multiple errors occurred:', error1, 'and', error2);

		log.error`Errors in ${'component'}: ${error1} and ${error2}`;

		log.error(error1, error2);
	} catch (e) {
		log.error('Test failed:', e);
	}
});
