import type { Text } from 'mdast'
import type { ValueOf } from '@/types'
import type { TokenContext } from '@/utils/ast'
import { createRule } from '@/utils'
import { getNodeContextByParent } from '@/utils/ast'
import { SPACE_MESSAGE_IDS as MESSAGE_IDS } from '@/utils/space'
import { buildTextNodeAst, isNumberType, TEXT_TYPE } from '@/utils/text-tokenizer'

export const RULE_NAME = 'space-around-number'

type MessageIds = ValueOf<typeof MESSAGE_IDS>
type Options = []

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce a single space between CJK characters and numbers.',
    },
    messages: {
      missingSpaceBefore: 'Add a space before the number.',
      missingSpaceAfter: 'Add a space after the number.',
      missingSpacesAround: 'Add spaces before and after the number.',
      unexpectedSpaceBefore: 'Remove the unexpected space before the number.',
      unexpectedSpaceAfter: 'Remove the unexpected space after the number.',
      unexpectedSpaceAround: 'Remove the unexpected spaces around the number.',
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

function processSpaceToken(ctx: TokenContext, result: FixBoundarySpaceResult): void {
  const { prev, current, next } = ctx
  /* v8 ignore if -- @preserve */
  if (!current)
    return

  const CJK2Number = prev?.type === TEXT_TYPE.cjk && isNumberType(next?.type)
  const number2CJK = isNumberType(prev?.type) && next?.type === TEXT_TYPE.cjk
  const numbers = isNumberType(prev?.type) && isNumberType(next?.type)
  const hasUnexpectedSpaces = current.value.length !== 1

  if (hasUnexpectedSpaces) {
    if (CJK2Number || numbers)
      result.unexpectedBefore = true

    if (number2CJK || numbers)
      result.unexpectedAfter = true
  }

  if (CJK2Number || number2CJK || hasUnexpectedSpaces) {
    result.fixed += ' '
  }
  else {
    result.fixed += current.value
  }
}

function processNumberToken(ctx: TokenContext, result: FixBoundarySpaceResult): void {
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
    else if (isNumberType(ctx.current.type))
      processNumberToken(ctx, result)
    else
      result.fixed += ctx.current.value
  }

  return result
}
