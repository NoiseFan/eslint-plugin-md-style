# Space Around Quot

Enforce spacing inside and around paired quotation marks in Markdown text.

## Rule Details

`space-around-quot` checks paired Chinese quotation marks `“”` and `‘’`, and ASCII quotation marks `""` and `''`, within one text node. Horizontal space immediately inside the marks is removed. Quotes containing CJK text and no Latin letters use `“”`; quotes containing Latin letters and no CJK text use ASCII quotes (either single or double). Mixed-language and letterless content keeps its original marks. By default, ASCII quotes have one space next to surrounding words, while Chinese quotes have none. Following the Chinese example, an opening Chinese quote after a Han character has one preceding space. Quotes touch fullwidth punctuation, enclosing punctuation, and other quotes. A closing quote also touches an immediately following ASCII comma, period, or similar punctuation.

The rule checks text nodes in paragraphs, headings, list items, and link labels. It does not pair quotes across separate text nodes.

## Options

The rule accepts one object option:

```json
{
  "halfwidth": "always",
  "fullwidth": "never"
}
```

Each property accepts `"always"` for one external ASCII space or `"never"` for no external space. The defaults are `"always"` and `"never"`, respectively. These options do not change internal spacing or punctuation boundaries. With `fullwidth: "never"`, an opening Chinese quote after a Han character still has one preceding space.

## Valid

```md
He said "hello" and left.
It's fine to say 'hello'.
```

With `{ "halfwidth": "never" }`:

```md
"hello"world
```

With `{ "fullwidth": "always" }`:

```md
He said “hello” and left.
```

## Invalid

```md
He said" hello "and left.
```

For the Chinese quotation boundary:

```md
他说“ 你好 ”，然后说"hello world"。
他说 "你好"。
```

## Autofix

The fixer removes horizontal padding inside quotes, inserts, removes, or collapses horizontal spacing outside them, and replaces quote marks when the content is entirely Chinese or English. The English invalid example becomes:

```md
He said "hello" and left.
```

It does not cross line breaks or change surrounding prose.

## Ignored Contexts

Fenced code, inline code, HTML comments, and YAML frontmatter are not text nodes checked by this rule. Apostrophes within words, such as `It's`, are not quote marks. Escaped and unmatched quotes, and pairs split across text nodes, are left unchanged.

## When Not To Use It

Disable this rule if the project follows a different quotation spacing convention.
