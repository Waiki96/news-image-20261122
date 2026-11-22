// main.ts — entrypoint. Copies the pre-rendered front page to the output
// directory. Standard library only, no network, fully deterministic:
// the same entry.png bytes are copied on every run, so two runs agree.
import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
fs.mkdirSync(outDir, { recursive: true });
fs.copyFileSync(path.join(here, 'entry.png'), path.join(outDir, 'entry.png'));
