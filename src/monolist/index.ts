export abstract class MonoList {
	public abstract get(index: number): number;
	public abstract sign(): number;
	public abstract length(): number;

	public nearestIndex(value: number): number {
		let ileft = 0;
		let iright = this.length() - 1;
		let icenter = Math.floor(this.length() / 2);

		while (true) {
			const vcenter = this.get(icenter);
			if (vcenter < value) {
				ileft = icenter;
			} else if (vcenter > value) {
				iright = icenter;
			} else {
				return icenter;
			}
			if (iright - ileft === 1) {
				break;
			}
			icenter = Math.floor((ileft + iright) / 2);
		}

		const leftGap = value - this.get(ileft);
		const rightGap = this.get(iright) - value;
		if (leftGap < rightGap) {
			return ileft;
		} else if (leftGap > rightGap) {
			return iright;
		} else if (this.sign() >= 0) {
			return iright;
		} else {
			return ileft;
		}
	}

	public nearestValue(value: number): number {
		return this.get(this.nearestIndex(value));
	}

	public offsetValue(value: number, offset: number): number {
		const i = this.nearestIndex(value) + offset * this.sign();
		return this.get(this.clampIndex(i));
	}

	public nextValue(value: number): number {
		return this.offsetValue(value, 1);
	}

	public previousValue(value: number): number {
		return this.offsetValue(value, -1);
	}

	// Others

	public toArray(): number[] {
		const list: number[] = [];
		for (let i = 0; i < this.length(); i++) {
			list.push(this.get(i));
		}
		return list;
	}

	protected clampIndex(i: number): number {
		return Math.max(0, Math.min(i, this.length() - 1));
	}

	protected static isMono(sign: number, array: number[]): boolean {
		for (let i = 1; i < array.length; i++) {
			const s = Math.sign(array[i] - array[i - 1]);
			if (s !== 0 && s !== sign) {
				return false;
			}
		}
		return true;
	}

	protected static findSign(array: number[]): number;
	protected static findSign(length: number, getter: (index: number) => number): number;
	protected static findSign(
		...args:
			| [array: number[]]
			| [length: number, getter: (index: number) => number]
	): number {
		switch (args.length) {
			case 1: {
				const [array] = args;
				for (let i = 1; i < array.length; i++) {
					const s = Math.sign(array[i] - array[i - 1]);
					if (s !== 0) {
						return s;
					}
				}
				return 0;
			}
			case 2: {
				const [length, getter] = args;
				for (let i = 1; i < length; i++) {
					const s = Math.sign(getter(i) - getter(i - 1));
					if (s !== 0) {
						return s;
					}
				}
				return 0;
			}
		}
	}
}
