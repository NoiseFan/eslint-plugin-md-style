import type { ESLint, Linter } from 'eslint'
import markdown, { MarkdownLanguage } from '@eslint/markdown'
import { rules } from './rules'

export const plugin: ESLint.Plugin = {
  rules,
  processors: markdown.processors,
  languages: {
    gfm: new MarkdownLanguage({ mode: 'gfm' }),
  },
}

const allRuleEntries = Object.keys(rules).map(ruleName => [`md-style/${ruleName}`, 'error'] as const)

const recommendedRules = Object.fromEntries(allRuleEntries)
const allRules = Object.fromEntries(allRuleEntries)

interface PluginConfigMap {
  recommended: Linter.Config
  all: Linter.Config
}

export const configs: PluginConfigMap = {
  recommended: {
    name: 'md-style/recommended',
    files: ['**/*.md'],
    plugins: {
      'md-style': plugin,
    },
    language: 'md-style/gfm',
    rules: recommendedRules,
  },
  all: {
    name: 'md-style/all',
    files: ['**/*.md'],
    plugins: {
      'md-style': plugin,
    },
    language: 'md-style/gfm',
    rules: allRules,
  },
}

export type MdStylePlugin = ESLint.Plugin & {
  configs: PluginConfigMap
}

const mdStylePlugin: MdStylePlugin = Object.assign(plugin, { configs })

export default mdStylePlugin
