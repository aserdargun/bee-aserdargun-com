import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

const base = new URL(process.env.BEE_BASE_URL || '');
assert.equal(base.protocol, 'https:');
assert.ok(base.hostname.endsWith('.azurestaticapps.net'), 'Expected an Azure-generated hostname');
const expected = process.env.GITHUB_SHA || execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
let verified = false;
for (let attempt = 0; attempt < 12; attempt++) {
  const response = await fetch(new URL(`/release.json?commit=${expected}`, base), { signal: AbortSignal.timeout(15000) });
  if (response.ok && response.headers.get('content-type')?.includes('application/json')) {
    const release = await response.json();
    if (release.commit === expected) {
      assert.equal(release.repository, 'aserdargun/bee-aserdargun-com');
      assert.equal(release.branch, 'main');
      assert.equal(release.dirty, false);
      verified = true; break;
    }
  }
  await new Promise(resolve => setTimeout(resolve, 5000));
}
assert.ok(verified, 'Production release does not match the intended commit');
for (const [path, type] of [['/', 'text/html'], ['/art/meadows-paper.png', 'image/png']]) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(15000) });
  assert.equal(response.status, 200, `HTTP error: ${path}`);
  assert.ok(response.headers.get('content-type')?.includes(type), `Wrong content type: ${path}`);
  await response.arrayBuffer();
}
console.log(`BEE production verified: ${base.origin} at ${expected}`);
