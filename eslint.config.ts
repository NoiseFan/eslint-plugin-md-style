import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    typescript: true,
    ignores: ['**/example'],
    test: {
      overrides: {
        'test/padding-around-after-all-blocks': 'error',
        'test/padding-around-after-each-blocks': 'error',
        'test/padding-around-before-all-blocks': 'error',
        'test/padding-around-before-each-blocks': 'error',
        'test/padding-around-describe-blocks': 'error',
        'test/padding-around-test-blocks': 'error',
      },
    },
  },
)
