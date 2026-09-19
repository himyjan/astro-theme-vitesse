import antfu from '@antfu/eslint-config'

export default antfu({
  'comma-dangle': ['error', 'always'],
  'vue': true,
  'typescript': true,
  'astro': true,
  'formatters': {
    astro: true,
    css: true,
  },
})
