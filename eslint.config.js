import globals from 'globals'
import js from '@eslint/js'
import ts from 'typescript-eslint'
import prettier from 'eslint-plugin-prettier/recommended'

/** @type { import("eslint").Linter.FlatConfig } */
export default [
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  js.configs.recommended,
  ...ts.configs.recommended,
  prettier,
  {
    ignores: ['dist/', 'docs/'],
    rules: {
      'prettier/prettier': 1,
    },
  },
]
