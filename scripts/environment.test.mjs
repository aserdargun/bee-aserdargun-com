import { test } from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { stopOwned } from './stop-dev.mjs';

async function listener(cwd) {
  const child = spawn(process.execPath, ['--input-type=module', '-e', 'import http from "node:http"; const server=http.createServer((q,r)=>r.end("test")); server.listen(0,"127.0.0.1",()=>console.log(server.address().port));'], { cwd, stdio: ['ignore', 'pipe', 'inherit'] });
  const [chunk] = await once(child.stdout, 'data');
  return { child, port: Number(String(chunk).trim()) };
}
test('Codex environment delegates Setup / Run / Validate / Stop', async () => {
  const file = await readFile(new URL('../.codex/environments/environment.toml', import.meta.url), 'utf8');
  assert.match(file, /version = 1/); assert.match(file, /npm ci/);
  for (const name of ['Run', 'Validate', 'Stop']) assert.match(file, new RegExp(`name = "${name}"`));
  for (const command of ['dev:codex', 'validate:codex', 'stop:codex']) assert.ok(file.includes(command));
});
test('Stop closes a listener belonging to this checkout and is idempotent', async () => {
  const { child, port } = await listener(process.cwd());
  try {
    const done = once(child, 'exit');
    await stopOwned(port); await done; await stopOwned(port);
    assert.notEqual(child.exitCode, undefined);
  } finally { if (child.exitCode === null && !child.killed) child.kill('SIGTERM'); }
});
test('Stop refuses a foreign listener and leaves it reachable', async () => {
  const cwd = await mkdtemp(join(tmpdir(), 'bee-foreign-'));
  const { child, port } = await listener(cwd);
  try {
    await assert.rejects(() => stopOwned(port), /another checkout/);
    const response = await fetch(`http://127.0.0.1:${port}`); assert.equal(await response.text(), 'test');
  } finally { const done = once(child, 'exit'); child.kill('SIGTERM'); await done; await rm(cwd, { recursive: true }); }
});
