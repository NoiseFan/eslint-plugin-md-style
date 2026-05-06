# Space between inline elemnt

## 规则详情

保持选定 Markdown 行内元素周围的空格风格一致。

该规则检查 `link`、`image`、`inlineCode`、`emphasis`、`strong` 节点。暂不检查引用链接、引用图片、HTML、普通文本和硬换行节点。

## 正确示例

```md
在 [入门指南](/guide/) 中，
执行 `pnpm test` 验证
这是 **strong** 文本
```

## 错误示例

```md
在[入门指南](/guide/)中，
执行`pnpm test`验证
这是**strong**文本
```

该规则支持自动修复。
