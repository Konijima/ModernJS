import chalk from 'chalk';
import ora from 'ora';
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { join, dirname, basename } from 'path';
import inquirer from 'inquirer';

import { generateFile } from '../utils/generator.js';
import { findProjectRoot } from '../utils/project.js';

const VALID_TYPES = [
  'component',
  'service',
  'guard',
  'directive',
  'pipe',
  'store',
  'model',
  'util'
];

export async function addCommand(type, name, options) {
  // Validate type
  if (!VALID_TYPES.includes(type)) {
    console.error(chalk.red(`\n❌ Invalid type: ${type}`));
    console.log(chalk.cyan('\n📝 Valid types are:'));
    VALID_TYPES.forEach(t => console.log(chalk.white(`   - ${t}`)));
    process.exit(1);
  }

  // Find project root
  const projectRoot = findProjectRoot();
  if (!projectRoot) {
    console.error(chalk.red('\n❌ Not in a ModernJS project directory!'));
    console.log(chalk.yellow('💡 Make sure you are in a project created with "modernjs create"'));
    process.exit(1);
  }

  // Normalize name (convert to kebab-case for file names)
  const kebabName = name.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  const pascalName = name.charAt(0).toUpperCase() + name.slice(1).replace(/-./g, x => x[1].toUpperCase());
  const camelName = name.charAt(0).toLowerCase() + name.slice(1).replace(/-./g, x => x[1].toUpperCase());

  // Determine file path
  let filePath;
  if (options.path) {
    filePath = join(projectRoot, options.path);
  } else {
    // Default paths based on type
    const defaultPaths = {
      component: 'src/components',
      service: 'src/services',
      guard: 'src/guards',
      directive: 'src/directives',
      pipe: 'src/pipes',
      store: 'src/store',
      model: 'src/models',
      util: 'src/utils'
    };

    const baseDir = join(projectRoot, defaultPaths[type] || 'src');
    filePath = join(baseDir, `${kebabName}.${type}.js`);
  }

  // Check if file already exists
  if (existsSync(filePath) && !options.force) {
    const { overwrite } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'overwrite',
        message: `File ${filePath} already exists. Overwrite?`,
        default: false
      }
    ]);

    if (!overwrite) {
      console.log(chalk.yellow('\n⚠️  Operation cancelled'));
      process.exit(0);
    }
  }

  // Create directory if it doesn't exist
  const dir = dirname(filePath);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }

  const spinner = ora(`Generating ${type} "${name}"...`).start();

  try {
    // Generate file content
    const content = generateFile(type, {
      name: camelName,
      className: pascalName,
      fileName: kebabName
    });

    // Write file
    writeFileSync(filePath, content);

    spinner.succeed(`${type} "${name}" generated successfully!`);

    // Additional files for components
    if (type === 'component') {
      // Generate CSS file
      const cssPath = filePath.replace('.component.js', '.css');
      const cssContent = generateFile('css', { name: kebabName });
      writeFileSync(cssPath, cssContent);
      console.log(chalk.green(`✓ Created ${cssPath}`));

      // Generate test file if testing is set up
      const testPath = filePath.replace('.component.js', '.test.js');
      const testContent = generateFile('test', {
        name: camelName,
        className: pascalName,
        type
      });
      writeFileSync(testPath, testContent);
      console.log(chalk.green(`✓ Created ${testPath}`));
    }

    console.log(chalk.cyan(`\n📁 File created at: ${filePath}`));

    // Show usage hint
    showUsageHint(type, name, filePath, projectRoot);

  } catch (error) {
    spinner.fail(`Failed to generate ${type}`);
    console.error(chalk.red('\n❌ Error:'), error.message);
    process.exit(1);
  }
}

function showUsageHint(type, name, filePath, projectRoot) {
  const relativePath = filePath.replace(projectRoot, '.').replace(/\\/g, '/');

  console.log(chalk.cyan('\n💡 Usage example:\n'));

  switch (type) {
    case 'component':
      console.log(chalk.white(`   import { ${name}Component } from '${relativePath.replace('.js', '')}';\n`));
      console.log(chalk.white(`   const component = new ${name}Component();`));
      console.log(chalk.white(`   component.render();`));
      break;

    case 'service':
      console.log(chalk.white(`   import { ${name}Service } from '${relativePath.replace('.js', '')}';\n`));
      console.log(chalk.white(`   const service = new ${name}Service();`));
      console.log(chalk.white(`   await service.getData();`));
      break;

    case 'guard':
      console.log(chalk.white(`   import { ${name}Guard } from '${relativePath.replace('.js', '')}';\n`));
      console.log(chalk.white(`   router.beforeEach(${name}Guard);`));
      break;

    case 'store':
      console.log(chalk.white(`   import { ${name}Store } from '${relativePath.replace('.js', '')}';\n`));
      console.log(chalk.white(`   const store = new ${name}Store();`));
      console.log(chalk.white(`   store.subscribe(state => console.log(state));`));
      break;

    default:
      console.log(chalk.white(`   import { ${name} } from '${relativePath.replace('.js', '')}';`));
  }

  console.log('');
}