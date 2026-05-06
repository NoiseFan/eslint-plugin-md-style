import type { PhrasingContent } from 'mdast'
import type {
  AdjacentTextContext,
  InlineElement,
  InlineElementSpaceIssue,
  PositionOptions,
  SpaceContext,
} from '../../types/inline-element'
import type { NodeContextReturnType } from '../ast'
import { hasChildren, isInlineElement } from '../ast'
import { getLikeAnchor } from './anchor'

export const INLINE_SPACE_MESSAGE_IDS = {
  missingSpaceBefore: 'missingSpaceBefore',
  missingSpaceAfter: 'missingSpaceAfter',
  multipleSpacesBefore: 'multipleSpacesBefore',
  multipleSpacesAfter: 'multipleSpacesAfter',
  multipleSpacesAfterPunctuation: 'multipleSpacesAfterPunctuation',
  unexpectedSpaceBefore: 'unexpectedSpaceBefore',
  unexpectedSpaceAfter: 'unexpectedSpaceAfter',
} as const

export const OPENING_PAIRED_PUNCTUATION = new Set(['(', '[', '{', '<', '（', '【', '《', '“', '‘'])
export const CLOSING_PAIRED_PUNCTUATION = new Set([')', ']', '}', '>', '）', '】', '》', '”', '’'])

/**
 * Checks whether the character is fullwidth punctuation.
 * @example `。` -> true
 * @example `,` -> false
 */
export function isFullwidthPunctuation(str: string | undefined): boolean {
  if (!str || str.length !== 1)
    return false
  return /^[\u3001-\u303F\uFE10-\uFE1F\uFE30-\uFE4F\uFF01-\uFF0F\uFF1A-\uFF20\uFF3B-\uFF40\uFF5B-\uFF65“”‘’…]$/u.test(str)
}

const HALFWIDTH_PUNCTUATION_RE = /^\p{P}$/u

/**
 * Checks whether the character is halfwidth punctuation.
 * @example `,` -> true
 * @example `，` -> false
 */
export function isHalfwidthPunctuation(str: string | undefined): boolean {
  if (!str || str.length !== 1)
    return false
  return str.charCodeAt(0) <= 0x7E && HALFWIDTH_PUNCTUATION_RE.test(str)
}

const DASH_PUNCTUATION_RE = /^[-\u2013\u2014\u2212]$/u

/**
 * Checks whether the character is hyphen-like punctuation.
 * @example `—` -> true
 * @example `.` -> false
 */
export function isDashPunctuation(str: string | undefined): boolean {
  if (!str || str.length !== 1)
    return false

  return DASH_PUNCTUATION_RE.test(str)
}

/**
 * Checks whether adjacent text is a custom container marker on the next line.
 *
 * @deprecated Temporary workaround to prevent space-between-link from reporting
 * false positives on custom containers. Remove this and handle the case in a
 * dedicated custom container rule when one exists.
 * @see https://vitepress.dev/guide/markdown#custom-containers
 * @example `\n:::` -> true
 * @example `\n::::` -> true
 * @example `:::` -> false
 */
export function isCustomContainerMarker(str: string | undefined): boolean {
  return /^[ \t]*\n[ \t]*:{3,}[ \t]*$/u.test(str || '')
}

const PUNCTUATION_RE = /^\p{P}$/u

/**
 * Checks whether the character is punctuation.
 * Covers fullwidth punctuation, halfwidth punctuation, and other Unicode punctuation characters.
 * @example `。` -> true
 * @example `$` -> false
 */
export function isPunctuation(str: string): boolean {
  if (!str || str.length !== 1)
    return false

  return PUNCTUATION_RE.test(str)
}

interface whiteSpaceReturn {
  count: number
  start: number
  end: number
}

/**
 * Gets the count and range of consecutive whitespace at the start or end of a string.
 * @example `  text`, `head` -> { count: 2, start: 0, end: 2 }
 * @example `text  `, `tail` -> { count: 2, start: 4, end: 6 }
 */
export function getWhiteSpace(str: string | undefined, position: PositionOptions = 'head'): whiteSpaceReturn {
  const defaultVal = { count: 0, start: 0, end: 0 }
  if (!str || str.length === 0)
    return defaultVal
  if (position === 'head') {
    const match = str.match(/^\s+/)
    if (!match || !match[0])
      return defaultVal
    return {
      count: match[0].length,
      start: 0,
      end: match[0].length,
    }
  }
  else {
    const match = str.match(/\s+$/)
    if (!match || match.index == null)
      return defaultVal
    return {
      count: match[0].length,
      start: match.index,
      end: str.length,
    }
  }
}

/**
 * Checks whether the start or end of a string is adjacent to punctuation.
 * @example `。 hello`, `head` -> true
 * @example `hello .`, `tail` -> true
 */
export function hasPunctuation(str: string | undefined, position: PositionOptions = 'head'): boolean {
  if (!str)
    return false
  str = str.trim()
  if (position === 'head') {
    return isPunctuation(str[0])
  }
  else {
    return isPunctuation(str[str.length - 1])
  }
}

/**
 * Gets the character adjacent to the start or end of a string.
 */
export function getAdjacentChar(str: string | undefined, position: PositionOptions): string | undefined {
  if (!str)
    return undefined

  str = str.trim()
  return position === 'head' ? str[0] : str[str.length - 1]
}

/**
 * Extracts the plain-text value of a phrasing node.
 * If the node does not expose `value`, recursively concatenates the text from its children.
 */
function getNodeValue(node: PhrasingContent | undefined): string | undefined {
  if (!node)
    return
  if ('value' in node)
    return node.value
  if (hasChildren(node)) {
    const value = node.children
      .map(getNodeValue)
      .join('')

    return value || undefined
  }
}

/**
 * Gets whitespace and punctuation information for text adjacent to a link or inline code node.
 */
export function getSpaceContext(nodeContext: NodeContextReturnType<PhrasingContent>): SpaceContext {
  const { prev, next } = nodeContext
  const prevValue = getNodeValue(prev)
  const nextValue = getNodeValue(next)

  return {
    prev: {
      value: prevValue,
      whiteSpace: getWhiteSpace(prevValue, 'tail'),
      hasPunctuation: hasPunctuation(prevValue, 'tail'),
      punctuationType: isFullwidthPunctuation(getAdjacentChar(prevValue, 'tail')) ? 'full' : 'half',
    },
    next: {
      value: nextValue,
      whiteSpace: getWhiteSpace(nextValue),
      hasPunctuation: hasPunctuation(nextValue),
      punctuationType: isFullwidthPunctuation(getAdjacentChar(nextValue, 'head')) ? 'full' : 'half',
    },
  }
}

/**
 * Validates whether a spacing run contains exactly one required space.
 */
export function validateSingleRequiredSpace<T extends string>(
  count: number,
  missingSpaceMessageId: T,
  multipleSpacesMessageId: T,
): T | undefined {
  if (count < 1)
    return missingSpaceMessageId
  if (count > 1)
    return multipleSpacesMessageId
}

/**
 * Validates spacing before an inline node when the previous character is punctuation.
 */
export function validateBeforePunctuation(
  context: AdjacentTextContext,
): InlineElementSpaceIssue | undefined {
  // opening paired punctuation
  if (OPENING_PAIRED_PUNCTUATION.has(getAdjacentChar(context.value, 'tail') || '')) {
    if (context.whiteSpace.count > 0)
      return INLINE_SPACE_MESSAGE_IDS.unexpectedSpaceBefore
    return
  }

  // hybrid
  if (context.punctuationType === 'half') {
    return validateSingleRequiredSpace(
      context.whiteSpace.count,
      INLINE_SPACE_MESSAGE_IDS.missingSpaceBefore,
      INLINE_SPACE_MESSAGE_IDS.multipleSpacesAfterPunctuation,
    )
  }

  if (context.whiteSpace.count > 0)
    return INLINE_SPACE_MESSAGE_IDS.unexpectedSpaceBefore
}

/**
 * Validates the spacing between the previous node and the current inline node.
 */
export function validateSpaceBeforeNode(
  context: AdjacentTextContext,
): InlineElementSpaceIssue | undefined {
  if (context.hasPunctuation)
    return validateBeforePunctuation(context)

  return validateSingleRequiredSpace(
    context.whiteSpace.count,
    INLINE_SPACE_MESSAGE_IDS.missingSpaceBefore,
    INLINE_SPACE_MESSAGE_IDS.multipleSpacesBefore,
  )
}

/**
 * Validates spacing after an inline node when the next character is punctuation.
 */
export function validateSpaceAfterPunctuation(
  context: AdjacentTextContext,
): InlineElementSpaceIssue | undefined {
  if (isDashPunctuation(getAdjacentChar(context.value, 'head'))) {
    return validateSingleRequiredSpace(
      context.whiteSpace.count,
      INLINE_SPACE_MESSAGE_IDS.missingSpaceAfter,
      INLINE_SPACE_MESSAGE_IDS.multipleSpacesAfter,
    )
  }

  if (CLOSING_PAIRED_PUNCTUATION.has(getAdjacentChar(context.value, 'head') || '')) {
    if (context.whiteSpace.count > 0)
      return INLINE_SPACE_MESSAGE_IDS.unexpectedSpaceAfter
    return
  }

  if (getLikeAnchor(context.value) || isCustomContainerMarker(context.value))
    return

  if (context.whiteSpace.count > 0)
    return INLINE_SPACE_MESSAGE_IDS.unexpectedSpaceAfter
}

/**
 * Validates the spacing between the current inline node and the next node.
 */
export function validateSpaceAfterNode(
  context: AdjacentTextContext,
): InlineElementSpaceIssue | undefined {
  if (context.hasPunctuation)
    return validateSpaceAfterPunctuation(context)

  return validateSingleRequiredSpace(
    context.whiteSpace.count,
    INLINE_SPACE_MESSAGE_IDS.missingSpaceAfter,
    INLINE_SPACE_MESSAGE_IDS.multipleSpacesAfter,
  )
}

/**
 * Validates whether the spacing around an inline element follows the typography rules.
 * - Regular text and selected inline elements should be separated by one space.
 * - Fullwidth punctuation and paired punctuation usually touch inline elements without spaces.
 * - Adjacent selected inline elements are handled by the following element to avoid duplicate fixes.
 */
export function validateSpace(nodeContext: NodeContextReturnType<InlineElement>): InlineElementSpaceIssue | undefined {
  const { prev, next } = nodeContext
  const spaceContext = getSpaceContext(nodeContext)

  if (prev && spaceContext.prev) {
    const beforeIssue = validateSpaceBeforeNode(spaceContext.prev)
    if (beforeIssue)
      return beforeIssue
  }

  if (!next || !spaceContext.next || isInlineElement(next))
    return

  return validateSpaceAfterNode(spaceContext.next)
}
