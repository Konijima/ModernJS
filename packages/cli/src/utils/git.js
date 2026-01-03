import { execSync } from 'child_process';

export async function initGit(projectPath) {
  return new Promise((resolve, reject) => {
    try {
      // Initialize git repository
      execSync('git init', {
        cwd: projectPath,
        stdio: 'ignore'
      });

      // Create initial commit
      execSync('git add -A', {
        cwd: projectPath,
        stdio: 'ignore'
      });

      execSync('git commit -m "Initial commit from ModernJS CLI"', {
        cwd: projectPath,
        stdio: 'ignore'
      });

      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

export function isGitInstalled() {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export function getGitUsername() {
  try {
    // Try to get git user name
    const username = execSync('git config user.name', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim();

    return username || null;
  } catch {
    return null;
  }
}

export function getGitEmail() {
  try {
    // Try to get git user email
    const email = execSync('git config user.email', {
      encoding: 'utf-8',
      stdio: ['pipe', 'pipe', 'ignore']
    }).trim();

    return email || null;
  } catch {
    return null;
  }
}