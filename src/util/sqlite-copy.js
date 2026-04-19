import fs from 'node:fs';
import path from 'node:path';

export async function copyToTemp(srcPath, destPath) {
  await fs.promises.mkdir(path.dirname(destPath), { recursive: true });
  await fs.promises.copyFile(srcPath, destPath);

  const walSrc = `${srcPath}-wal`;
  const shmSrc = `${srcPath}-shm`;
  try {
    await fs.promises.access(walSrc, fs.constants.R_OK);
    await fs.promises.copyFile(walSrc, `${destPath}-wal`);
  } catch {
    /* WAL optional */
  }
  try {
    await fs.promises.access(shmSrc, fs.constants.R_OK);
    await fs.promises.copyFile(shmSrc, `${destPath}-shm`);
  } catch {
    /* SHM optional */
  }
}
