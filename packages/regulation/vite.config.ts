import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    // dts()
    dts({
      // strictOutput: true,
      exclude: [
        'vite.config.ts',
        'scripts/*',
        'playgrounds',
        'region-annotation/popupInjector.ts'
      ]
    })
  ],
  base: '',
  build: {
    lib: {
      entry: [
        'region-annotation/index.ts',
        'epigenome-activity/index.ts'
      ],
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        preserveModulesRoot: '.',
        preserveModules: true
      },
      external: [
        /^lit/,
        /^d3/
      ],
    }
  }
});