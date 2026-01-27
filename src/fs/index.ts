import * as xtype from '../xtype/index.ts';

import * as basic from './basic.ts';
import * as operate from './operate.ts';
import * as path from './path.ts';
import * as temp from './temp.ts';
import * as utils from './utils.ts';
import * as walk from './walk.ts';

export default xtype.xorMerge(
	basic,
	operate,
	path,
	temp,
	utils,
	walk,
) as xtype.DiffProps<[
	typeof basic,
	typeof operate,
	typeof path,
	typeof temp,
	typeof utils,
	typeof walk,
]>;
