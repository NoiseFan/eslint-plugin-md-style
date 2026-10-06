import type { CompileContext, Extension } from 'mdast-util-from-markdown'
import type { Token } from 'micromark-util-types'
import type { Point, Position } from 'unist'
import type { CustomContainer, CustomContainerToken } from './types'

/**
 * Create the mdast compiler extension matching `customContainer`.
 */
export function customContainerFromMarkdown(): Extension {
  return {
    enter: { customContainer: enterContainer },
    exit: {
      customContainer: exitContainer,
      customContainerFence: exitFence,
      customContainerType: exitType,
      customContainerLabel: exitLabel,
      customContainerAttr: exitAttr,
    },
  }
}

function enterContainer(this: CompileContext, token: Token): void {
  this.enter({
    type: 'customContainer',
    tag: { open: { type: { value: '' }, markerLength: 0 } },
    children: [],
  }, token)
}

function exitContainer(this: CompileContext, token: CustomContainerToken): void {
  const node = currentContainer(this)
  this.exit(token)
  node.position = { start: syntaxStart(token), end: publicPoint(token.end) }
}

function exitFence(this: CompileContext, token: CustomContainerToken): void {
  const node = currentContainer(this)
  const markerLength = this.sliceSerialize(token).match(/:{3,}/)?.[0].length ?? 0
  const position: Position = { start: syntaxStart(token), end: publicPoint(token.end) }

  if (token.customContainerKind === 'close')
    node.tag.close = { markerLength, position }
  else
    Object.assign(node.tag.open, { markerLength, position })
}

function exitType(this: CompileContext, token: Token): void {
  const openTag = currentContainer(this).tag.open
  openTag.type.value = this.sliceSerialize(token)
  openTag.type.position = tokenPosition(token)
}

function exitLabel(this: CompileContext, token: Token): void {
  const raw = this.sliceSerialize(token)
  const value = raw.trimEnd()
  if (!value)
    return

  const openTag = currentContainer(this).tag.open
  openTag.label = {
    value,
    position: {
      start: publicPoint(token.start),
      end: shiftPoint(token.start, value.length),
    },
  }
}

function exitAttr(this: CompileContext, token: Token): void {
  const raw = this.sliceSerialize(token)
  currentContainer(this).tag.open.attr = {
    value: raw.slice(1, -1),
    position: tokenPosition(token),
  }
}

function currentContainer(context: CompileContext): CustomContainer {
  // Micromark emits custom-container field exits while the container is on top.
  const node = context.stack[context.stack.length - 1]
  if (node.type !== 'customContainer')
    throw new Error('Expected an active custom container')
  return node
}

function tokenPosition(token: Token): Position {
  return { start: publicPoint(token.start), end: publicPoint(token.end) }
}

function syntaxStart(token: CustomContainerToken): Point {
  const indent = token.customContainerIndent ?? 0
  return {
    line: token.start.line,
    column: token.start.column - indent,
    offset: token.start.offset - indent,
  }
}

function publicPoint(point: Point): Point {
  return { line: point.line, column: point.column, offset: point.offset }
}

function shiftPoint(point: Point, delta: number): Point {
  return { line: point.line, column: point.column + delta, offset: (point.offset ?? 0) + delta }
}
