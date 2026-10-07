import type { InvalidTestCase, ValidTestCase } from 'eslint-vitest-rule-tester'
import markdown from '@eslint/markdown'
import { run } from 'eslint-vitest-rule-tester'
import rule, { MESSAGE_IDS, RULE_NAME } from './index'

const valid: ValidTestCase[] = [
  { code: '他说 “你好”，然后说 "hello world"。' },
  { code: 'He said "hello" and left.' },
  { code: 'It\'s fine to say \'hello\'.' },
  { code: '“中文”接着 “中文”' },
  { code: '“”""' },
  { code: '`他说“ 你好 ”`' },
  { code: '"hello"world', options: [{ halfwidth: 'never' }] },
  { code: '他说 “你好” 然后走了', options: [{ fullwidth: 'always' }] },
  { code: 'Read "hello" `code` next.' },
  { code: 'Read `code` "hello" next.' },
  { code: 'The"first""second"pair', options: [{ halfwidth: 'never' }] },
  { code: '他说 “你好”，然后说 "hello"。' },
  { code: '["hello"](/guide)' },
  { code: '*"hello"*' },
  { code: 'A "中英 mixed" phrase.' },
  { code: 'A "hello"\n"world" pair.' },
  { code: 'He wrote \\"hello\\" today.' },
  { code: 'He wrote \\* and said "hello".' },
  { code: 'A &amp; said "hello".' },
]

const invalid: InvalidTestCase[] = [
  {
    code: '他说“ 你好 ”，然后说"hello world"。',
    output: '他说 “你好”，然后说 "hello world"。',
    errors: Array.from({ length: 4 }, () => ({ messageId: MESSAGE_IDS.incorrectSpacing })),
  },
  {
    code: 'He said" hello "and left.',
    output: 'He said "hello" and left.',
    errors: Array.from({ length: 4 }, () => ({ messageId: MESSAGE_IDS.incorrectSpacing })),
  },
  {
    code: '他说 “你好” 然后走了',
    output: '他说 “你好”然后走了',
    errors: [{ messageId: MESSAGE_IDS.incorrectSpacing }],
  },
  {
    code: '他说“你好”然后走了',
    options: [{ fullwidth: 'always' }],
    output: '他说 “你好” 然后走了',
    errors: Array.from({ length: 2 }, () => ({ messageId: MESSAGE_IDS.incorrectSpacing })),
  },
  {
    code: 'Read "hello"`code` next.',
    output: 'Read "hello" `code` next.',
    errors: [{ messageId: MESSAGE_IDS.incorrectSpacing }],
  },
  {
    code: 'Read `code`"hello" next.',
    output: 'Read `code` "hello" next.',
    errors: [{ messageId: MESSAGE_IDS.incorrectSpacing }],
  },
  {
    code: '他说 "你好"。',
    output: '他说 “你好”。',
    errors: Array.from({ length: 2 }, () => ({ messageId: MESSAGE_IDS.incorrectSpacing })),
  },
  {
    code: 'He said “hello” yesterday.',
    output: 'He said "hello" yesterday.',
    errors: Array.from({ length: 2 }, () => ({ messageId: MESSAGE_IDS.incorrectSpacing })),
  },
  {
    code: 'He wrote “ draft ready ” in the guide.',
    output: 'He wrote "draft ready" in the guide.',
    errors: Array.from({ length: 2 }, () => ({ messageId: MESSAGE_IDS.incorrectSpacing })),
  },
  {
    code: '# He said"hello".',
    output: '# He said "hello".',
    errors: [{ messageId: MESSAGE_IDS.incorrectSpacing }],
  },
  {
    code: 'He wrote \\* and said"hello".',
    output: 'He wrote \\* and said "hello".',
    errors: [{ messageId: MESSAGE_IDS.incorrectSpacing }],
  },
  {
    code: 'A &amp; said"hello".',
    output: 'A &amp; said "hello".',
    errors: [{ messageId: MESSAGE_IDS.incorrectSpacing }],
  },
  {
    code: 'He wrote \\" and said"hello".',
    output: 'He wrote \\" and said "hello".',
    errors: [{ messageId: MESSAGE_IDS.incorrectSpacing }],
  },
  {
    code: '[" hello "](/guide)',
    output: '["hello"](/guide)',
    errors: Array.from({ length: 2 }, () => ({ messageId: MESSAGE_IDS.incorrectSpacing })),
  },
]

run({
  name: RULE_NAME,
  rule,
  valid,
  invalid,
  configs: {
    plugins: { markdown },
    language: 'markdown/gfm',
  },
})
