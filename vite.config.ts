import { defineConfig, type Plugin } from 'vite'

/**
 * Remove shebang plugin for vitest / vite-node
 *
 * Allows avoiding "#!/usr/bin/env vite-node --script"
 * @see https://github.com/vitest-dev/vitest/issues/1175#issuecomment-1113969517
 * @returns Vite Plugin
 */
const RemoveShebangPlugin = (): Plugin => ({
  name: 'vite-remove-shebang',
  enforce: 'pre',
  transform: (code) => code.replace(/^#!.*/, ''),
})

export default defineConfig({
  plugins: [RemoveShebangPlugin()],
  test: {
    include: ['src/test/*.test.ts'],
  },
})
