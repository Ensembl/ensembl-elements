# Info on packaging

## Include assets
- CSS files
- SVG files

## Generate typescript definitions
- See https://lit.dev/docs/components/defining/#typescript-typings

```ts
declare global {
  interface HTMLElementTagNameMap {
    "my-element": MyElement;
  }
}
```

## Building with Vite

- When building in library mode, for web components, there will be multiple entries (one per component)
- Remember to generate the `.d.ts` file

From Copilot — vite.config.ts

```ts
import { defineConfig } from 'vite';
import path from 'path';
import fg from 'fast-glob';
import dts from 'vite-plugin-dts';

const entries = fg.sync('src/**/index.ts').reduce((acc, file) => {
  const name = path.basename(path.dirname(file));
  acc[name] = path.resolve(__dirname, file);
  return acc;
}, {} as Record<string, string>);

export default defineConfig({
  plugins: [dts()],
  build: {
    target: 'esnext',
    lib: {
      entry: entries,
      formats: ['es'],
    },
    rollupOptions: {
      output: {
        entryFileNames: '[name].js',
      },
    },
  },
});
```


## Research

### Package.json

`package.json` `files` field

From the docs:

> The optional files field is an array of file patterns that describes the entries to be included when your package is installed as a dependency. File patterns follow a similar syntax to .gitignore, but reversed: including a file, directory, or glob pattern (*, **/*, and such) will make it so that file is included in the tarball when it's packed. Omitting the field will make it default to ["*"], which means it will include all files.


=========

`package.json` `exports` field

> The "exports" provides a modern alternative to "main" allowing multiple entry points to be defined, conditional entry resolution support between environments, and preventing any other entry points besides those defined in "exports". This encapsulation allows module authors to clearly define the public interface for their package.