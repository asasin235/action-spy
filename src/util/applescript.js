import { execFile } from 'node:child_process';

export function osascript(script, { timeoutMs = 1500 } = {}) {
  return new Promise((resolve, reject) => {
    execFile('osascript', ['-e', script], { timeout: timeoutMs }, (err, stdout, stderr) => {
      if (err) return reject(err);
      resolve(stdout.toString());
    });
  });
}

const FRONTMOST_SCRIPT = `
tell application "System Events"
  set frontApp to name of first application process whose frontmost is true
  try
    set winTitle to name of front window of application process frontApp
  on error
    set winTitle to ""
  end try
end tell
return frontApp & "\\n" & winTitle
`;

export async function getFrontmost() {
  const out = await osascript(FRONTMOST_SCRIPT);
  const [app = '', ...rest] = out.split('\n');
  const title = rest.join('\n').trim();
  return { app: app.trim(), title };
}
