import { spawn } from 'node:child_process';
import { access } from 'node:fs/promises';
import { stopOwned, ROOT } from './stop-dev.mjs';
await stopOwned();
async function run(command, args) {
  await new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd: ROOT, stdio: 'inherit' });
    child.on('error', reject); child.on('exit', code => code === 0 ? resolve() : reject(new Error(`${command} ${args.join(' ')} failed: ${code}`)));
  });
}
for (const step of ['typecheck', 'test', 'test:environment', 'build', 'test:e2e']) await run('npm', ['run', step]);
await access('out/index.html'); await access('out/staticwebapp.config.json');
await run('git', ['diff', '--check']);
console.log('BEE validation complete: kernel, environment, static build and rendered browser workflows.');
