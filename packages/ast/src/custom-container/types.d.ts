import type { Parent, RootContent } from 'mdast'
import type { Token } from 'micromark-util-types'
import type { Position } from 'unist'

/**
 * Internal metadata shared by the micromark tokenizer and mdast compiler.
 */
export interface CustomContainerToken extends Token {
  customContainerKind?: 'open' | 'close'
  customContainerIndent?: number
}

export interface CustomContainer extends Parent {
  type: 'customContainer'
  children: RootContent[]
  tag: {
    open: CustomContainerOpenTag
    close?: CustomContainerCloseTag
  }
  position?: Position
}

export interface CustomContainerOpenTag {
  type: {
    value: string
    position?: Position
  }
  label?: CustomContainerAttr
  attr?: CustomContainerAttr
  markerLength: number
  position?: Position
}

export interface CustomContainerCloseTag {
  markerLength: number
  position?: Position
}

export interface CustomContainerAttr {
  value: string
  position: Position
}

declare module 'mdast' {
  interface BlockContentMap {
    customContainer: CustomContainer
  }

  interface RootContentMap {
    customContainer: CustomContainer
  }
}
