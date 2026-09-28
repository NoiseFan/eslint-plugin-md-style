import type { BlockContent, RootContent } from 'mdast'
import type { CustomContainer } from '@/index'
import { describe, expect, expectTypeOf, it } from 'vitest'
import * as api from '@/index'

describe('public API', () => {
  it('exports only the designed runtime functions', () => {
    expect(Object.keys(api).sort()).toEqual([
      'customContainer',
      'customContainerFromMarkdown',
      'parseMarkdown',
    ])
  })

  it('registers custom containers as mdast block and root content', () => {
    const node: CustomContainer = {
      type: 'customContainer',
      tag: { open: { type: { value: 'info' }, markerLength: 3 } },
      children: [],
    }
    const block: BlockContent = node
    const root: RootContent = node
    expectTypeOf(block).toMatchTypeOf<BlockContent>()
    expectTypeOf(root).toMatchTypeOf<RootContent>()
  })
})
