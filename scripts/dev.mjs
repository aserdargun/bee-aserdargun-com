import { spawn } from 'node:child_process';
import { stopOwned, ROOT } from './stop-dev.mjs';
await stopOwned();
const child = spawn(process.execPath, ['node_modules/next/dist/bin/next', 'dev', '--webpack', '--hostname', '127.0.0.1', '--port', '3017'], { cwd: ROOT, stdio: 'inherit' });
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('exit', (code) => { process.exitCode = code ?? 0; });
