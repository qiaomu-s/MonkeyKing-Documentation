export interface BalancedRange {
  readonly start: number
  readonly end: number
}

function maskedCharacter(character: string): string {
  return character === '\n' || character === '\r' ? character : ' '
}

export function maskNonCode(source: string): string {
  const output = source.split('')
  let index = 0
  let blockCommentDepth = 0
  let quote: "'" | '"' | null = null
  let rawString = false

  const mask = (position: number): void => {
    output[position] = maskedCharacter(source[position] ?? '')
  }

  while (index < source.length) {
    const current = source[index]
    const next = source[index + 1]
    const nextTwo = source.slice(index, index + 3)

    if (blockCommentDepth > 0) {
      if (current === '/' && next === '*') {
        mask(index)
        mask(index + 1)
        blockCommentDepth += 1
        index += 2
        continue
      }
      if (current === '*' && next === '/') {
        mask(index)
        mask(index + 1)
        blockCommentDepth -= 1
        index += 2
        continue
      }
      mask(index)
      index += 1
      continue
    }

    if (rawString) {
      if (nextTwo === '"""') {
        mask(index)
        mask(index + 1)
        mask(index + 2)
        rawString = false
        index += 3
        continue
      }
      mask(index)
      index += 1
      continue
    }

    if (quote !== null) {
      if (current === '\\') {
        mask(index)
        if (index + 1 < source.length) mask(index + 1)
        index += 2
        continue
      }
      mask(index)
      if (current === quote) quote = null
      index += 1
      continue
    }

    if (current === '/' && next === '/') {
      mask(index)
      mask(index + 1)
      index += 2
      while (index < source.length && source[index] !== '\n') {
        mask(index)
        index += 1
      }
      continue
    }

    if (current === '/' && next === '*') {
      mask(index)
      mask(index + 1)
      blockCommentDepth = 1
      index += 2
      continue
    }

    if (nextTwo === '"""') {
      mask(index)
      mask(index + 1)
      mask(index + 2)
      rawString = true
      index += 3
      continue
    }

    if (current === "'" || current === '"') {
      quote = current
      mask(index)
      index += 1
      continue
    }

    index += 1
  }

  return output.join('')
}

/**
 * Masks comments while preserving strings and character literals. This is
 * useful when the caller still needs to inspect string-valued declarations.
 * The returned text always has the same length and line structure as source.
 */
export function maskComments(source: string): string {
  const output = source.split('')
  let index = 0
  let blockCommentDepth = 0
  let quote: "'" | '"' | null = null
  let rawString = false

  const mask = (position: number): void => {
    output[position] = maskedCharacter(source[position] ?? '')
  }

  while (index < source.length) {
    const current = source[index]
    const next = source[index + 1]
    const nextTwo = source.slice(index, index + 3)

    if (blockCommentDepth > 0) {
      if (current === '/' && next === '*') {
        mask(index)
        mask(index + 1)
        blockCommentDepth += 1
        index += 2
        continue
      }
      if (current === '*' && next === '/') {
        mask(index)
        mask(index + 1)
        blockCommentDepth -= 1
        index += 2
        continue
      }
      mask(index)
      index += 1
      continue
    }

    if (rawString) {
      if (nextTwo === '"""') {
        rawString = false
        index += 3
        continue
      }
      index += 1
      continue
    }

    if (quote !== null) {
      if (current === '\\') {
        index += Math.min(2, source.length - index)
        continue
      }
      if (current === quote) quote = null
      index += 1
      continue
    }

    if (current === '/' && next === '/') {
      mask(index)
      mask(index + 1)
      index += 2
      while (index < source.length && source[index] !== '\n') {
        mask(index)
        index += 1
      }
      continue
    }

    if (current === '/' && next === '*') {
      mask(index)
      mask(index + 1)
      blockCommentDepth = 1
      index += 2
      continue
    }

    if (nextTwo === '"""') {
      rawString = true
      index += 3
      continue
    }

    if (current === "'" || current === '"') {
      quote = current
    }
    index += 1
  }

  return output.join('')
}

export function findBalancedRange(
  source: string,
  start: number,
  openCharacter: string,
  closeCharacter: string,
): BalancedRange {
  if (source[start] !== openCharacter) {
    throw new Error(
      `Expected ${JSON.stringify(openCharacter)} at offset ${start}, ` +
        `received ${JSON.stringify(source[start])}.`,
    )
  }

  const masked = maskNonCode(source)
  let depth = 0

  for (let index = start; index < masked.length; index += 1) {
    if (masked[index] === openCharacter) depth += 1
    if (masked[index] !== closeCharacter) continue

    depth -= 1
    if (depth === 0) return { start, end: index }
  }

  throw new Error(
    `Unclosed ${JSON.stringify(openCharacter)} at offset ${start}.`,
  )
}

export function splitTopLevel(source: string, delimiter: string): string[] {
  if (delimiter.length !== 1) {
    throw new Error('splitTopLevel only accepts a single-character delimiter.')
  }

  const masked = maskNonCode(source)
  const depth = { round: 0, square: 0, curly: 0 }
  const parts: string[] = []
  let partStart = 0

  for (let index = 0; index < masked.length; index += 1) {
    switch (masked[index]) {
      case '(':
        depth.round += 1
        break
      case ')':
        depth.round -= 1
        break
      case '[':
        depth.square += 1
        break
      case ']':
        depth.square -= 1
        break
      case '{':
        depth.curly += 1
        break
      case '}':
        depth.curly -= 1
        break
      default:
        break
    }

    if (
      masked[index] === delimiter &&
      depth.round === 0 &&
      depth.square === 0 &&
      depth.curly === 0
    ) {
      parts.push(source.slice(partStart, index).trim())
      partStart = index + 1
    }
  }

  const finalPart = source.slice(partStart).trim()
  if (finalPart.length > 0 || parts.length > 0) parts.push(finalPart)
  return parts.filter((part) => part.length > 0)
}

export function lineNumberAt(source: string, offset: number): number {
  return source.slice(0, offset).split('\n').length
}
