import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { root } from '../build/lib.mjs';
import Database from '../proto-dev/src/storage/browser/database-adapter.js';
import initialize from '../proto-dev/assets/libs/db/sql-wasm.esm.js';

export { assert };
export function deferred() {
  let resolve, reject;
  const promise = new Promise((accept, refuse) => {
    resolve = accept;
    reject = refuse;
  });
  return { promise, resolve, reject };
}
export const flush = () => new Promise((resolve) => setImmediate(resolve));
export function persistence() {
  const records = new Map();
  return {
    records,
    load(key) {
      return records.has(key) ? structuredClone(records.get(key)) : null;
    },
    save(key, value) {
      records.set(key, structuredClone(value));
    },
    remove(key) {
      records.delete(key);
    },
  };
}
export async function openDatabase(storage = persistence()) {
  const SQL = await initialize({
    wasmBinary: new Uint8Array(await readFile(`${root}/proto-dev/assets/libs/db/sql-wasm.wasm`)),
  });
  const database = new Database(':memory:', { error() {} }, async () => SQL, storage);
  await database.boot();
  return database;
}
export async function runDriver(cases, execute) {
  try {
    await execute();
    process.stdout.write(
      JSON.stringify({
        schemaVersion: 1,
        protocol: 'idp-public-driver-v1',
        results: cases.map((id) => ({ id, status: 'passed' })),
      }) + '\n',
    );
  } catch (error) {
    process.stdout.write(
      JSON.stringify({
        schemaVersion: 1,
        protocol: 'idp-public-driver-v1',
        results: cases.map((id) => ({ id, status: 'failed' })),
        error: error.stack || String(error),
      }) + '\n',
    );
    process.exitCode = 1;
  }
}
