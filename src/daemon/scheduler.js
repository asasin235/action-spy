import { logger } from '../logger.js';

export function createScheduler() {
  const timers = [];
  let stopping = false;
  const inflight = new Set();

  function schedule({ name, intervalMs, jitterMs = 0, fn, runImmediately = true }) {
    async function tick() {
      if (stopping) return;
      const p = Promise.resolve().then(fn).catch(err => {
        logger.error(`collector error`, { name, err: err.message, stack: err.stack });
      });
      inflight.add(p);
      p.finally(() => inflight.delete(p));
      await p;
      if (stopping) return;
      const next = intervalMs + (Math.random() * 2 - 1) * jitterMs;
      const t = setTimeout(tick, Math.max(100, next));
      t.unref?.();
      timers.push(t);
    }
    if (runImmediately) tick();
    else {
      const t = setTimeout(tick, intervalMs);
      timers.push(t);
    }
  }

  async function drain() {
    stopping = true;
    for (const t of timers) clearTimeout(t);
    timers.length = 0;
    await Promise.allSettled([...inflight]);
  }

  return { schedule, drain };
}
