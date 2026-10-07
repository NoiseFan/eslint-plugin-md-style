import type { Text } from 'mdast'
import type { QuoteOptions } from './types'
import type { ValueOf } from '@/types/utils'
import { getNodeContext, getNodePosition } from '@/parser/ast'
import { createRule } from '@/utils'
import { analyzeQuoteSpacing } from './analyze'

export const RULE_NAME = 'space-around-quot'
export const MESSAGE_IDS = {
  incorrectSpacing: 'incorrectSpacing',
} as const

type MessageIds = ValueOf<typeof MESSAGE_IDS>
type Options = [Partial<QuoteOptions>?]

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'layout',
    docs: {
      description: 'Enforce spacing inside and around quotation marks in Markdown text.',
    },
    messages: {
      incorrectSpacing: 'Use the configured spacing around quotation marks and no space inside them.',
    },
    fixable: 'code',
    schema: [{
      type: 'object',
      properties: {
        halfwidth: { enum: ['always', 'never'] },
        fullwidth: { enum: ['always', 'never'] },
      },
      additionalProperties: false,
    }],
  },
  defaultOptions: [{}],
  create(context) {
    const options: QuoteOptions = {
      halfwidth: context.options[0]?.halfwidth ?? 'always',
      fullwidth: context.options[0]?.fullwidth ?? 'never',
    }
    return {
      text(node: Text) {
        const { prev, next } = getNodeContext(context, node)
        const position = getNodePosition(node)
        if (!position.position)
          return
        const source = context.sourceCode.text
        const boundaryStart = prev?.position?.start.offset ?? position.start
        const boundaryEnd = next?.position?.end.offset ?? position.end
        for (const edit of analyzeQuoteSpacing(node, source, { parentStart: boundaryStart, parentEnd: boundaryEnd, spacing: options })) {
          context.report({
            node,
            messageId: MESSAGE_IDS.incorrectSpacing,
            fix(fixer) {
              return fixer.replaceTextRange([edit.start, edit.end], edit.text)
            },
          })
        }
      },
    }
  },
})
