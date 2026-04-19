import { execSync } from 'node:child_process';

export async function run() {
  try {
    execSync(`pm2 stop actionspy`, { stdio: 'inherit' });
    console.log('actionspy stopped.');
  } catch (err) {
    console.error('Could not stop via pm2. Is it installed and registered?');
    process.exit(1);
  }
}
