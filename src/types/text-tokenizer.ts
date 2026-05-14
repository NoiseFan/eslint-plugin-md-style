import type { Text } from 'mdast'

export const TEXT_TYPE = {
  'cjk': 'cjk',
  'latin': 'latin',
  'number': 'number',
  'space': 'space',
  'newline': 'newline',
  'fullwidth-punctuation': 'fullwidth-punctuation',
  'halfwidth-punctuation': 'halfwidth-punctuation',
  'dash': 'dash',
  'symbol': 'symbol',
  'emoji': 'emoji',
  'invisible': 'invisible',
  'other': 'other',
} as const

export type TextType = typeof TEXT_TYPE[keyof typeof TEXT_TYPE]

/**
 * Source location point compatible with mdast position points
 */
export interface TextPoint {
  /**
   * Line number
   * @default 1
   */
  line: number
  /**
   * 1-based column number
   */
  column: number
  /**
   * 0-based offset in JavaScript string code units
   */
  offset: number
}

/**
 * Source location range for a token or auxiliary text AST node
 */
export interface TextPosition {
  /**
   * Inclusive start point
   */
  start: TextPoint
  /**
   * Exclusive end point
   */
  end: TextPoint
}

export interface TextToken {
  /**
   * Token category
   */
  type: TextType
  /**
   * Original token text
   */
  value: string
  /**
   * Token position in the source text
   */
  position: TextPosition
}

export interface TextAst {
  /**
   * AST node type
   */
  type: 'text'
  /**
   * Original text content
   */
  value: string
  /**
   * Back-reference to the mdast text node when available
   */
  node?: Text
  /**
   * Node position in the source text
   */
  position: TextPosition
  /**
   * Tokenized children derived from the text content
   */
  children: TextToken[]
}
