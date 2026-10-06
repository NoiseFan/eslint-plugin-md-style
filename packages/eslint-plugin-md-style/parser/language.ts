import type { Options } from 'mdast-util-from-markdown'
import { MarkdownLanguage } from '@eslint/markdown'
import { customContainer, customContainerFromMarkdown } from '@md-style/ast'
import { fromMarkdown } from 'mdast-util-from-markdown'
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter'
import { gfmFromMarkdown } from 'mdast-util-gfm'
import { mathFromMarkdown } from 'mdast-util-math'
import { frontmatter } from 'micromark-extension-frontmatter'
import { gfm } from 'micromark-extension-gfm'
import { math } from 'micromark-extension-math'

const jsonFrontmatter = { type: 'json' as const, marker: '-' }

/** Markdown language with the md-style custom-container syntax enabled. */
export class MdStyleMarkdownLanguage extends MarkdownLanguage {
  private readonly markdownMode: 'commonmark' | 'gfm'

  constructor(options: { mode?: 'commonmark' | 'gfm' } = {}) {
    super(options)
    this.markdownMode = options.mode ?? 'commonmark'
  }

  override parse(
    file: Parameters<MarkdownLanguage['parse']>[0],
    context: Parameters<MarkdownLanguage['parse']>[1],
  ): ReturnType<MarkdownLanguage['parse']> {
    try {
      const options: Options = { extensions: [customContainer()], mdastExtensions: [customContainerFromMarkdown()] }
      if (context?.languageOptions?.frontmatter === 'yaml') {
        options.extensions?.push(frontmatter(['yaml']))
        options.mdastExtensions?.push(frontmatterFromMarkdown(['yaml']))
      }
      else if (context?.languageOptions?.frontmatter === 'toml') {
        options.extensions?.push(frontmatter(['toml']))
        options.mdastExtensions?.push(frontmatterFromMarkdown(['toml']))
      }
      else if (context?.languageOptions?.frontmatter === 'json') {
        options.extensions?.push(frontmatter(jsonFrontmatter))
        options.mdastExtensions?.push(frontmatterFromMarkdown(jsonFrontmatter))
      }
      if (this.markdownMode === 'gfm') {
        options.extensions?.push(gfm())
        options.mdastExtensions?.push(gfmFromMarkdown())
      }
      if (context?.languageOptions?.math === true) {
        options.extensions?.push(math())
        options.mdastExtensions?.push(mathFromMarkdown())
      }
      return { ok: true, ast: fromMarkdown(String(file.body), options) }
    }
    catch (error) {
      return { ok: false, errors: [error] } as ReturnType<MarkdownLanguage['parse']>
    }
  }
}
