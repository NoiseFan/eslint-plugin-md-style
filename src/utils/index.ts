import type { MarkdownRuleDefinition } from '@eslint/markdown'
import type { RuleWithMetaAndName } from '@/types'

export function createRule<Options extends unknown[], MessageIds extends string>({
  create,
  defaultOptions,
  meta,
}: Readonly<RuleWithMetaAndName<Options, MessageIds>>): MarkdownRuleDefinition<{
  RuleOptions: Options
  MessageIds: MessageIds
}> {
  return {
    create,
    meta: {
      defaultOptions,
      ...meta,
    },
  }
}
