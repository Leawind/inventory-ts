import { Deferred } from '../deferred/index.ts'

export interface IBasePeer {
  send(data: string): void
  onreceive(callback: (data: string) => void): void
}

export interface IUsefulPeer<Data, Key = string> {
  notify(key: Key, data?: Data): void
  listen(key: Key, callback: (event: Data) => void): void

  bind(key: Key, callback: (data: Data) => Promise<Data> | Data): void
  invoke(key: Key, data?: Data): Promise<Data>
}

export class BasePeerAdapter implements IUsefulPeer<string, string | number> {
  private listeners: {
    key: string | number
    callback: (data: string) => void
  }[] = []

  private bindings: Map<string | number, (data: string) => Promise<string> | string> = new Map()

  private invokations: Map<number, Deferred<string>> = new Map()
  private nextInvokationId = 0
  private getInvokationId(): number {
    return this.nextInvokationId++
  }

  public constructor(
    private base: IBasePeer,
  ) {
    this.base.onreceive(async (raw) => {
      const data = JSON.parse(raw)
      switch (data.type) {
        case 'notify': {
          for (const listener of this.listeners) {
            if (listener.key === data.key) {
              listener.callback(data.data)
            }
          }
          break
        }
        case 'invoke': {
          const binding = this.bindings.get(data.key)
          if (binding) {
            try {
              const result = await binding(data)
              this.base.send(JSON.stringify({
                type: 'return',
                id: data.id,
                ok: true,
                result,
              }))
            } catch (error: unknown) {
              this.base.send(JSON.stringify({
                type: 'return',
                id: data.id,
                ok: false,
                error,
              }))
            }
          } else {
            this.base.send(JSON.stringify({
              type: 'return',
              id: data.id,
              ok: false,
              key: data.key,
            }))
          }
          break
        }
        case 'return': {
          const deferred = this.invokations.get(data.id)
          if (deferred) {
            if (data.ok) {
              deferred.resolve(data.result)
            } else if ('error' in data) {
              deferred.reject(data.error)
            } else {
              deferred.reject(new Error(`Unrecognized invoke key: ${data.key}`))
            }
          }
          break
        }
      }
    })
  }

  public notify(key: string | number, data?: string): void {
    this.base.send(JSON.stringify({
      type: 'notify',
      key,
      data,
    }))
  }

  public listen(key: string | number, callback: (data: string) => void): void {
    this.listeners.push({ key, callback })
  }

  public bind(key: string | number, callback: (data: string) => Promise<string> | string): void {
    this.bindings.set(key, callback)
  }

  public invoke(key: string | number, data?: string | undefined): Promise<string> {
    const id = this.getInvokationId()
    const deferred = new Deferred<string>()
    this.invokations.set(id, deferred)

    this.base.send(JSON.stringify({
      type: 'invoke',
      id,
      key,
      data,
    }))

    return deferred
  }
}
