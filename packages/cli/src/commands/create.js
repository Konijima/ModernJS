import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import validateNpmPackageName from 'validate-npm-package-name';

import { copyTemplate } from '../utils/template.js';
import { installDependencies } from '../utils/npm.js';
import { initGit, getGitUsername } from '../utils/git.js';

export async function createCommand(projectName, options) {
  console.log(chalk.cyan('\n🚀 Creating a new ModernJS project...\n'));

  // Generate valid package name from project name
  const packageName = projectName
    .replace(/([a-z])([A-Z])/g, '$1-$2') // Convert camelCase to kebab-case
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-') // Remove invalid characters
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens

  // Validate package name
  const validation = validateNpmPackageName(packageName);
  if (!validation.validForNewPackages) {
    console.error(chalk.red(`\n❌ Invalid project name: ${projectName} (converted to ${packageName})`));
    if (validation.errors) {
      validation.errors.forEach(error => {
        console.error(chalk.red(`   - ${error}`));
      });
    }
    process.exit(1);
  }

  const projectPath = join(process.cwd(), projectName);

  // Check if directory already exists
  if (existsSync(projectPath)) {
    console.error(chalk.red(`\n❌ Directory ${projectName} already exists!`));
    process.exit(1);
  }

  // Get git username to use as default author
  const gitUsername = getGitUsername();

  // Ask for project details if not provided
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'description',
      message: 'Project description:',
      default: 'A ModernJS application'
    },
    {
      type: 'input',
      name: 'author',
      message: 'Author name:',
      default: gitUsername || ''
    },
    {
      type: 'confirm',
      name: 'router',
      message: 'Would you like to add routing?',
      default: true
    },
    {
      type: 'confirm',
      name: 'i18n',
      message: 'Would you like to add internationalization (i18n)?',
      default: true
    },
    {
      type: 'confirm',
      name: 'testing',
      message: 'Would you like to set up testing with Vitest?',
      default: true
    }
  ]);

  // Create project directory
  const spinner = ora('Creating project structure...').start();

  try {
    mkdirSync(projectPath, { recursive: true });

    // Copy template files
    await copyTemplate(options.template, projectPath, {
      projectName,
      packageName,
      ...answers
    });

    spinner.succeed('Project structure created');

    // Initialize git repository
    if (options.git !== false) {
      const gitSpinner = ora('Initializing git repository...').start();
      try {
        await initGit(projectPath);
        gitSpinner.succeed('Git repository initialized');
      } catch (error) {
        gitSpinner.warn('Failed to initialize git repository');
      }
    }

    // Install dependencies
    if (options.install !== false) {
      const installSpinner = ora('Installing dependencies...').start();
      try {
        await installDependencies(projectPath);
        installSpinner.succeed('Dependencies installed');
      } catch (error) {
        installSpinner.fail('Failed to install dependencies');
        console.error(chalk.yellow('\n⚠️  Please run "npm install" manually in your project directory'));
      }
    }

    // Success message
    console.log(chalk.green(`\n✨ Project ${projectName} created successfully!\n`));
    console.log(chalk.cyan('📁 Project location:'), projectPath);
    console.log(chalk.cyan('\n🎯 Next steps:\n'));
    console.log(chalk.white(`   cd ${projectName}`));

    if (options.install === false) {
      console.log(chalk.white('   npm install'));
    }

    console.log(chalk.white('   npm run dev'));
    console.log(chalk.cyan('\n🐛 Issues:'), 'https://github.com/Konijima/ModernJS/issues\n');

  } catch (error) {
    spinner.fail('Failed to create project');
    console.error(chalk.red('\n❌ Error:'), error.message);
    process.exit(1);
  }
}