import * as fs from 'fs';

export function isDir(targetPath: string): boolean {
  try {
    return fs.lstatSync(targetPath).isDirectory();
  } catch {
    return false;
  }
}

export function getSlashCount(str: string): number {
  let count = 0;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '/') {
      count++;
    }
  }
  return count;
}
