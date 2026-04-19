import { Command } from 'commander';

const program = new Command();
program.name('actionspy').version('0.1.0').description('Passive macOS activity monitor for Stream Deck candidates');

program
  .command('start')
  .description('Start the daemon')
  .option('--foreground', 'run inline instead of via pm2')
  .action((opts) => import('./start.js').then(m => m.run(opts)));

program
  .command('stop')
  .description('Stop the daemon (pm2)')
  .action(() => import('./stop.js').then(m => m.run()));

program
  .command('status')
  .description('Show daemon status and last event times')
  .action(() => import('./status.js').then(m => m.run()));

program
  .command('top <type>')
  .description('Show top subjects for a given event type (zsh|app|browser)')
  .option('--days <n>', 'window size in days', '14')
  .option('--limit <n>', 'row count', '30')
  .option('--json', 'emit JSON instead of a table')
  .action((type, opts) => import('./top.js').then(m => m.run(type, opts)));

program
  .command('report')
  .description('Full activity report')
  .option('--days <n>', 'window size', '14')
  .option('--json')
  .action((opts) => import('./report.js').then(m => m.run(opts)));

program
  .command('suggest')
  .description('Stream Deck automation shortlist')
  .option('--days <n>', 'window size', '14')
  .option('--limit <n>', 'row count', '20')
  .option('--json')
  .action((opts) => import('./suggest.js').then(m => m.run(opts)));

program
  .command('doctor')
  .description('Check permissions and environment')
  .action(() => import('./doctor.js').then(m => m.run()));

program
  .command('ui')
  .description('Open the dashboard (http://localhost:3046) in the default browser')
  .option('--port <n>', 'override port', '3046')
  .action((opts) => import('./ui.js').then(m => m.run(opts)));

program.parseAsync().catch(err => {
  console.error(err);
  process.exit(1);
});
