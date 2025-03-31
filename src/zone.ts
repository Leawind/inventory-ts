export class Zone {
	#min: number;
	#max: number;
	public constructor(min: number, max: number) {
		this.#min = min;
		this.#max = max;
	}
	public get min() {
		return this.#min;
	}
	public get max() {
		return this.#max;
	}
	public get start() {
		return this.#min;
	}
	public get end() {
		return this.#max;
	}
	public get from() {
		return this.#min;
	}
	public get to() {
		return this.#max;
	}
	public get length() {
		return this.#max - this.#min;
	}
	public get positive() {
		return this.#max > this.#min;
	}
	public get nonnegative() {
		return this.#max >= this.#min;
	}

	public intersect(zone: Zone): Zone {
		return new Zone(
			Math.max(this.#min, zone.#min),
			Math.min(this.#max, zone.#max),
		);
	}

	public union(zone: Zone): Zone {
		if (!this.hasIntersection(zone)) {
			throw `No intersection: ${this} and ${zone}`;
		}
		return new Zone(
			Math.min(this.#min, zone.#min),
			Math.max(this.#max, zone.#max),
		);
	}

	public move(offset: number): Zone {
		return new Zone(this.#min + offset, this.#max + offset);
	}

	public hasIntersection(zone: Zone): boolean {
		return this.#min <= zone.#max && zone.#min <= this.#max;
	}

	public in(zone: Zone): boolean {
		return zone.#min <= this.#min && this.#max <= zone.#max;
	}

	public leftOf(zone: Zone): boolean {
		return this.#max <= zone.#min;
	}

	public rightOf(zone: Zone): boolean {
		return this.#min >= zone.#max;
	}

	public follows(zone: Zone): boolean {
		return this.#max === zone.#min;
	}

	public toString(): string {
		return `Zone[${this.#min}, ${this.#max}]`;
	}

	public toJs(): string {
		return `new Zone(${this.#min}, ${this.#max})`;
	}
}
