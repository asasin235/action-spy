import { config } from '../config.js';
import { openDb, closeDb } from '../db.js';
import { logger } from '../logger.js';
import { createScheduler } from './scheduler.js';
import { runZshCollector } from '../collectors/zsh.js';
import { startServer, stopServer } from '../server.js';

export async function main() {
  process.env.ACTIONSPY_FOREGROUND = process.env.ACTIONSPY_FOREGROUND ?? '1';
  openDb();
  logger.info('daemon starting', { pid: process.pid, db: config.dbPath });

  startServer();

  const sched = createScheduler();

  sched.schedule({
    name: 'zsh',
    intervalMs: config.intervals.zshMs,
    jitterMs: config.intervals.zshJitterMs,
    fn: async () => {
      const res = await runZshCollector();
      if (res.inserted > 0) logger.info('zsh inserted', res);
    },
  });

  let shuttingDown = false;
  async function shutdown(signal) {
    if (shuttingDown) return;
    shuttingDown = true;
    logger.info('daemon stopping', { signal });
    await sched.drain();
    await stopServer();
    closeDb();
    process.exit(0);
  }
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));

  logger.info('daemon running');
}
