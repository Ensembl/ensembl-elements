import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts()
    // dts({
    //   strictOutput: true,
    //   exclude: ['vite.config.ts']
    // })
  ],
  build: {
    lib: {
      entry: [
        'components/checkbox/checkbox.ts',
        'components/checkbox/checkbox-only.ts',
        'components/external-link/external-link.ts',
        'components/text-button/text-button.ts'
      ],
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        preserveModules: true
      },
      external: /^lit/,
      // external: ['lit']
    }
  }
});