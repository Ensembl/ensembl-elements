import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = fileURLToPath(new URL('.', import.meta.url));
const rootPath = path.resolve(dirname, '..');

const buildDirectoryPath = path.resolve(rootPath, 'dist');

import { execSync } from 'child_process';

const PUBLISH_TOKEN = process.env.PUBLISH_TOKEN;

if (!PUBLISH_TOKEN) {
  const errorMessage = 'The token for publishing the package is missing. Please add it to the .env file';
  console.error(errorMessage);
  process.exit(1);
}

const cwd = process.cwd();

process.chdir(buildDirectoryPath);


console.log('reading from env file', process.env.PUBLISH_TOKEN);

execSync(`PUBLISH_TOKEN=${PUBLISH_TOKEN} npm publish`);