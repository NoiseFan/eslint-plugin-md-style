import type { Text } from 'mdast'
import { TEXT_TYPE } from '@/types/text-tokenizer'
import { createRule } from '@/utils'
import { getNodeContextByParent } from '@/utils/ast'
import { buildTextNodeAst, isLatinWord } from '@/utils/text-tokenizer'

export const RULE_NAME = 'space-around-word'
export const MESSAGE_IDS = {
  missingSpaceBefore: 'missingSpaceBefore',
  missingSpaceAfter: 'missingSpaceAfter',
  missingSpacesAround: 'missingSpacesAround',
  unexpectedSpaceBefore: 'unexpectedSpaceBefore',
  unexpectedSpaceAfter: 'unexpectedSpaceAfter',
  unexpectedSpaceAround: 'unexpectedSpaceAround',
} as const

type MessageIds = typeof MESSAGE_IDS[keyof typeof MESSAGE_IDS]
type Options = []

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce a single space between CJK characters and Latin words.',
    },
    messages: {
      missingSpaceBefore: 'Add a space before the word.',
      missingSpaceAfter: 'Add a space after the word.',
      missingSpacesAround: 'Add spaces before and after the word.',
      unexpectedSpaceBefore: 'Remove the unexpected space before the word.',
      unexpectedSpaceAfter: 'Remove the unexpected space after the word.',
      unexpectedSpaceAround: 'Remove the unexpected spaces around the word.',
    },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      text(node: Text) {
        const { fixed, missingBefore, missingAfter, unexpectedBefore, unexpectedAfter } = fixBoundarySpace(node)

        if (fixed === node.value)
          return

        context.report({
          node,
          messageId: getMessageId({ missingBefore, missingAfter, unexpectedBefore, unexpectedAfter }),
          fix(fixer) {
            return fixer.replaceText(node, fixed)
          },
        })
      },
    }
  },
})

interface FixBoundarySpaceResult {
  fixed: string
  missingBefore: boolean
  missingAfter: boolean
  unexpectedBefore: boolean
  unexpectedAfter: boolean
}

type TextToken = ReturnType<typeof buildTextNodeAst>['children'][number]
type TokenContext = ReturnType<typeof getNodeContextByParent<TextToken>>

/**
 * Normalizes an existing space token according to the token types on both
 * sides, and records which side contains redundant spacing when collapsing
 * multiple spaces to a single space.
 */
function processSpaceToken(ctx: TokenContext, result: FixBoundarySpaceResult): void {
  const { prev, current, next } = ctx
  /* v8 ignore if -- @preserve */
  if (!current)
    return

  const CJK2Latin = prev?.type === TEXT_TYPE.cjk && isLatinWord(next?.type)
  const latin2CJK = isLatinWord(prev?.type) && next?.type === TEXT_TYPE.cjk
  const latins = isLatinWord(prev?.type) && isLatinWord(next?.type)
  const hasUnexpectedSpaces = current.value.length !== 1

  if (hasUnexpectedSpaces) {
    if (CJK2Latin || latins)
      result.unexpectedBefore = true

    if (latin2CJK || latins)
      result.unexpectedAfter = true
  }

  if (CJK2Latin || latin2CJK || hasUnexpectedSpaces) {
    result.fixed += ' '
  }
  else {
    result.fixed += current.value
  }
}

/**
 * Inserts missing boundary spaces around a Latin word when it is
 * adjacent to CJK text, while keeping track of the missing side(s) for
 * reporting.
 */
function processLatinWordToken(ctx: TokenContext, result: FixBoundarySpaceResult): void {
  const { prev, current, next } = ctx
  /* v8 ignore if -- @preserve */
  if (!current)
    return

  if (prev?.type === TEXT_TYPE.cjk) {
    result.fixed += ' '
    result.missingBefore = true
  }

  result.fixed += current.value

  if (next?.type === TEXT_TYPE.cjk) {
    result.fixed += ' '
    result.missingAfter = true
  }
}

/**
 * Selects the most specific lint message for the combination of missing or
 * unexpected boundary spaces found in the text node.
 */
function getMessageId(boundary: {
  missingBefore: boolean
  missingAfter: boolean
  unexpectedBefore: boolean
  unexpectedAfter: boolean
}): MessageIds {
  if (boundary.missingBefore && boundary.missingAfter)
    return MESSAGE_IDS.missingSpacesAround

  if (boundary.unexpectedBefore && boundary.unexpectedAfter)
    return MESSAGE_IDS.unexpectedSpaceAround

  if (boundary.missingBefore)
    return MESSAGE_IDS.missingSpaceBefore

  if (boundary.missingAfter)
    return MESSAGE_IDS.missingSpaceAfter

  if (boundary.unexpectedBefore)
    return MESSAGE_IDS.unexpectedSpaceBefore

  return MESSAGE_IDS.unexpectedSpaceAfter
}

/**
 * Rebuilds a text node with normalized spacing between CJK and Latin-word
 * tokens, and returns both the fixed text and the boundary issues detected
 * during the pass.
 */
function fixBoundarySpace(node: Text): FixBoundarySpaceResult {
  const { children } = buildTextNodeAst(node)
  const result: FixBoundarySpaceResult = {
    fixed: '',
    missingBefore: false,
    missingAfter: false,
    unexpectedBefore: false,
    unexpectedAfter: false,
  }

  for (let i = 0; i < children.length; i += 1) {
    const ctx = getNodeContextByParent(children, i)
    /* v8 ignore if -- @preserve */
    if (!ctx.current)
      continue

    if (ctx.current.type === TEXT_TYPE.space)
      processSpaceToken(ctx, result)
    else if (isLatinWord(ctx.current.type))
      processLatinWordToken(ctx, result)
    else
      result.fixed += ctx.current.value
  }

  return result
}
