import type { CustomContainer } from '@md-style/ast'
import type { RuleListener } from '@/types'
import type { ValueOf } from '@/types/utils'
import { parseMarkdown } from '@md-style/ast'
import { isCustomContainerType } from '@/parser/custom-container'
import { createRule } from '@/utils'

export const RULE_NAME = 'valid-custom-container-type'
export const MESSAGE_IDS = {
  invalidType: 'invalidType',
  invalidTypeCase: 'invalidTypeCase',
} as const
type Options = []
type MessageIds = ValueOf<typeof MESSAGE_IDS>

export interface CustomContainerTypeIssue {
  type: string
  start: number
  end: number
  messageId: MessageIds
  normalizedType?: string
}

/** Finds custom-container type issues by parsing the complete Markdown source once. */
export function findAstTypeIssues(source: string): CustomContainerTypeIssue[] {
  const issues: CustomContainerTypeIssue[] = []
  for (const child of parseMarkdown(source).children)
    visitContainer(child, issues)
  return issues
}

function visitContainer(value: unknown, issues: CustomContainerTypeIssue[]): void {
  if (!isCustomContainer(value))
    return
  const type = value.tag.open.type
  const typePosition = type.position
  if (typePosition?.start.offset != null && typePosition.end.offset != null) {
    const issue = getTypeIssue(type.value)
    if (issue) {
      issues.push({
        ...issue,
        type: type.value,
        start: typePosition.start.offset,
        end: typePosition.end.offset,
      })
    }
  }
  for (const child of value.children)
    visitContainer(child, issues)
}

export default createRule<Options, MessageIds>({
  name: RULE_NAME,
  meta: {
    type: 'problem',
    docs: {
      description: 'Require custom containers to use a supported type.',
      recommended: true,
    },
    messages: {
      invalidType: 'Invalid custom container type "{{type}}". Use info, tip, warning, danger, details, raw, code-group, v-pre, or tabs.',
      invalidTypeCase: 'Custom container type "{{type}}" must be lowercase.',
    },
    fixable: 'code',
    schema: [],
  },
  defaultOptions: [],
  create(context) {
    const listener = {
      customContainer(node: CustomContainer) {
        const type = node.tag.open.type
        const typePosition = type.position
        /* v8 ignore if -- @preserve */
        if (typePosition?.start.offset == null || typePosition.end.offset == null)
          return
        const issue = getTypeIssue(type.value)
        if (!issue)
          return
        const start = typePosition.start.offset
        const end = typePosition.end.offset
        context.report({
          node,
          messageId: issue.messageId,
          data: { type: type.value },
          loc: {
            start: context.sourceCode.getLocFromIndex(start),
            end: context.sourceCode.getLocFromIndex(end),
          },
          fix: issue.normalizedType
            ? fixer => fixer.replaceTextRange([start, end], issue.normalizedType!)
            : undefined,
        })
      },
    }
    return listener as unknown as RuleListener
  },
})

function isCustomContainer(value: unknown): value is CustomContainer {
  return !!value && typeof value === 'object' && 'type' in value && value.type === 'customContainer'
}

function getTypeIssue(type: string): Pick<CustomContainerTypeIssue, 'messageId' | 'normalizedType'> | null {
  if (isCustomContainerType(type))
    return null
  const normalizedType = type.toLowerCase()
  if (isCustomContainerType(normalizedType))
    return { messageId: MESSAGE_IDS.invalidTypeCase, normalizedType }
  return { messageId: MESSAGE_IDS.invalidType }
}
