import { chmod, copyFile, mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const userHome = process.env.HOME;

if (!userHome) {
  throw new Error('A home directory is required for the local installation.');
}

const dataDirectory = process.env.XDG_DATA_HOME ?? resolve(userHome, '.local/share');

const binarySource = resolve(root, 'src-tauri/target/release/veyrilo');
const iconSource = resolve(root, 'src-tauri/icons/128x128.png');
const desktopTemplate = resolve(root, 'packaging/linux/veyrilo.desktop.in');
const executable = resolve(userHome, '.local/bin/veyrilo');
const temporaryExecutable = `${executable}.tmp-${process.pid}`;
const desktopEntry = resolve(dataDirectory, 'applications/Veyrilo.desktop');
const iconTarget = resolve(dataDirectory, 'icons/hicolor/128x128/apps/veyrilo.png');

await mkdir(dirname(executable), { recursive: true });
await mkdir(dirname(desktopEntry), { recursive: true });
await mkdir(dirname(iconTarget), { recursive: true });

try {
  await copyFile(binarySource, temporaryExecutable);
  await chmod(temporaryExecutable, 0o755);
  await rename(temporaryExecutable, executable);
} finally {
  await rm(temporaryExecutable, { force: true });
}
await copyFile(iconSource, iconTarget);

const template = await readFile(desktopTemplate, 'utf8');
await writeFile(
  desktopEntry,
  template
    .replace('@VEYRILO_EXECUTABLE@', executable)
    .replace('@VEYRILO_ICON@', iconTarget),
  'utf8',
);

console.log(`Veyrilo installed. Open it from your application menu or run: ${executable}`);
