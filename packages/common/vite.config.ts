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
  base: '',
  build: {
    lib: {
      entry: [
        'components/checkbox/checkbox.ts',
        'components/checkbox/checkbox-only.ts',
        'components/external-link/external-link.ts',
        'components/paginator/paginator.ts',
        'components/select/select.ts',
        'components/table/sortable-column-header.ts',
        'components/text-button/text-button.ts',
        'components/icon-buttons/delete-button/delete-button.ts',
        'components/icon-buttons/download-button/download-button.ts',
        'components/icon-buttons/table-view-button/table-view-button.ts',
        'components/button/button.ts',

        'styles/constructable-stylesheets/resets.ts',
        'styles/constructable-stylesheets/button-resets.ts',
        'styles/constructable-stylesheets/table.ts'
      ],
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        preserveModulesRoot: '.',
        preserveModules: true
      },
      external: /^lit/,
      // external: ['lit']
    }
  }
});