---
title: Getting Started | Guide
next:
  text: Writing Tests
  link: /guide/learn/writing-tests
---

---
title: 使用插件 | 指南
---

# Getting Started

## Overview

# 你的第一个测试 # Your first test

# 你的第一个测试 {#Your first test}

# 中文标题

## 使用 `describe` 编组测试 #Grouping Tests with `describe`

## Vitest 5.0 发布了！#vitest 5.0 is out

## equal

- **类型:** `<T>(actual: T, expected: T, message?: string) => void`

断言 `actual` 和 `expected` 非严格相等 (==)。

```ts
import { assert, test } from 'vitest'

test('assert.equal', () => {
  assert.equal(Math.sqrt(4), '2')
})
```
<!-- use vue-component to render markdown -->

# Custom Pool <Badge type="danger">advanced</Badge> {#custom-pool}

<!-- inline-code -->

It is recommended that you install a copy of`vitest` in your`package.json`

如果在`package.json`中安装一份`vitest`的副本

<!-- emphasis & strong -->

## isFunction

- **Type:**`<T>(value: T, message?: string) => void`
- __Alias:__`isCallable`
Asserts that`value`is a function.

## isFunction

-**类型:**`<T>(value: T, message?: string) => void`
-**别名:**`isCallable`
断言`value`是一个函数。
