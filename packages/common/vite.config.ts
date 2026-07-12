import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { defineConfig, type Plugin } from 'vite';
import dts from 'vite-plugin-dts';

const rawDefaultImportPattern = /import\s+([A-Za-z_$][\w$]*)\s+from\s+(['"])([^'"]+\?[^'"]*\braw\b[^'"]*)\2\s*;?/g;

const inlineRawImports = (): Plugin => ({
  name: 'inline-raw-imports',
  enforce: 'pre',
  async transform(code: string, id: string) {
    if (!code.includes('?raw') || id.includes('/node_modules/')) {
      return null;
    }

    const replacements: Array<{ start: number; end: number; code: string }> = [];

    for (const match of code.matchAll(rawDefaultImportPattern)) {
      const importName = match[1];
      const importPath = match[3];
      const [filePath] = importPath.split('?');

      if (!filePath.startsWith('.') && !path.isAbsolute(filePath)) {
        continue;
      }

      const importerPath = id.split('?')[0];
      const absolutePath = path.resolve(path.dirname(importerPath), filePath);
      const contents = await readFile(absolutePath, 'utf8');

      replacements.push({
        start: match.index,
        end: match.index + match[0].length,
        code: `const ${importName} = ${JSON.stringify(contents)};`
      });
    }

    if (!replacements.length) {
      return null;
    }

    let transformedCode = code;

    for (const replacement of replacements.reverse()) {
      transformedCode = `${transformedCode.slice(0, replacement.start)}${replacement.code}${transformedCode.slice(replacement.end)}`;
    }

    return {
      code: transformedCode,
      map: null
    };
  }
});

export default defineConfig({
  plugins: [
    inlineRawImports(),
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
        'components/icon-buttons/delete-button/delete-button.ts',
        'components/icon-buttons/download-button/download-button.ts',
        'components/icon-buttons/table-view-button/table-view-button.ts',
        'components/icon-buttons/expand-button/expand-button.ts',
        'components/nav-buttons/nav-buttons.ts',
        'components/button/button.ts',
        'components/text-button/text-button.ts',
        'components/button-link/button-link.ts',
        'components/loading-button/loading-button.ts',
        'components/spinner/spinner.ts',
        'components/popup/popup.ts',

        'embl-ebi-components/page-header/page-header.ts',
        'embl-ebi-components/page-footer/page-footer.ts',

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
      external: [
        /^lit/,
        /^@floating-ui/
      ],
    }
  }
});
