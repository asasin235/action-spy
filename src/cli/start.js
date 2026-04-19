import { execSync } from 'node:child_process';
import path from 'node:path';
import { config } from '../config.js';

export async function run(opts) {
  if (opts.foreground) {
    process.env.ACTIONSPY_FOREGROUND = '1';
    const { main } = await import('../daemon/index.js');
    await main();
    return;
  }

  const binPath = path.join(config.projectRoot, 'bin', 'actionspy');
  try {
    execSync(`pm2 describe actionspy >/dev/null 2>&1`, { stdio: 'ignore' });
    console.log('actionspy is already registered with pm2. Restarting...');
    execSync(`pm2 restart actionspy`, { stdio: 'inherit' });
  } catch {
    execSync(`pm2 start "${binPath}" --name actionspy --interpreter node -- start --foreground`, {
      stdio: 'inherit',
    });
    console.log('\nTo survive reboots, run: pm2 save && pm2 startup');
  }
}
