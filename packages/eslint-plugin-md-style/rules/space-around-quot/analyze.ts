import type { Text } from 'mdast'
import type { AddEditOptions, AnalyzeQuoteSpacingOptions, ExternalSpaceOptions, OuterSpacingEditOptions, QuoteBoundary, QuoteBoundaryOptions, QuoteEdit, QuoteGroup, QuoteMark, QuoteMarkEditsOptions, QuoteStyle } from './types'
import { containsCjk, containsHan, containsLatin, isHorizontalSpace, isLetterOrNumber, isLineBreak, isTrailingAsciiPunctuation } from '@/utils/character'
import { CLOSING_PAIRED_PUNCTUATION, isFullwidthPunctuation, OPENING_PAIRED_PUNCTUATION } from '@/utils/punctuation'

const OPEN_TO_CLOSE: Record<string, string> = { '“': '”', '‘': '’', '"': '"', '\'': '\'' }
const QUOTE_CHARS = new Set([...Object.keys(OPEN_TO_CLOSE), '”', '’'])

/**
 * Checks whether an odd run of backslashes escapes a source quote mark.
 */
function isEscaped(source: string, offset: number): boolean {
  let backslashes = 0
  for (let i = offset - 1; source[i] === '\\'; i--)
    backslashes++
  return backslashes % 2 === 1
}

/**
 * Pairs source quote marks in one Markdown text node. Scanning its source range
 * keeps offsets accurate when Markdown escapes or character references change
 * the length of the decoded text value. Apostrophes inside words are not quotes.
 */
export function parseQuoteGroups(node: Text, source: string): QuoteGroup[] {
  const start = node.position?.start.offset ?? 0
  const end = node.position?.end.offset ?? start + node.value.length
  const marks: QuoteMark[] = []
  let offset = start
  for (const char of source.slice(start, end)) {
    if (QUOTE_CHARS.has(char) && !isEscaped(source, offset))
      marks.push({ char, offset })
    offset += char.length
  }

  const stack: QuoteMark[] = []
  const groups: QuoteGroup[] = []
  for (const mark of marks) {
    const { char, offset } = mark
    if (char === '\'' && isLetterOrNumber(source[offset - 1] ?? '') && isLetterOrNumber(source[offset + 1] ?? ''))
      continue

    const top = stack.at(-1)
    if (top && OPEN_TO_CLOSE[top.char] === char) {
      stack.pop()
      groups.push({ open: top, close: mark, fullwidth: top.char === '“' || top.char === '‘' })
    }
    else if (char in OPEN_TO_CLOSE) {
      stack.push(mark)
    }
  }
  return groups
}

/**
 * Finds horizontal whitespace on one side of a quote without crossing a line
 * break or the containing Markdown node's source range.
 */
function boundary(source: string, offset: number, options: QuoteBoundaryOptions): QuoteBoundary | undefined {
  const { side, limit } = options
  let cursor = offset
  if (side === 'before') {
    while (cursor > limit && isHorizontalSpace(source[cursor - 1]))
      cursor--
    if (cursor <= limit || isLineBreak(source[cursor - 1]))
      return
    return { start: cursor, end: offset, neighbor: source[cursor - 1] }
  }
  while (cursor < limit && isHorizontalSpace(source[cursor]))
    cursor++
  if (cursor >= limit || isLineBreak(source[cursor]))
    return
  return { start: offset, end: cursor, neighbor: source[cursor] }
}

/**
 * Chooses external spacing from quote width and the visible neighboring mark.
 * Fullwidth punctuation and enclosing punctuation remain attached to quotes.
 */
function externalSpace(neighbor: string, fullwidth: boolean, options: ExternalSpaceOptions): string {
  const { side, spacing } = options
  if (QUOTE_CHARS.has(neighbor) || isFullwidthPunctuation(neighbor))
    return ''
  if (side === 'before' && OPENING_PAIRED_PUNCTUATION.has(neighbor))
    return ''
  if (side === 'after' && CLOSING_PAIRED_PUNCTUATION.has(neighbor))
    return ''
  if (side === 'after' && isTrailingAsciiPunctuation(neighbor))
    return ''
  if (fullwidth && side === 'before' && spacing.fullwidth === 'never' && containsHan(neighbor))
    return ' '
  return (fullwidth ? spacing.fullwidth : spacing.halfwidth) === 'always' ? ' ' : ''
}

/**
 * Selects Chinese marks for Chinese content and ASCII marks for English
 * content. Mixed or script-neutral content retains its existing quote style.
 */
function quoteStyle(group: QuoteGroup, source: string): QuoteStyle {
  const content = source.slice(group.open.offset + group.open.char.length, group.close.offset)
  if ([...content].some(char => QUOTE_CHARS.has(char)))
    return { fullwidth: group.fullwidth, open: group.open.char, close: group.close.char }
  const hasCjk = containsCjk(content)
  const hasLatin = containsLatin(content)
  if (hasCjk && !hasLatin)
    return { fullwidth: true, open: '“', close: '”' }
  if (hasLatin && !hasCjk && group.fullwidth)
    return { fullwidth: false, open: '"', close: '"' }
  return { fullwidth: group.fullwidth, open: group.open.char, close: group.close.char }
}

/**
 * Adds a changed source range only once, even when nested quotes share it.
 */
function addEdit(edits: Map<string, QuoteEdit>, source: string, options: AddEditOptions): void {
  const { start, end, text } = options
  if (source.slice(start, end) !== text)
    edits.set(`${start}:${end}`, { start, end, text })
}

function addQuoteMarkEdits(edits: Map<string, QuoteEdit>, group: QuoteGroup, options: QuoteMarkEditsOptions): void {
  const { source, style } = options
  addEdit(edits, source, {
    start: group.open.offset,
    end: group.open.offset + group.open.char.length,
    text: style.open,
  })
  addEdit(edits, source, {
    start: group.close.offset,
    end: group.close.offset + group.close.char.length,
    text: style.close,
  })
}

/**
 * Removes padding immediately inside the opening and closing marks.
 */
function addInnerPaddingEdits(edits: Map<string, QuoteEdit>, source: string, group: QuoteGroup): void {
  const openEnd = group.open.offset + group.open.char.length
  let contentStart = openEnd
  while (contentStart < group.close.offset && isHorizontalSpace(source[contentStart]))
    contentStart++
  addEdit(edits, source, { start: openEnd, end: contentStart, text: '' })

  let contentEnd = group.close.offset
  while (contentEnd > contentStart && isHorizontalSpace(source[contentEnd - 1]))
    contentEnd--
  addEdit(edits, source, { start: contentEnd, end: group.close.offset, text: '' })
}

function addOuterSpacingEdit(edits: Map<string, QuoteEdit>, offset: number, options: OuterSpacingEditOptions): void {
  const { source, side, limit, style, spacing } = options
  const adjacent = boundary(source, offset, { side, limit })
  if (adjacent) {
    const space = externalSpace(adjacent.neighbor, style.fullwidth, { side, spacing })
    addEdit(edits, source, { start: adjacent.start, end: adjacent.end, text: space })
  }
}

/**
 * Produces nonoverlapping source edits for matched quotes, including their
 * internal padding and the horizontal whitespace in their parent boundary.
 */
export function analyzeQuoteSpacing(node: Text, source: string, options: AnalyzeQuoteSpacingOptions): QuoteEdit[] {
  const { parentStart, parentEnd, spacing } = options
  const edits = new Map<string, QuoteEdit>()
  for (const group of parseQuoteGroups(node, source)) {
    const style = quoteStyle(group, source)
    addQuoteMarkEdits(edits, group, { source, style })
    addInnerPaddingEdits(edits, source, group)
    addOuterSpacingEdit(edits, group.open.offset, { source, side: 'before', limit: parentStart, style, spacing })
    addOuterSpacingEdit(edits, group.close.offset + group.close.char.length, { source, side: 'after', limit: parentEnd, style, spacing })
  }
  return mergeAdjacentEdits([...edits.values()].sort((a, b) => a.start - b.start || a.end - b.end))
}

/**
 * Joins touching edits so ESLint can apply quote replacement and padding
 * removal together without discarding either fix as an overlapping range.
 */
function mergeAdjacentEdits(edits: QuoteEdit[]): QuoteEdit[] {
  const merged: QuoteEdit[] = []
  for (const edit of edits) {
    const previous = merged.at(-1)
    if (previous && edit.start === previous.end) {
      previous.end = edit.end
      previous.text += edit.text
    }
    else if (!previous || edit.start >= previous.end) {
      merged.push({ ...edit })
    }
  }
  return merged
}
