import type { TemplateStringArgs } from '../types/index.ts'
import type {
  Formatter,
  LevelLike,
  LevelName,
  LevelNameOf,
  LevelOf as LevelNumberOf,
  LogEntry,
  Transport,
} from './api.ts'
import { LEVEL_REGISTRY } from './api.ts'
import { interleave } from '../tstr/index.ts'
import type { Patch } from '../types/object.ts'
import { ColorFormatter } from './builtin/formatter.ts'
import { CliTransport } from './builtin/transport.ts'

function override<T extends object, S extends object>(target: T, source: S): Patch<T, S> {
  return new Proxy(target, {
    get(_target, prop) {
      if (prop in source) {
        return source[prop as keyof S]
      } else {
        return target[prop as keyof T]
      }
    },
  }) as unknown as Patch<T, S>
}

type FnLog = {
  /**
   * @see {@link LEVEL_REGISTRY}
   *
   * @example
   * ```ts
   * log.info`Hello, ${name}`
   * log.info('Hello, '+ name)
   * ```
   */
  (strs: TemplateStringsArray, ...args: unknown[]): LoggerApiMini
  (...args: readonly unknown[]): LoggerApiMini
}
export type LogMethodName = Exclude<LevelName, 'all' | 'none'>
export type LogMethodOwner = Record<LogMethodName, FnLog>
// export type LoggerApiMini = Pick<Logger, 'api'> & Record<LogMethodName, FnLog>;
export type LoggerApiMini = Pick<Logger, LogMethodName | 'api'>
export type LoggerApi = Omit<Logger, 'api'>
export type SubLoggerApi = Patch<Logger, {
  getScope(): string
  setScope(scope: string): SubLoggerApi
}>
export class Logger implements LogMethodOwner {
  public Logger: typeof Logger = Logger

  public static isValidScopeName(scope: string): boolean {
    return /^[\p{ID_Start} ]+(\/[\p{ID_Start} ]+)*$/u.test(scope)
  }

  /**
   * Mini api for Logger, only contains methods for log level
   */
  public get mini(): LoggerApiMini {
    return this
  }
  /**
   * More api for Logger
   */
  public get api(): LoggerApi {
    return this
  }

  private scope?: string

  public getScopeChain(): string {
    return this.scope === undefined ? '' : this.scope
  }
  public getScope(): string | undefined {
    return this.scope
  }
  public setScope(scope?: string): this {
    if (scope !== undefined && !Logger.isValidScopeName(scope)) {
      throw new Error(`Invalid scope name: ${scope}`)
    }
    this.scope = scope
    return this
  }

  private level: number = LEVEL_REGISTRY.info
  private formatter: Formatter | null = null

  public getLevel(): number {
    return this.level
  }

  public setLevel(level: LevelLike): this {
    this.level = Logger.levelNumberOf(level)
    return this
  }

  public setFormatter(formatter: Formatter): this {
    this.formatter = formatter
    return this
  }

  /**
   * If not set, use the formatter's setting
   */
  public useColors?: boolean

  public transports: Transport[] = []

  private createSubLogger(scope: string): SubLoggerApi {
    if (!Logger.isValidScopeName(scope)) {
      throw new Error(`Invalid scope name: ${scope}`)
    }
    const parent = this as this
    const proxy = override(this, {
      getScopeChain(): string {
        if (scope === undefined) {
          return parent.getScopeChain()
        }
        return parent.getScopeChain() + '/' + scope
      },
      getScope(): string {
        return scope
      },
      setScope(newScope: string) {
        if (!Logger.isValidScopeName(newScope)) {
          throw new Error(`Invalid scope name: ${newScope}`)
        }
        scope = newScope
        return proxy
      },
    }) as unknown as SubLoggerApi
    return proxy
  }
  private subLoggers: Map<string, SubLoggerApi> = new Map()
  public getSubLogger(scope: string): SubLoggerApi {
    if (this.subLoggers.has(scope)) {
      return this.subLoggers.get(scope)!
    }
    const logger = this.createSubLogger(scope)
    this.subLoggers.set(scope, logger)
    return logger
  }

  private constructor(scope?: string) {
    this.scope = scope
  }

  private shouldLog(level: LevelLike): boolean {
    return Logger.levelNumberOf(level) >= this.level
  }

  private log(level: LevelLike, ...data: unknown[]): this {
    if (!this.shouldLog(level)) {
      return this
    }

    const entry: LogEntry = {
      scope: this.getScopeChain(),
      level: Logger.levelNameOf(level),
      data,
      timestamp: new Date(),
      useColors: this.useColors,
    }
    if (this.formatter) {
      entry.formatted = this.formatter.format(entry)
    }

    for (const transport of this.transports) {
      transport.log(entry)
    }

    return this
  }

  private defineLogMethod(self: Logger, level: LEVEL_REGISTRY[LevelName]): FnLog {
    function log(strs: TemplateStringsArray, ...args: readonly unknown[]): Logger
    function log(...args: unknown[]): Logger
    function log(...args: TemplateStringArgs | [...data: ReadonlyArray<unknown>]) {
      if (Logger.isTemplateStringArgs(args)) {
        const [strs, ...targs] = args
        // 优化模板字符串处理，保留原始类型信息
        const content = interleave(
          strs,
          targs.map((arg) => {
            if (arg instanceof Error) {
              return arg.stack || arg.message
            }
            return String(arg)
          }),
        ).join('')
        return self.log(level, content)
      } else {
        return self.log(level, ...args)
      }
    }
    return log
  }
  trace: FnLog = this.defineLogMethod(this, LEVEL_REGISTRY.trace)
  debug: FnLog = this.defineLogMethod(this, LEVEL_REGISTRY.debug)
  info: FnLog = this.defineLogMethod(this, LEVEL_REGISTRY.info)
  warn: FnLog = this.defineLogMethod(this, LEVEL_REGISTRY.warn)
  error: FnLog = this.defineLogMethod(this, LEVEL_REGISTRY.error)
  fatal: FnLog = this.defineLogMethod(this, LEVEL_REGISTRY.fatal)

  public parseLevel(levelLike: string | number): LevelLike {
    if (levelLike in LEVEL_REGISTRY) {
      return levelLike as LevelName
    }
    if (typeof levelLike === 'number') {
      return levelLike
    }
    throw new Error(`Unknown log level name: ${levelLike}`)
  }

  public static create(scope?: string): Logger {
    return new Logger(scope)
  }

  public static createDefault(scope?: string): Logger {
    const logger = Logger.create(scope)
    logger.setFormatter(new ColorFormatter())
    logger.transports.push(new CliTransport())
    return logger
  }

  private static isTemplateStringArgs(args: ReadonlyArray<unknown>): args is TemplateStringArgs {
    if (args.length === 0) {
      return false
    } else if (!Array.isArray(args[0])) {
      return false
    } else if (!('raw' in args[0])) {
      return false
    } else if (!Array.isArray(args[0].raw)) {
      return false
    } else {
      return true
    }
  }
  public static levelNumberOf<T extends LevelLike>(level: T): LevelNumberOf<T> {
    if (level in LEVEL_REGISTRY) {
      return LEVEL_REGISTRY[level as LevelName] as LevelNumberOf<T>
    }
    if (typeof level === 'number') {
      return level as LevelNumberOf<T>
    }
    throw new Error(`Unknown log level name: ${level}`)
  }
  public static levelNameOf<T extends LevelLike>(level: T): LevelNameOf<T> {
    for (const [name, value] of Object.entries(LEVEL_REGISTRY)) {
      if (value === level) {
        return name as LevelNameOf<T>
      }
    }
    return level as LevelNameOf<T>
  }
}
