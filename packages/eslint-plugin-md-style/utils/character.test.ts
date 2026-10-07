import { describe, expect, it } from 'vitest'
import { containsCjk, containsHan, containsLatin, isHorizontalSpace, isLetterOrNumber, isLineBreak, isTrailingAsciiPunctuation } from './character'

describe('character classification', () => {
  it('detects CJK and Latin scripts in text', () => {
    for (const text of ['汉', 'あ', 'カ', '한'])
      expect(containsCjk(text)).toBeTruthy()
    expect(containsCjk('hello')).toBeFalsy()
    expect(containsLatin('你好 Latin')).toBeTruthy()
    expect(containsLatin('你好')).toBeFalsy()
    expect(containsHan('あ汉')).toBeTruthy()
    expect(containsHan('あ')).toBeFalsy()
  })

  it('distinguishes horizontal whitespace from line breaks', () => {
    for (const char of [' ', '\t', '\u00A0', '\u3000'])
      expect(isHorizontalSpace(char)).toBeTruthy()
    for (const char of ['\n', '\r', '\u2028', '\u2029']) {
      expect(isLineBreak(char)).toBeTruthy()
      expect(isHorizontalSpace(char)).toBeFalsy()
    }
    expect(isLineBreak(' ')).toBeFalsy()
  })

  it('detects letters, numbers, and trailing ASCII punctuation', () => {
    for (const char of ['a', '汉', '3'])
      expect(isLetterOrNumber(char)).toBeTruthy()
    expect(isLetterOrNumber('')).toBeFalsy()
    expect(isLetterOrNumber('!')).toBeFalsy()

    for (const char of [',', '.', ';', ':', '!', '?'])
      expect(isTrailingAsciiPunctuation(char)).toBeTruthy()
    expect(isTrailingAsciiPunctuation('。')).toBeFalsy()
    expect(isTrailingAsciiPunctuation('(')).toBeFalsy()
  })
})
