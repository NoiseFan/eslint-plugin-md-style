const LETTER_OR_NUMBER_RE = /[\p{L}\p{N}]/u
const CJK_SCRIPT_RE = /[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}]/u
const LATIN_SCRIPT_RE = /\p{Script=Latin}/u
const HAN_SCRIPT_RE = /\p{Script=Han}/u
const HORIZONTAL_SPACE_RE = /[\t\v\f \u00A0\u1680\u2000-\u200A\u202F\u205F\u3000]/u
const LINE_BREAK_RE = /[\n\r\u2028\u2029]/u
const TRAILING_ASCII_PUNCTUATION_RE = /^[,.;:!?]$/u

/**
 * Checks whether a character is a Unicode letter or number.
 */
export function isLetterOrNumber(char: string): boolean {
  return char.length > 0 && LETTER_OR_NUMBER_RE.test(char)
}

/**
 * Checks whether text contains a Han, Hiragana, Katakana, or Hangul character.
 */
export function containsCjk(text: string): boolean {
  return CJK_SCRIPT_RE.test(text)
}

/**
 * Checks whether text contains a Latin script character.
 */
export function containsLatin(text: string): boolean {
  return LATIN_SCRIPT_RE.test(text)
}

/**
 * Checks whether text contains a Han character.
 */
export function containsHan(text: string): boolean {
  return HAN_SCRIPT_RE.test(text)
}

/**
 * Checks whether a character is horizontal whitespace, excluding line breaks.
 */
export function isHorizontalSpace(char: string): boolean {
  return char.length === 1 && HORIZONTAL_SPACE_RE.test(char)
}

/**
 * Checks whether a character is a line break.
 */
export function isLineBreak(char: string): boolean {
  return char.length === 1 && LINE_BREAK_RE.test(char)
}

/**
 * Checks for ASCII punctuation that attaches to the preceding text.
 */
export function isTrailingAsciiPunctuation(char: string): boolean {
  return TRAILING_ASCII_PUNCTUATION_RE.test(char)
}
