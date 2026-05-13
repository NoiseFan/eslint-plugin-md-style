import type { Text } from 'mdast'
import { TEXT_TYPE } from '@/types/text-tokenizer'
import { createRule } from '@/utils'
import { getNodeContextByParent } from '@/utils/ast'
import { buildTextNodeAst } from '@/utils/text-tokenizer'

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
      description: 'Enforce a single space between CJK characters and alphanumeric words.',
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

function isAlphanumeric(type: string | undefined): boolean {
  return type === TEXT_TYPE.latin || type === TEXT_TYPE.number
}
interface FixBoundarySpaceResult {
  fixed: string
  missingBefore: boolean
  missingAfter: boolean
  unexpectedBefore: boolean
  unexpectedAfter: boolean
}

function fixBoundarySpace(node: Text): FixBoundarySpaceResult {
  const { children } = buildTextNodeAst(node)
  let fixed = ''
  let missingBefore = false
  let missingAfter = false
  let unexpectedBefore = false
  let unexpectedAfter = false

  for (let i = 0; i < children.length; i += 1) {
    const { prev, current, next } = getNodeContextByParent(children, i)
    /* v8 ignore if -- @preserve */
    if (!current)
      continue

    if (current.type === TEXT_TYPE.space) {
      const isCjkToAlphanumeric = prev?.type === TEXT_TYPE.cjk && isAlphanumeric(next?.type)
      const isAlphanumericToCjk = isAlphanumeric(prev?.type) && next?.type === TEXT_TYPE.cjk
      const isAlphanumericToAlphanumeric = isAlphanumeric(prev?.type) && isAlphanumeric(next?.type)
      const hasUnexpectedSpaces = current.value.length !== 1

      if (hasUnexpectedSpaces) {
        if (isCjkToAlphanumeric || isAlphanumericToAlphanumeric)
          unexpectedBefore = true

        if (isAlphanumericToCjk || isAlphanumericToAlphanumeric)
          unexpectedAfter = true
      }

      if (
        isCjkToAlphanumeric
        || isAlphanumericToCjk
        || (isAlphanumericToAlphanumeric && hasUnexpectedSpaces)
      ) {
        fixed += ' '
      }
      else {
        fixed += current.value
      }
      continue
    }

    if (isAlphanumeric(current.type)) {
      if (prev?.type === TEXT_TYPE.cjk) {
        fixed += ' '
        missingBefore = true
      }

      fixed += current.value
      if (next?.type === TEXT_TYPE.cjk) {
        fixed += ' '
        missingAfter = true
      }
      continue
    }
    fixed += current.value
  }
  return {
    fixed,
    missingBefore,
    missingAfter,
    unexpectedBefore,
    unexpectedAfter,
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
