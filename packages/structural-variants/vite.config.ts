import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      // strictOutput: true,
      exclude: [
        'vite.config.ts',
        'scripts/*',
        'alignments-playground',
        'alignments-dev-server'
      ]
    })
  ],
  base: '',
  build: {
    lib: {
      entry: [
        'alignments/index.ts'
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