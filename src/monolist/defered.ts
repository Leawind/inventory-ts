import { MonoList } from './index.ts'

export class DeferedMonoList extends MonoList {
  readonly #length: number
  readonly #sign: number
  readonly #getter: (index: number) => number

  protected constructor(length: number, getter: (index: number) => number) {
    super()
    this.#length = length
    this.#getter = getter
    this.#sign = MonoList.findSign(length, getter)
  }

  public override get(index: number): number {
    return this.#getter(index)
  }

  public override sign(): number {
    return this.#sign
  }

  public override length(): number {
    return this.#length
  }

  public static linear(length: number): DeferedMonoList {
    return new DeferedMonoList(length, (i) => i)
  }

  public static exp(length: number): DeferedMonoList {
    return new DeferedMonoList(length, Math.exp)
  }

  public static squared(length: number): DeferedMonoList {
    return new DeferedMonoList(length, (i) => i * i)
  }

  public static of(length: number, getter: (index: number) => number): DeferedMonoList {
    return new DeferedMonoList(length, getter)
  }

  public static ofArray(list: number[]): DeferedMonoList {
    return new DeferedMonoList(list.length, (i) => list[i])
  }
}
