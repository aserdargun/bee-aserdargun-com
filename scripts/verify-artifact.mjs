import assert from 'node:assert/strict';
import { access, readFile } from 'node:fs/promises';

for (const path of ['index.html', '404.html', 'staticwebapp.config.json', 'release.json', 'art/meadows-paper.png']) {
  await access(`out/${path}`);
}
const html = await readFile('out/index.html', 'utf8');
const assets = new Set([...html.matchAll(/(?:src|href)="(\/_next\/[^"?#]+)/g)].map(match => match[1]));
assert.ok([...assets].some(path => path.endsWith('.js')), 'Missing static JavaScript');
assert.ok([...assets].some(path => path.endsWith('.css')), 'Missing static stylesheet');
for (const path of assets) await access(`out${path}`);
const release = JSON.parse(await readFile('out/release.json', 'utf8'));
assert.equal(release.repository, 'aserdargun/bee-aserdargun-com');
if (process.env.GITHUB_ACTIONS === 'true') {
  assert.equal(release.commit, process.env.GITHUB_SHA, 'Wrong release commit');
  assert.equal(release.dirty, false, 'CI artifact contains uncommitted source changes');
}
console.log(`BEE artifact verified: entry points, config, art, release and ${assets.size} referenced assets.`);
