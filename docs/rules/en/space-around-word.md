# Space Around Word

Keep spacing between CJK characters and English words consistent.

This rule focuses on word-boundary spacing in mixed Chinese and English text. It prevents CJK characters and English words from being written directly next to each other, and also removes extra spaces between them.

## Rule Details

By default, this rule requires:

- Exactly one space between a CJK character and an adjacent English word
- Multiple consecutive spaces to be automatically collapsed into one space

Examples of **correct** code for this rule:

```md
在 watch 模式下
目前 Vitest 还不支持范围：
我们感谢 Jest 团队和社区创建了一个令人愉悦的测试 API
从 Vitest4.1 起
自 Vitest4.1 起
WebStorm、PhpStorm、IntelliJ IDEA Ultimate 和其他 JetBrains IDE 内置了对 Vitest 的支持。
A mock that always returns `undefined` isn't very useful on its own.
```

Examples of **incorrect** code for this rule:

```md
在watch 模式下
在 watch模式下
在watch模式下
在  watch 模式下
在 watch  模式下
从Vitest4.1 起
从Vitest4.1起
自 Vitest4.1  起
```

This rule is autofixable.

## When Not To Use It

If your project does not want to enforce word-boundary spacing in mixed Chinese and English text, or if this is already handled entirely by another formatter, you can turn this rule off.
