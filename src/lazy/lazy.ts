const NULL = Symbol('NULL_VALUE')

interface ILazy<T> {
  get(): T
  clear(): void
  isComputed(): boolean
}

export class Lazy<T> implements ILazy<T> {
  private value: T | typeof NULL = NULL
  public constructor(
    private readonly getter: () => T,
  ) {}

  public set(value: T) {
    this.value = value
  }

  public get(): T {
    if (this.value === NULL) {
      this.value = this.getter()
    }
    return this.value
  }

  public clear() {
    this.value = NULL
  }

  public isComputed(): boolean {
    return this.value !== NULL
  }

  public static of<T>(getter: () => T): Lazy<T> {
    return new Lazy(getter)
  }
  public static ofAsync<T>(getter: () => T | Promise<T>): LazyAsync<T> {
    return new LazyAsync(getter)
  }
}

export class LazyAsync<T> {
  private value: T | typeof NULL = NULL

  public constructor(
    private readonly getter: () => T | Promise<T>,
  ) {}

  public set(value: T) {
    this.value = value
  }

  public async get(): Promise<T> {
    if (this.value === NULL) {
      this.value = await this.getter()
    }
    return this.value
  }

  public clear() {
    this.value = NULL
  }

  public isComputed(): boolean {
    return this.value !== NULL
  }
}
