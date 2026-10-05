import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { addMetaPixel } from './meta_pixel.mjs';
let pages = 0;
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.isFile() && entry.name.endsWith('.html')) {
      await writeFile(path, addMetaPixel(await readFile(path, 'utf8')));
      pages++;
    }
  }
}
await walk('dist');
console.log(`Meta Pixel added to ${pages} HTML pages.`);
