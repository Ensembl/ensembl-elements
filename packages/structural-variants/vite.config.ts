import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      // strictOutput: true,
      exclude: [
        'vite.config.ts',
        'scripts/*',
        'playgrounds',
        'alignments-dev-server',
        'sv-browser-playground'
      ]
    })
  ],
  base: '',
  build: {
    lib: {
      entry: [
        'alignments/index.ts',
        'genome-browser/index.ts',
        'nav-buttons/nav-buttons.ts',
        'sv-browser/index.ts'
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
        /^d3/,
        /^@ensembl\/ensembl-genome-browser/,
        /^@ensembl\/ensembl-elements-common/
      ],
    }
  }
});
