/**
 * CoMap
 *
 * n to n mapping
 */
export class CoMap<A, B> {
  private readonly abb: Map<A, Set<B>> = new Map()
  private readonly baa: Map<B, Set<A>> = new Map()

  public clear(): this {
    this.abb.clear()
    this.baa.clear()
    return this
  }

  public isEmpty(): boolean {
    if (this.abb.size === 0 && this.baa.size === 0) {
      return true
    }
    for (const [_a, bb] of this.abb.entries()) {
      if (bb.size > 0) {
        return false
      }
    }
    for (const [_b, aa] of this.baa.entries()) {
      if (aa.size > 0) {
        return false
      }
    }
    return true
  }

  public sizeOfA(a: A): number {
    return this.abb.get(a)?.size || 0
  }

  public sizeOfB(b: B): number {
    return this.baa.get(b)?.size || 0
  }

  public get size(): number {
    let total = 0
    this.abb.forEach((bs) => (total += bs.size))
    return total
  }

  /**
   * delete a and all b associated with a
   */
  public deleteA(a: A): void {
    this.abb.get(a)?.forEach((b) => this.baa.get(b)?.delete(a))
    this.abb.delete(a)
  }

  /**
   * delete b and all a associated with b
   */
  public deleteB(b: B): void {
    this.baa.get(b)?.forEach((a) => this.abb.get(a)?.delete(b))
    this.baa.delete(b)
  }
  /**
   * delete a-b association
   */
  public deleteAB(a: A, b: B): void {
    const bb = this.abb.get(a)
    if (bb) {
      bb.delete(b)
      if (bb.size === 0) { this.abb.delete(a) }
    }
    const aa = this.baa.get(b)
    if (aa) {
      aa.delete(a)
      if (aa.size === 0) { this.baa.delete(b) }
    }
  }
  /**
   * iterate a-b association
   */
  public forEachAB(callbackfn: (a: A, b: B, comap: CoMap<A, B>) => void): void {
    this.abb.forEach((bb, a) => bb.forEach((b) => callbackfn(a, b, this)))
  }
  /**
   * iterate each b in a
   */
  public forEachBInA(a: A, callbackfn: (a: A, b: B, comap: CoMap<A, B>) => void): void {
    this.abb.get(a)?.forEach((b) => callbackfn(a, b, this))
  }

  /**
   * iterate each a in b
   */
  public forEachAInB(b: B, callbackfn: (a: A, b: B, comap: CoMap<A, B>) => void): void {
    this.baa.get(b)?.forEach((a) => callbackfn(a, b, this))
  }

  public *iterA(): Iterable<[A, Set<B>]> {
    for (const [a, bb] of this.abb.entries()) {
      if (bb) { yield [a, bb] }
    }
  }

  public *iterB(): Iterable<[B, Set<A>]> {
    for (const [b, aa] of this.baa.entries()) {
      if (aa) { yield [b, aa] }
    }
  }

  /**
   * get all associated b of a
   */
  public *iterBB(a: A): Iterable<B> {
    const bb = this.abb.get(a)
    if (bb) {
      for (const b of bb) {
        yield b
      }
    }
  }

  /**
   * get all associated a of b
   */
  public *iterAA(b: B): Iterable<A> {
    const aa = this.baa.get(b)
    if (aa) {
      for (const a of aa) {
        yield a
      }
    }
  }
}
