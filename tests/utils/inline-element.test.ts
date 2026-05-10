import { describe, expect, it } from 'vitest'
import { isInlineCodeNode } from '../../src/utils/ast'
import {
  isCustomContainerMarker,
  validateSpace,
  validateSpaceAfterPunctuation,
} from '../../src/utils/inline-element'
import { getParsedNodeContext } from '../../src/utils/markdown'

describe('isCustomContainerMarker', () => {
  it('should return true for custom container markers on the next line', () => {
    const inputs = ['\n:::', '\n  :::', ' \n:::  ']
    for (const input of inputs) {
      expect(isCustomContainerMarker(input), input).toBeTruthy()
    }
  })

  it('should return false for inline punctuation and non-marker values', () => {
    const inputs = [undefined, '', ':::', ' ::: ', '\n::', '\n: text', '\n::: text', 'text\n:::']
    for (const input of inputs) {
      expect(isCustomContainerMarker(input), input ?? 'undefined').toBeFalsy()
    }
  })
})

describe('validateSpace', () => {
  it('allows spaced adjacent inline elements in table cells', () => {
    const markdown = '| Setting | Value|\n| --- | --- |\n| Working directory | `/path` `/to/your-project-root`|'
    const inlineCodeContext = getParsedNodeContext(markdown, isInlineCodeNode)

    expect(validateSpace(inlineCodeContext)).toBeUndefined()
  })

  it('skips standalone inline elements in table cells without adjacent text', () => {
    const markdown = '| Setting | Value|\n| --- | --- |\n| Working directory | `/path/to/your-project-root`|'
    const inlineCodeContext = getParsedNodeContext(markdown, isInlineCodeNode)

    expect(validateSpace(inlineCodeContext)).toBeUndefined()
  })
})

describe('validateSpaceAfterPunctuation', () => {
  it('should allow inline elements to touch closing paired punctuation', () => {
    expect(validateSpaceAfterPunctuation({
      value: ') next',
      whiteSpace: { count: 0, start: 0, end: 0 },
      hasPunctuation: true,
      punctuationType: 'half',
    })).toBeUndefined()
  })

  it('should report unexpected spaces before closing paired punctuation', () => {
    expect(validateSpaceAfterPunctuation({
      value: ' ) next',
      whiteSpace: { count: 1, start: 0, end: 1 },
      hasPunctuation: true,
      punctuationType: 'half',
    })).toBe('unexpectedSpaceAfter')
  })
})
