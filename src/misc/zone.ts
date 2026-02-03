export class Zone {
  #min: number
  #max: number
  public constructor(min: number, max: number) {
    this.#min = min
    this.#max = max
  }
  public get min(): number {
    return this.#min
  }
  public get max(): number {
    return this.#max
  }
  public get start(): number {
    return this.#min
  }
  public get end(): number {
    return this.#max
  }
  public get from(): number {
    return this.#min
  }
  public get to(): number {
    return this.#max
  }
  public get length(): number {
    return this.#max - this.#min
  }
  public get positive(): boolean {
    return this.#max > this.#min
  }
  public get nonnegative(): boolean {
    return this.#max >= this.#min
  }

  public intersect(zone: Zone): Zone {
    return new Zone(
      Math.max(this.#min, zone.#min),
      Math.min(this.#max, zone.#max),
    )
  }

  public union(zone: Zone): Zone {
    if (!this.hasIntersection(zone)) {
      throw `No intersection: ${this} and ${zone}`
    }
    return new Zone(
      Math.min(this.#min, zone.#min),
      Math.max(this.#max, zone.#max),
    )
  }

  public move(offset: number): Zone {
    return new Zone(this.#min + offset, this.#max + offset)
  }

  public hasIntersection(zone: Zone): boolean {
    return this.#min <= zone.#max && zone.#min <= this.#max
  }

  public in(zone: Zone): boolean {
    return zone.#min <= this.#min && this.#max <= zone.#max
  }

  public leftOf(zone: Zone): boolean {
    return this.#max <= zone.#min
  }

  public rightOf(zone: Zone): boolean {
    return this.#min >= zone.#max
  }

  public follows(zone: Zone): boolean {
    return this.#max === zone.#min
  }

  public toString(): string {
    return `Zone[${this.#min}, ${this.#max}]`
  }

  public toJs(): string {
    return `new Zone(${this.#min}, ${this.#max})`
  }
}
