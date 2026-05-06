# Space between inline elemnt

## Rule Details

Keep selected Markdown inline elements surrounded by clean spacing.

This rule checks `link`, `image`, `inlineCode`, `emphasis`, and `strong` nodes. It does not check reference links, reference images, HTML, text, or hard break nodes.

## Valid

```md
在 [入门指南](/guide/) 中，
执行 `pnpm test` 验证
这是 **strong** 文本
```

## Invalid

```md
在[入门指南](/guide/)中，
执行`pnpm test`验证
这是**strong**文本
```

This rule is autofixable.
