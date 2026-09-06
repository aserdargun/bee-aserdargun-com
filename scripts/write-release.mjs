import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';

function git(...args) {
  try { return execFileSync('git', args, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); }
  catch { return ''; }
}

const head = git('rev-parse', 'HEAD');
const commit = process.env.GITHUB_SHA || head || null;
if (commit !== null && !/^[a-f0-9]{40}$/.test(commit)) throw new Error('Invalid release commit');
if (process.env.GITHUB_ACTIONS === 'true' && commit !== head) throw new Error('Release commit does not match checkout');

const manifest = JSON.parse(await readFile('package.json', 'utf8'));
const release = {
  repository: 'aserdargun/bee-aserdargun-com',
  commit,
  branch: process.env.GITHUB_REF_NAME || git('branch', '--show-current') || null,
  dirty: Boolean(git('status', '--porcelain')),
  applicationVersion: manifest.version,
  builtAt: new Date().toISOString(),
};
await writeFile('out/release.json', `${JSON.stringify(release, null, 2)}\n`);
console.log(`BEE release metadata: ${commit || 'local source'}${release.dirty ? ' (working changes)' : ''}`);
