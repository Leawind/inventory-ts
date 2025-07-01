import { MonoList } from './index.ts';

export class StaticMonoList extends MonoList {
	readonly #sign: number;
	readonly #array: number[];

	protected constructor(array: number[]) {
		super();
		this.#array = [...array];
		this.#sign = StaticMonoList.findSign(array);

		if (!StaticMonoList.isMono(this.#sign, this.#array)) {
			throw new Error('Invalid array');
		}
	}

	public get(i: number): number {
		return this.#array[i];
	}

	public sign(): number {
		return this.#sign;
	}

	public length(): number {
		return this.#array.length;
	}

	public static linear(length: number): StaticMonoList {
		return StaticMonoList.of(length, (i: number) => i);
	}

	public static exp(length: number): StaticMonoList {
		return StaticMonoList.of(length, (x: number) => Math.exp(x));
	}

	public static squared(length: number): StaticMonoList {
		return StaticMonoList.of(length, (i: number) => i * i);
	}

	public static of(length: number, getter: (i: number) => number): StaticMonoList;
	public static of(array: number[]): StaticMonoList;
	public static of(
		length: number,
		min: number,
		max: number,
		f: (x: number) => number,
		fInv: (x: number) => number,
	): StaticMonoList;
	public static of(
		...args:
			| [length: number, getter: (i: number) => number]
			| [array: number[]]
			| [length: number, min: number, max: number, f: (x: number) => number, fInv: (x: number) => number]
	) {
		switch (args.length) {
			case 2: {
				const [length, getter] = args;
				const list: number[] = new Array(length);
				for (let i = 0; i < length; i++) {
					list[i] = getter(i);
				}
				return new StaticMonoList(list);
			}
			case 1: {
				const [array] = args;
				return new StaticMonoList(array);
			}
			case 5: {
				const [length, min, max, f, fInv] = args;
				const xmin = fInv(min);
				const xstep = (fInv(max) - xmin) / length;
				return StaticMonoList.of(length, (i: number) => f(i * xstep + xmin));
			}
		}
	}
}
