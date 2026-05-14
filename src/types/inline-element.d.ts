import type { Emphasis, Image, InlineCode, Link, Strong } from 'mdast'
import type { INLINE_SPACE_MESSAGE_IDS } from '@/types/inline-element'

/**
 * The Markdown inline element node types selected by space-around-inline-element.
 */
export type InlineElement = Link | Image | InlineCode | Emphasis | Strong

/**
 * The allowed issue ids for inline element spacing rules.
 */
export type InlineElementSpaceIssue = typeof INLINE_SPACE_MESSAGE_IDS[keyof typeof INLINE_SPACE_MESSAGE_IDS]

/**
 * The relative position to check for spacing.
 */
export type PositionOptions = 'head' | 'tail'

/**
 * The text context adjacent to a link.
 */
export interface AdjacentTextContext {
  /**
   * The neighboring text value, if any.
   */
  value: string | undefined
  /**
   * The neighboring whitespace node.
   */
  whiteSpace: whiteSpaceReturn
  /**
   * Whether the adjacent text contains punctuation.
   */
  hasPunctuation: boolean
  /**
   * The punctuation classification.
   */
  punctuationType: 'full' | 'half'
}
