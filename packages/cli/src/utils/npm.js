import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

export async function installDependencies(projectPath) {
  return new Promise((resolve, reject) => {
    try {
      // Check which package manager to use
      const hasYarnLock = existsSync(join(projectPath, 'yarn.lock'));
      const hasPnpmLock = existsSync(join(projectPath, 'pnpm-lock.yaml'));

      let command;
      if (hasPnpmLock) {
        command = 'pnpm install';
      } else if (hasYarnLock) {
        command = 'yarn install';
      } else {
        command = 'npm install';
      }

      // Execute install command
      execSync(command, {
        cwd: projectPath,
        stdio: 'inherit'
      });

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

export function getPackageManager() {
  try {
    execSync('pnpm --version', { stdio: 'ignore' });
    return 'pnpm';
  } catch {
    try {
      execSync('yarn --version', { stdio: 'ignore' });
      return 'yarn';
    } catch {
      return 'npm';
    }
  }
}