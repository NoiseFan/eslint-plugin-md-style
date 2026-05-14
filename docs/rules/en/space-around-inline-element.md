# Space Around Inline Elements

Keep spacing around Markdown inline elements consistent.

This rule focuses on `link`, `image`, `inlineCode`, `emphasis`, and `strong` nodes in normal prose. It helps keep spacing around inline elements and punctuation predictable, especially in content that mixes different writing systems or punctuation styles.

## Rule Details

By default, this rule requires selected inline elements to have exactly one space around them when they are adjacent to plain text.

This rule only checks the following node types: `link`, `image`, `inlineCode`, `emphasis`, and `strong`.

The following are not checked: reference-style links and images, inline HTML nodes, plain text nodes, and hard break nodes.

In addition to normal text flow, the rule adjusts its spacing requirements based on adjacent punctuation:

- If an inline element is preceded by fullwidth punctuation, an opening paired punctuation mark, or `/`, there must be no space before it.
- If an inline element is preceded by halfwidth punctuation, there must be exactly one space before it.
- If an inline element is followed by fullwidth punctuation, English commas or periods, or a closing paired punctuation mark, there must be no space after it.
- If an inline element is followed by a dash-like punctuation mark or a halfwidth opening parenthesis, there must be exactly one space after it.

:::tip
1. Adjacent selected inline elements are normalized so that only the required spacing remains around them. For example: `` `snapshotA`/`snapshotB` `` and `**CLI option:** \`--browser.ui\``.
2. Leading and trailing whitespace inside table cells is ignored by this rule, but spacing around multiple inline elements inside the same cell is still checked.
3. Special cases such as trailing heading anchors and VitePress custom container markers are skipped to avoid merging content into the next line or into an anchor.
:::

Examples of **correct** code for this rule:

```md
See the [Getting Started](/guide/) guide.
Run `pnpm test` to verify the result.
This is **strong** text.
See ![Example image](/img/example.png) for details.
See.[Getting Started](/guide/) guide.
See [Getting Started](/guide/).
Use the `-t` (or `--testNamePattern`) option to filter tests.
See details in (`option` notes).
`toMatchSnapshot()`/`toMatchInlineSnapshot()`/`toMatchFileSnapshot()`
| Item | Value |
| --- | --- |
| Working directory | `/path` `/to/project` |
```

Examples of **incorrect** code for this rule:

```md
See[Getting Started](/guide/) guide.
Run`pnpm test`to verify the result.
This is**strong**text.
See![Example image](/img/example.png)for details.
See. [Getting Started](/guide/) guide.
See [Getting Started](/guide/) .
Use`-t` (or `--testNamePattern`) option to filter tests.
`toMatchSnapshot()` / `toMatchInlineSnapshot()` / `toMatchFileSnapshot()`
```

This rule is autofixable.

## When Not To Use It

If your project does not want to enforce a single spacing style around Markdown inline elements, or if you prefer to leave this entirely to another formatter, you can turn this rule off.
