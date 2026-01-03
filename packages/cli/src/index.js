import { program } from 'commander';
import chalk from 'chalk';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Commands
import { createCommand } from './commands/create.js';
import { addCommand } from './commands/add.js';
import { serveCommand } from './commands/serve.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load package.json for version
const packageJson = JSON.parse(readFileSync(join(__dirname, '../package.json'), 'utf-8'));

// ASCII Art Logo
const logo = chalk.cyan(`
╔══════════════════════════════════════╗
║       ModernJS Framework CLI         ║
║   Pure JavaScript Web Applications   ║
╚══════════════════════════════════════╝
`);

program
  .name('modernjs')
  .description('CLI tool for ModernJS framework')
  .version(packageJson.version)
  .addHelpText('before', logo);

// Create new project command
program
  .command('create <project-name>')
  .alias('new')
  .description('Create a new ModernJS project')
  .option('-t, --template <template>', 'Project template (basic, full)', 'basic')
  .option('--no-git', 'Skip git initialization')
  .option('--no-install', 'Skip package installation')
  .action(createCommand);

// Add components/services/etc to existing project
program
  .command('add <type> <name>')
  .alias('generate')
  .alias('g')
  .description('Add a new component, service, guard, etc. to your project')
  .option('-p, --path <path>', 'Custom path for the generated file')
  .option('-f, --force', 'Overwrite existing files')
  .action(addCommand);

// Development server command
program
  .command('serve')
  .alias('dev')
  .description('Start the development server')
  .option('-p, --port <port>', 'Port to run the server on', '5173')
  .option('-o, --open', 'Open browser on server start')
  .action(serveCommand);

// Parse command line arguments
program.parse(process.argv);

// Show help if no command is provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}