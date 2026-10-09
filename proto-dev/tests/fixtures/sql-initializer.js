import { readFile } from 'node:fs/promises';
import initialize from '../../assets/libs/db/sql-wasm.esm.js';
export async function testSqlInitializer(options = {}) {
  return initialize({
    ...options,
    wasmBinary: new Uint8Array(
      await readFile(new URL('../../assets/libs/db/sql-wasm.wasm', import.meta.url)),
    ),
  });
}
