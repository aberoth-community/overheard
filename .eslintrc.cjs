/** @type { import("eslint").Linter.Config } */
module.exports = {
  root: true,
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ['eslint:recommended', 'standard', 'prettier'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 'latest',
  },
  plugins: ['prettier'],
  rules: {
    'prettier/prettier': 1,
  },
  overrides: [
    {
      files: ['*.ts'],
      extends: ['plugin:@typescript-eslint/recommended', 'standard-with-typescript', 'prettier'],
      parserOptions: {
        project: 'tsconfig.eslint.json',
      },
      rules: {
        '@typescript-eslint/triple-slash-reference': 0,
      },
    },
  ],
}
