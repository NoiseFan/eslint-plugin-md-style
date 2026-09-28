import type { Event } from 'micromark-util-types'
import { parse, postprocess, preprocess } from 'micromark'
import { describe, expect, it } from 'vitest'
import { customContainer } from '@/custom-container/syntax'

function tokenEvents(source: string): Event[] {
  const parser = parse({ extensions: [customContainer()] })
  return postprocess(parser.document().write(preprocess()(source, undefined, true)))
}

function tokenTypes(source: string): string[] {
  return tokenEvents(source).map(event => `${event[0]}:${event[1].type}`)
}

function completeTokenTypes(source: string): string[] {
  const types = tokenTypes(source)
  return [...new Set(types
    .filter(type => type.startsWith('enter:'))
    .map(type => type.slice('enter:'.length)))]
    .filter(token => types.filter(type => type === `enter:${token}`).length
      === types.filter(type => type === `exit:${token}`).length)
    .map(token => `enter:${token}`)
}

describe('customContainer', () => {
  it('emits namespaced syntax tokens and subtokenizes body flow', () => {
    const events = tokenEvents('::: warning Label {open}\n\n# Body\n\n:::')
    const types = events.map(event => `${event[0]}:${event[1].type}`)

    expect(types).toContain('enter:customContainer')
    expect(types).toContain('enter:customContainerFence')
    expect(types).toContain('enter:customContainerFenceSequence')
    expect(types).toContain('enter:customContainerType')
    expect(types).toContain('enter:customContainerLabel')
    expect(types).toContain('enter:customContainerAttr')
    expect(types).toContain('enter:atxHeading')
  })

  it('emits two container token pairs for adjacent containers', () => {
    const events = tokenEvents('::: info\na\n:::\n::: tip\nb\n:::')
    expect(events.filter(([kind, token]) => kind === 'enter' && token.type === 'customContainer')).toHaveLength(2)
  })

  it.each([
    '::: info',
    ':::: info',
    '::: info_label-2',
    '::: info Label',
    '::: info {open}',
    '::: info Label {open}',
    '::: info {open} {class=wide}',
  ])('accepts valid opening syntax: %j', (source) => {
    expect(tokenTypes(source)).toContain('enter:customContainer')
  })

  it.each([
    ':: info',
    '::: ',
    '::: info!',
    '::: info {open',
    '::: info {}',
    '::: info {open} trailing',
  ])('does not tokenize invalid opening syntax: %j', (source) => {
    expect(completeTokenTypes(source)).not.toContain('enter:customContainer')
  })

  it('supports labels containing spaces and braces only as attributes', () => {
    const types = tokenTypes('::: warning A descriptive label {open}\ncontent\n:::')
    expect(types.filter(type => type === 'enter:customContainerLabel')).toHaveLength(1)
    expect(types.filter(type => type === 'enter:customContainerAttr')).toHaveLength(1)
  })

  it('requires the closing fence to be at least as long as the opening fence', () => {
    const short = tokenTypes(':::: info\nbody\n:::\n')
    const long = tokenTypes(':::: info\nbody\n:::::\n')

    expect(short.filter(type => type === 'enter:customContainer')).toHaveLength(1)
    expect(short.filter(type => type === 'enter:customContainerFence')).toHaveLength(1)
    expect(long.filter(type => type === 'enter:customContainerFence')).toHaveLength(2)
  })

  it('preserves an indented body and recognizes an indented closing fence', () => {
    const events = tokenEvents('  ::: info\n   body\n  :::')
    const content = events.filter(([kind, token]) => kind === 'enter' && token.type === 'content')

    expect(content).toHaveLength(1)
    expect(events.filter(([kind, token]) => kind === 'enter' && token.type === 'customContainerFence')).toHaveLength(2)
  })
})
