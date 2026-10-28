import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';

// Executado depois do Vite: o shell e seus bundles pertencem ao mesmo deploy.
const html = await readFile(new URL('../dist/index.html', import.meta.url), 'utf8');
const version = createHash('sha256').update(html).digest('hex');
const output = `// Gerado por scripts/embed-news-shell.mjs após o vite build.\nexport const NEWS_SHELL = ${JSON.stringify(html)};\nexport const NEWS_SHELL_VERSION = ${JSON.stringify(version)};\n`;
await writeFile(new URL('../functions/_news-shell.ts', import.meta.url), output);
