import type { Text } from 'mdast'
import { createRule } from '@/utils'
import { getNodePosition } from '@/utils/ast'

export const RULE_NAME = 'space-between-cjk-and-alphanumeric'
const MESSAGE_IDS = {
  exampleMsgId: 'exampleMsgId',
} as const

type MessageIds = typeof MESSAGE_IDS[keyof typeof MESSAGE_IDS]
type Options = []

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: '',
    },
    messages: {
      exampleMsgId: 'exampleMsgId',
    },
    fixable: 'whitespace',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    return {
      text(node: Text) {
        const { position } = getNodePosition(node)
        /* v8 ignore if -- @preserve */
        if (!position)
          return
        context.report({
          node,
          messageId: MESSAGE_IDS.exampleMsgId,
        })
      },
    }
  },
})
