import type { AnyFunction, Constructor } from '@leawind/inventory/types';

/**
 * Three types of function:
 *
 * - **`normal`** - `const fn = function(){}`
 * - **`arrow`** - `const fn = ()=>{}`
 * - **`method`** - `const fn = { m(){} }.m`
 */
export type FunctionType = 'normal' | 'arrow' | 'method';

export function detectFunctionType<F extends AnyFunction | Constructor>(fn: F): FunctionType {
	if (Object.prototype.hasOwnProperty.call(fn, 'prototype')) {
		return 'normal';
	}

	const str = Function.prototype.toString.call(fn);
	if (str.startsWith('(') || /^[^(),.=>{}[]]+\s*=>\s*\{/.test(str)) {
		return 'arrow';
	}

	return 'method';
}
