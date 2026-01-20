import * as xtype from '../xtype/index.ts';

import * as utils from './utils.ts';
import * as basic from './basic.ts';
import * as walk from './walk.ts';
import * as operate from './operate.ts';

export default xtype.xorMerge(utils, basic, walk, operate) as xtype.DiffProps<[
	typeof utils,
	typeof basic,
	typeof walk,
	typeof operate,
]>;
