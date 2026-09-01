import { rm } from 'node:fs/promises';
import { resolve } from 'node:path';

const userHome = process.env.HOME;

if (!userHome) {
  throw new Error('A home directory is required for the local removal.');
}

const dataDirectory = process.env.XDG_DATA_HOME ?? resolve(userHome, '.local/share');

await Promise.all([
  rm(resolve(userHome, '.local/bin/veyrilo'), { force: true }),
  rm(resolve(dataDirectory, 'applications/Veyrilo.desktop'), { force: true }),
  rm(resolve(dataDirectory, 'icons/hicolor/128x128/apps/veyrilo.png'), { force: true }),
]);

console.log('Veyrilo local installation removed.');
