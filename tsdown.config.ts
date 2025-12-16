import { defineConfig } from 'tsdown'

export default defineConfig({
  format: ['esm'],
  dts: false,
  unbundle: true,
  clean: true,
  entry: ['src/index.ts', 'src/commands/*.ts', 'src/services/*.ts', 'src/listeners/*.ts'],
})
