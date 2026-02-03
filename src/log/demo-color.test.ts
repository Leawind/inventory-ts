import log from './index.ts';

Deno.test('log demo color', () => {
	// 设置日志级别为trace，以便看到所有级别
	log.api.setLevel('trace');

	// 测试不同级别的颜色输出
	log.trace`This is a trace message`;
	log.debug`This is a debug message`;
	log.info`This is an info message`;
	log.warn`This is a warn message`;
	log.error`This is an error message`;
	log.fatal`This is a fatal message`;

	// 测试禁用颜色
	log.api.useColors = false;
	log.info`This is a message without colors`;

	// 测试启用颜色
	log.api.useColors = true;
	log.info`This is a message with colors again`;

	// 测试带有作用域的日志
	const subLog = log.api.getSubLogger('demo');
	subLog.info`This is a message with scope`;
});
