import chalk from 'chalk';
import { spawn } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';

import { findProjectRoot } from '../utils/project.js';

export function serveCommand(options) {
  console.log(chalk.cyan('\n🚀 Starting ModernJS development server...\n'));

  // Find project root
  const projectRoot = findProjectRoot();
  if (!projectRoot) {
    console.error(chalk.red('\n❌ Not in a ModernJS project directory!'));
    console.log(chalk.yellow('💡 Make sure you are in a project created with "modernjs create"'));
    process.exit(1);
  }

  // Check if vite config exists
  const viteConfig = join(projectRoot, 'vite.config.js');
  if (!existsSync(viteConfig)) {
    console.error(chalk.red('\n❌ No vite.config.js found in project root!'));
    console.log(chalk.yellow('💡 Make sure you have a valid ModernJS project'));
    process.exit(1);
  }

  // Build the vite command with options
  const viteArgs = ['run', 'dev'];

  if (options.port) {
    viteArgs.push('--', '--port', options.port);
  }

  if (options.open) {
    viteArgs.push('--open');
  }

  console.log(chalk.cyan('📁 Project root:'), projectRoot);
  console.log(chalk.cyan('🌐 Port:'), options.port || '5173');
  console.log('');

  // Spawn npm process
  const npmProcess = spawn('npm', viteArgs, {
    cwd: projectRoot,
    stdio: 'inherit',
    shell: true
  });

  // Handle process events
  npmProcess.on('error', (error) => {
    console.error(chalk.red('\n❌ Failed to start development server:'), error.message);
    process.exit(1);
  });

  npmProcess.on('close', (code) => {
    if (code !== 0) {
      console.error(chalk.red(`\n❌ Development server exited with code ${code}`));
      process.exit(code);
    }
  });

  // Handle SIGINT (Ctrl+C)
  process.on('SIGINT', () => {
    console.log(chalk.yellow('\n\n👋 Stopping development server...'));
    npmProcess.kill('SIGINT');
    process.exit(0);
  });
}