import type { Text } from 'mdast'
import { describe, expect, it } from 'vitest'
import { analyzeQuoteSpacing, parseQuoteGroups } from './analyze'

const options = { halfwidth: 'always', fullwidth: 'never' } as const

/**
 * Builds the minimum positioned mdast text node needed by the text parser.
 */
function textNode(value: string): Text {
  return {
    type: 'text',
    value,
    position: {
      start: { line: 1, column: 1, offset: 0 },
      end: { line: 1, column: value.length + 1, offset: value.length },
    },
  }
}

/**
 * Applies source edits backwards so each original offset remains valid.
 */
function applyEdits(source: string): string {
  const edits = analyzeQuoteSpacing(textNode(source), source, { parentStart: 0, parentEnd: source.length, spacing: options })
  for (const edit of edits.reverse())
    source = `${source.slice(0, edit.start)}${edit.text}${source.slice(edit.end)}`
  return source
}

describe('quote group analyzer', () => {
  it('pairs typed quotes while ignoring word apostrophes and unmatched marks', () => {
    const source = 'It\'s "hello" and “你好” then "unfinished'
    expect(parseQuoteGroups(textNode(source), source)).toHaveLength(2)
  })

  it('uses source offsets after a decoded Markdown escape', () => {
    const source = 'He wrote \\* and said"hello".'
    const node = textNode('He wrote * and said"hello".')
    node.position!.end.offset = source.length
    expect(parseQuoteGroups(node, source)).toEqual([{
      open: { char: '"', offset: source.indexOf('"') },
      close: { char: '"', offset: source.lastIndexOf('"') },
      fullwidth: false,
    }])
  })

  it('normalizes internal and external spaces idempotently', () => {
    const source = '他说“ 你好 ”，然后说"hello world"。'
    const fixed = applyEdits(source)
    expect(fixed).toBe('他说 “你好”，然后说 "hello world"。')
    expect(applyEdits(fixed)).toBe(fixed)
  })

  it('replaces quote marks and their touching padding in one stable fix', () => {
    const fixed = applyEdits('He wrote “ draft ready ” in the guide.')
    expect(fixed).toBe('He wrote "draft ready" in the guide.')
    expect(applyEdits(fixed)).toBe(fixed)
  })

  it('handles adjacent quotes and padding made entirely of spaces', () => {
    const fixed = applyEdits('A" one "" two "B and “   ”。')
    expect(fixed).toBe('A "one""two" B and“”。')
    expect(applyEdits(fixed)).toBe(fixed)
  })

  it('keeps an unescaped source boundary when text contains an escaped quote', () => {
    const source = 'He said \\"hello\\" today.'
    expect(applyEdits(source)).toBe(source)
  })
})
