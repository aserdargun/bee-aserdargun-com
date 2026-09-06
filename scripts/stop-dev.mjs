import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { realpath } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
const exec = promisify(execFile);
export const ROOT = await realpath(fileURLToPath(new URL('..', import.meta.url)));
async function listeners(port) {
  try { const { stdout } = await exec('lsof', ['-nP', `-iTCP:${port}`, '-sTCP:LISTEN', '-t']); return [...new Set(stdout.trim().split(/\s+/).filter(Boolean).map(Number))]; }
  catch (error) { if (error.code === 1) return []; throw error; }
}
async function owns(pid) {
  try {
    const { stdout } = await exec('lsof', ['-a', '-p', String(pid), '-d', 'cwd', '-Fn']);
    const cwd = stdout.split('\n').find(line => line.startsWith('n'))?.slice(1);
    return cwd && await realpath(cwd) === ROOT;
  } catch { return false; }
}
export async function stopOwned(port = 3017) {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid port');
  const pids = await listeners(port);
  if (!pids.length) { console.log(`BEE: port ${port} is already free.`); return; }
  for (const pid of pids) if (!await owns(pid)) throw new Error(`Port ${port} belongs to another checkout; refusing to stop PID ${pid}.`);
  for (const pid of pids) { if (!await owns(pid)) throw new Error('Listener ownership changed'); process.kill(pid, 'SIGTERM'); }
  for (let attempt = 0; attempt < 24; attempt++) {
    if (!(await listeners(port)).length) { console.log(`BEE: stopped owned listener on ${port}.`); return; }
    await new Promise(r => setTimeout(r, 100));
  }
  for (const pid of await listeners(port)) {
    if (!pids.includes(pid) || !await owns(pid)) throw new Error('Listener ownership changed; refusing force stop');
    process.kill(pid, 'SIGKILL');
  }
  if ((await listeners(port)).length) throw new Error('Port did not close after stop');
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  await stopOwned(Number(process.env.BEE_PORT || 3017));
}
