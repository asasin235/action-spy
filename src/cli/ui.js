import { execFile } from 'node:child_process';
import http from 'node:http';

function checkReachable(port, timeoutMs = 1000) {
  return new Promise((resolve) => {
    const req = http.request(
      { host: '127.0.0.1', port, path: '/api/status', method: 'GET', timeout: timeoutMs },
      (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      }
    );
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
    req.end();
  });
}

export async function run(opts) {
  const port = Number(opts.port) || 3046;
  const url = `http://localhost:${port}`;

  const reachable = await checkReachable(port);
  if (!reachable) {
    console.error(`Daemon not reachable on ${url}.`);
    console.error(`Start it first:  actionspy start    (or: actionspy start --foreground)`);
    process.exit(1);
  }

  execFile('open', [url], (err) => {
    if (err) {
      console.error(`Failed to open ${url}: ${err.message}`);
      process.exit(1);
    }
    console.log(`Opened ${url}`);
  });
}
