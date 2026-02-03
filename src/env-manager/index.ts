export class EnvManager {
  protected map: Map<string, string> = new Map()

  public constructor(
    private keyNormalizer: (key: string) => string = (key) => key,
  ) {}

  /**
   * Get the value of an environment variable
   *
   * ### Params
   *
   * - `key` The name of the environment variable
   *
   * ### Returns
   *
   * The value of the environment variable, or an empty string if not found
   */
  public get(key: string): string {
    return this.map.get(this.keyNormalizer(key)) ?? ''
  }

  /**
   * Set the value of an environment variable
   *
   * ### Params
   *
   * - `key` The name of the environment variable
   * - `value` The value to set
   *
   * If the value is an empty string, the variable will be removed.
   */
  public set(key: string, value: string): void {
    if (value === '') {
      this.remove(key)
    } else {
      this.map.set(this.keyNormalizer(key), value)
    }
  }

  /**
   * Set the value of an environment variable with expansion
   *
   * ### Params
   *
   * - `key` The name of the environment variable
   * - `value` The value to set, which will be expanded
   *
   * Supported expansion formats: `$VAR`, `${VAR}`, `%VAR%`
   */
  public setExpand(key: string, value: string): void {
    this.set(key, this.expand(value))
  }

  /**
   * Remove an environment variable
   *
   * ### Params
   *
   * - `key` The name of the environment variable to remove
   */
  public remove(key: string): void {
    this.map.delete(this.keyNormalizer(key))
  }

  /**
   * Clear all environment variables
   */
  public clear(): void {
    this.map.clear()
  }

  /**
   * Expand environment variable references in a string
   *
   * Supported expansion formats: `$VAR`, `${VAR}`, `%VAR%`
   *
   * ### Params
   *
   * - `value` The string to expand
   *
   * ### Returns
   *
   * The expanded string
   */
  public expand(value: string): string {
    const regexps = [
      /%(\p{ID_Start}\p{ID_Continue}*)%/gu,
      /\$\{(\p{ID_Start}\p{ID_Continue}*)\}/gu,
      /\$(\p{ID_Start}\p{ID_Continue}*)/gu,
    ]

    for (const rgx of regexps) {
      const matches = [...value.matchAll(rgx) ?? []].reverse()
      for (const match of matches) {
        const [raw, key] = match

        value = [
          value.slice(0, match.index),
          this.get(key) ?? '',
          value.slice(match.index + raw.length),
        ].join('')
      }
    }

    return value
  }

  /**
   * Convert the environment variables to a record object
   *
   * ### Returns
   *
   * A record containing all environment variables
   */
  public toRecords(): Record<string, string> {
    return Object.fromEntries(this.map)
  }

  /**
   * Create a case-sensitive environment manager
   *
   * ### Returns
   *
   * A new EnvManager instance with case-sensitive key handling
   */
  public static caseSensitive(): EnvManager {
    return new EnvManager((s) => s)
  }

  /**
   * Create a case-insensitive environment manager
   *
   * ### Returns
   *
   * A new EnvManager instance with case-insensitive key handling (keys converted to uppercase)
   */
  public static caseInsensitive(): EnvManager {
    return new EnvManager((s) => s.toUpperCase())
  }

  /**
   * Create a platform-appropriate environment manager
   *
   * - On Windows, returns a case-insensitive manager.
   * - On other platforms, returns a case-sensitive manager.
   *
   * ### Returns
   *
   * A new EnvManager instance appropriate for the current platform
   */
  public static platform(): EnvManager {
    return Deno.build.os === 'windows' ? EnvManager.caseInsensitive() : EnvManager.caseSensitive()
  }
}
