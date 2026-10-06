import type { CustomContainerAST, CustomContainerBlockNode, TagNode } from '@/types/custom-container'
import { isCustomContainerType, parseCustomContainers } from '@/parser/custom-container'

export interface CustomContainerTypeIssue {
  type: string
  start: number
  end: number
  messageId: 'invalidType' | 'invalidTypeCase'
  normalizedType?: string
}

/** The pre-AST implementation, retained as the benchmark baseline. */
export function findLegacyTypeIssues(value: string): CustomContainerTypeIssue[] {
  const issues: CustomContainerTypeIssue[] = []
  for (const tag of getOpeningTags(parseCustomContainers(value))) {
    const issue = getTypeIssue(tag.value.content)
    if (issue)
      issues.push({ ...issue, type: tag.value.content, start: tag.value.start, end: tag.value.end })
  }
  return issues
}

function* getOpeningTags(nodes: CustomContainerBlockNode[]): Generator<TagNode> {
  for (const node of nodes) {
    if (node.type === 'custom-container')
      yield* getOpeningTagsFromContainer(node)
  }
}

function* getOpeningTagsFromContainer(container: CustomContainerAST): Generator<TagNode> {
  for (const child of container.children) {
    if (child.type === 'custom-container')
      yield* getOpeningTagsFromContainer(child)
    else if (child.type === 'open')
      yield child
  }
}

function getTypeIssue(type: string): Pick<CustomContainerTypeIssue, 'messageId' | 'normalizedType'> | null {
  if (isCustomContainerType(type))
    return null
  const normalizedType = type.toLowerCase()
  if (isCustomContainerType(normalizedType))
    return { messageId: 'invalidTypeCase', normalizedType }
  return { messageId: 'invalidType' }
}
