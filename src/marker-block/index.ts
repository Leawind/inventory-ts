export class MarkerBlock {
  private readonly startLine: string | RegExp
  private readonly endLine: string | RegExp

  private readonly startMatcher: (line: string) => boolean
  private readonly endMatcher: (line: string) => boolean

  /**
   * Creates a new MarkerBlock instance for detecting and manipulating content between markers.
   * @param options - Configuration for marker detection.
   */
  constructor(options: {
    /** Literal start marker string (used if `startPattern` not provided). */
    startLine: string | RegExp
    /** Literal end marker string (used if `endPattern` not provided). */
    endLine: string | RegExp
  }) {
    this.startLine = options.startLine
    this.endLine = options.endLine
    this.startMatcher = MarkerBlock.createMatcher(options.startLine)
    this.endMatcher = MarkerBlock.createMatcher(options.endLine)
  }

  /**
   * Creates a predicate function to test if a line matches the given pattern.
   * @param pattern - String for exact match or RegExp for pattern match.
   * @returns Function that takes a line and returns true if it matches.
   */
  private static createMatcher(pattern: string | RegExp): (line: string) => boolean {
    if (pattern instanceof RegExp) {
      return (line: string) => pattern.test(line)
    }
    return (line: string) => line === pattern
  }

  /**
   * Locates the start and end marker positions in the content.
   * @param content - The full text content to search.
   * @returns Object with startIndex, endIndex (inclusive), and found boolean.
   */
  private findMarkers(content: string): null | {
    before: string[]
    startLine: string
    content: string[]
    endLine: string
    after: string[]
  } {
    const lines = content.split('\n')
    const startIndex = lines.findIndex(this.startMatcher)
    if (startIndex === -1) {
      return null
    }
    // const result = {
    //   before: lines.slice(0, startIndex),
    //   startLine: lines[startIndex],
    //   content: [],
    //   endLine: '',
    //   after: [],
    // }

    const relativeEndIndex = lines.slice(startIndex).findIndex(this.endMatcher)
    if (relativeEndIndex === -1) {
      return null
    }
    const endIndex = startIndex + relativeEndIndex

    return {
      before: lines.slice(0, startIndex),
      startLine: lines[startIndex],
      content: lines.slice(startIndex + 1, endIndex),
      endLine: lines[endIndex],
      after: lines.slice(endIndex + 1),
    }
  }

  /**
   * Extracts the content between the markers (excluding the marker lines themselves).
   * @param content - The full text content.
   * @returns The inner content as a string, or null if markers not found.
   */
  public extract(content: string): string | null {
    const result = this.findMarkers(content)
    return result ? result.content.join('\n') : null
  }

  /**
   * Replaces the content between markers with new content.
   * @param content - The original full text content.
   * @param newInnerContent - The new content to place between markers.
   * @returns Object with updated content string and a boolean indicating if change occurred.
   */
  public replace(content: string, newInnerContent: string[] | string): string {
    const result = this.findMarkers(content)
    if (!result) {
      return content
    }
    const { before, startLine, endLine, after } = result

    const newLines = Array.isArray(newInnerContent) ? newInnerContent : [newInnerContent]

    return [...before, startLine, ...newLines, endLine, ...after].join('\n')
  }
}
