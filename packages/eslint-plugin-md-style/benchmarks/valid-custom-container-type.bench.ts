import { it } from 'vitest'

import { findAstTypeIssues } from '../rules/valid-custom-container-type'
import { findLegacyTypeIssues } from '../rules/valid-custom-container-type/legacy'

const source = Array.from({ length: 100 }, (_, index) => `:::: ${index % 2 ? 'WARNING' : 'info'} Section ${index}\n::: note\ncontent ${index}\n:::\n::::`).join('\n')

it('valid-custom-container-type parser benchmark', async ({ bench }) => {
  const astIssues = findAstTypeIssues(source)
  const legacyIssues = findLegacyTypeIssues(source)
  if (astIssues.length !== legacyIssues.length)
    throw new Error(`Benchmark implementations disagree: AST=${astIssues.length}, legacy=${legacyIssues.length}`)

  await bench('new @md-style/ast parser', () => {
    findAstTypeIssues(source)
  }).run()
  await bench('legacy line parser baseline', () => {
    findLegacyTypeIssues(source)
  }).run()
})
