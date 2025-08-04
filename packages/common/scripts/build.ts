import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { cp, copyFile } from 'fs/promises';
import { build } from 'vite';

import viteConfig from '../vite.config.ts';

const dirname = fileURLToPath(new URL('.', import.meta.url));
const rootPath = path.resolve(dirname, '..');

const stylesSourceDirectoryPath = path.resolve(rootPath, 'styles');
const iconsSourceDirectoryPath = path.resolve(rootPath, 'icons');
const fontsSourceDirectoryPath = path.resolve(rootPath, 'fonts');

const buildDirectoryPath = path.resolve(rootPath, 'dist');
const stylesBuildDirectoryPath = path.resolve(buildDirectoryPath, 'styles');
const iconsBuildDirectoryPath = path.resolve(buildDirectoryPath, 'icons');
const fontsBuildDirectoryPath = path.resolve(buildDirectoryPath, 'fonts');

const packageJsonPath = path.resolve(rootPath, 'package.json');
const npmrcPath = path.resolve(rootPath, '.npmrc');

await build({
  ...viteConfig,
  root: rootPath,
});


await cp(stylesSourceDirectoryPath, stylesBuildDirectoryPath, {
  recursive: true,
  filter: (source) => {
    // copy the styles directory itself, and all the css files inside
    return source.endsWith('styles') || source.endsWith('.css');
  }
});
await cp(iconsSourceDirectoryPath, iconsBuildDirectoryPath, { recursive: true });
await cp(fontsSourceDirectoryPath, fontsBuildDirectoryPath, { recursive: true });
await copyFile(packageJsonPath, path.resolve(buildDirectoryPath, 'package.json'));
await copyFile(npmrcPath, path.resolve(buildDirectoryPath, '.npmrc'));