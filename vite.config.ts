/// <reference types="vitest" />

import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import nodeExternals from 'rollup-plugin-node-externals'
import { resolve } from 'path'

export default defineConfig({
  build: {
    lib: {
      entry: [resolve('src/index.ts'), resolve('src/bin.ts')],
      formats: ['cjs', 'es'],
    },
  },
  plugins: [nodeExternals(), dts()],
  test: {
    include: ['src/test/*.test.ts'],
  },
})
