const MULTI_VERB = new Set(['docker', 'git', 'kubectl', 'npm', 'yarn', 'pnpm', 'brew', 'pm2']);

export function commandFamily(raw) {
  const tokens = (raw || '').trim().split(/\s+/);
  if (!tokens.length || !tokens[0]) return '';
  let family = tokens[0];
  let consumed = 1;
  if (MULTI_VERB.has(tokens[0]) && tokens[1]) {
    family += ' ' + tokens[1];
    consumed = 2;
  }
  if (tokens.length > consumed) family += ' *';
  return family;
}
