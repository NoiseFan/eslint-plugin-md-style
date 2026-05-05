# eslint-plugin-md-style

[![npm version](https://img.shields.io/npm/v/eslint-plugin-md-style)](https://www.npmjs.com/package/eslint-plugin-md-style)
[![npm downloads](https://img.shields.io/npm/dm/eslint-plugin-md-style)](https://www.npmjs.com/package/eslint-plugin-md-style)
[![codecov](https://codecov.io/gh/NoiseFan/eslint-plugin-md-style/graph/badge.svg)](https://codecov.io/gh/NoiseFan/eslint-plugin-md-style)

ESLint plugin for enforcing style rules in Markdown-based documentation.

## Overview

`eslint-plugin-md-style` provides Markdown-specific style rules and ready-to-use flat configs for `**/*.md` files.

It currently ships:

- A `recommended` config for typical documentation linting
- An `all` config that enables every rule in this plugin
- Markdown language registration built on top of `@eslint/markdown`

## Quick Start

Install the required packages:

```bash
pnpm add -D eslint @eslint/markdown eslint-plugin-md-style
```

Then enable the recommended config in your ESLint flat config:

```ts
import mdStyle from 'eslint-plugin-md-style'

export default [
  mdStyle.configs.recommended,
]
```

If you want full enforcement, replace `mdStyle.configs.recommended` with `mdStyle.configs.all`.

## Usage

### Manual Flat Config Usage

Use the built-in preset directly:

```ts
import mdStyle from 'eslint-plugin-md-style'

export default [
  mdStyle.configs.recommended,
]
```

You can also enable the plugin manually and choose rules one by one:

```ts
import mdStyle from 'eslint-plugin-md-style'

export default [
  {
    files: ['**/*.md'],
    plugins: {
      'md-style': mdStyle,
    },
    language: 'md-style/commonmark',
    rules: {
      'md-style/space-between-link': 'error',
      'md-style/valid-heading-anchor': 'error',
    },
  },
]
```

<details>
<summary>Usage with <code>@antfu/eslint-config</code></summary>

```ts
import antfu from '@antfu/eslint-config'
import mdStyle from 'eslint-plugin-md-style'

export default antfu(
  {
    formatters: true,
    markdown: true,
  },
  mdStyle.configs.recommended,
)
```

For partial adoption, start from `recommended` and override individual rules:

```ts
import antfu from '@antfu/eslint-config'
import mdStyle from 'eslint-plugin-md-style'

export default antfu(
  {
    formatters: true,
    markdown: true,
  },
  mdStyle.configs.recommended,
  {
    files: ['**/*.md'],
    rules: {
      'md-style/valid-heading-anchor': 'off',
    },
  },
)
```

</details>

## Rules

| Rule | Included in `recommended` | Autofix |
| --- | --- | --- |
| `md-style/space-between-link` | ✅ | 🔧 |
| `md-style/valid-heading-anchor` | ✅ | 🔧 |

## Why `@eslint/markdown` Is Required

This plugin builds on top of `@eslint/markdown` rather than replacing it.

`@eslint/markdown` provides the Markdown processor and language support. This plugin re-exports those capabilities through its own plugin entry and adds documentation style rules on top, including the `md-style/commonmark` language used by the bundled configs.

## License

[MIT](./LICENSE) License © 2025-PRESENT [Noise Fan](https://github.com/noisefan)
