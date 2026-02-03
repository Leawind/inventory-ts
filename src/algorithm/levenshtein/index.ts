export type OperationCosts = {
  delete: number
  insert: number
  replace: number
  swap: number
}

/**
 * The Damerau-Levenshtein Algorithm is an extension to the Levenshtein Algorithm which solves the
 * edit distance problem between a source string and a target string with the following operations:
 *
 * - Character Insertion
 * - Character Deletion
 * - Character Replacement
 * - Adjacent Character Swap
 *
 * Note that the adjacent character swap operation is an edit that may be applied when two adjacent
 * characters in the source string match two adjacent characters in the target string, but in
 * reverse order, rather than a general allowance for adjacent character swaps.
 *
 * This implementation allows the client to specify the costs of the various edit operations with
 * the restriction that the cost of two swap operations must not be less than the cost of a delete
 * operation followed by an insert operation. This restriction is required to preclude two swaps
 * involving the same character being required for optimality which, in turn, enables a fast dynamic
 * programming solution.
 *
 * The running time of the Damerau-Levenshtein algorithm is O(n*m) where n is the length of the
 * source string and m is the length of the target string. This implementation consumes O(n*m)
 * space.
 */
export function levenshtein(source: string, target: string, costs?: Partial<OperationCosts>): number {
  const cost = Object.assign({
    delete: 1,
    insert: 1,
    replace: 1,
    swap: 1,
  }, costs)

  // Required to facilitate the premise to the algorithm that two swaps of the same character are never required for optimality.
  if (2 * cost.swap < cost.insert + cost.delete) {
    throw new Error('Unsupported cost assignment')
  } else if (source.length === 0) {
    return target.length * cost.insert
  } else if (target.length === 0) {
    return source.length * cost.delete
  } else {
    /**
     * Table: the miminum cost of an edit from the substring `source[0..i]` to the substring `target[0..j]`.
     */
    const table: number[][] = new Array(source.length)
    for (let i = 0; i < source.length; i++) {
      table[i] = new Array(target.length).fill(0)
    }

    /**
     * Map: the index of the last occurrence of each character in the source string.
     */
    const sourceIndexByCharacter: Map<string, number> = new Map()
    if (source[0] !== target[0]) {
      table[0][0] = Math.min(cost.replace, cost.delete + cost.insert)
    }
    sourceIndexByCharacter.set(source[0], 0)

    for (let i = 1; i < source.length; i++) {
      const deleteDist = table[i - 1][0] + cost.delete
      const insertDist = (i + 1) * cost.delete + cost.insert
      const matchDist = i * cost.delete + (source[i] === target[0] ? 0 : cost.replace)
      table[i][0] = Math.min(deleteDist, insertDist, matchDist)
    }
    for (let j = 1; j < target.length; j++) {
      const deleteDist = (j + 1) * cost.insert + cost.delete
      const insertDist = table[0][j - 1] + cost.insert
      const matchDist = j * cost.insert + (source[0] === target[j] ? 0 : cost.replace)
      table[0][j] = Math.min(deleteDist, insertDist, matchDist)
    }
    for (let i = 1; i < source.length; i++) {
      let maxSourceLetterMatchIndex = source[i] === target[0] ? 0 : -1
      for (let j = 1; j < target.length; j++) {
        let matchDist = table[i - 1][j - 1]
        if (source[i] !== target[j]) {
          matchDist += cost.replace
        } else {
          maxSourceLetterMatchIndex = j
        }

        let swapDist: number
        const candidateSwapIndex = sourceIndexByCharacter.get(target[j])
        const jSwap = maxSourceLetterMatchIndex
        if (candidateSwapIndex !== undefined && jSwap !== -1) {
          const iSwap = candidateSwapIndex
          swapDist = (i - iSwap - 1) * cost.delete + (j - jSwap - 1) * cost.insert + cost.swap
          if (iSwap !== 0 || jSwap !== 0) {
            swapDist += table[Math.max(0, iSwap - 1)][Math.max(0, jSwap - 1)]
          }
        } else {
          swapDist = Infinity
        }

        table[i][j] = Math.min(
          table[i - 1][j] + cost.delete, // delete cost
          table[i][j - 1] + cost.insert, // insert cost
          matchDist,
          swapDist,
        )
      }
      sourceIndexByCharacter.set(source[i], i)
    }
    return table[source.length - 1][target.length - 1]
  }
}
