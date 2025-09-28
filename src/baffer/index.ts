import type { BytesProvider, ReadableBaffer, WritableBaffer } from './api.ts';
import { BafferImpl } from './impl.ts';

export type Baffer = ReadableBaffer & WritableBaffer;
export const Baffer = {
	create(capacity: number = 0) {
		return BafferImpl.create(capacity);
	},

	from(buffer: BytesProvider){
		const baffer = Baffer.create();
		baffer.write(buffer);
		return baffer;
	}
};

// export class Baffer {
// 	private constructor() {}
// }
