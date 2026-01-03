import { mkdirSync, writeFileSync, readdirSync, statSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function copyTemplate(templateName, destination, variables) {
  const templateDir = join(__dirname, '../templates', templateName);
  
  // Calculate app tag name if not provided
  if (!variables.appTagName) {
    const sourceName = variables.packageName || variables.projectName;
    variables.appTagName = sourceName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  }

  // Helper to recursively copy and transform
  function copyRecursive(source, dest) {
    const stats = statSync(source);
    
    if (stats.isDirectory()) {
      // Skip tests directory if testing is not enabled
      if (source.endsWith('tests') && !variables.testing) {
        return;
      }

      if (!existsSync(dest)) {
        mkdirSync(dest, { recursive: true });
      }
      
      const files = readdirSync(source);
      for (const file of files) {
        copyRecursive(join(source, file), join(dest, file));
      }
    } else {
      // Skip app.routes.js if router is not enabled
      if (source.endsWith('app.routes.js') && !variables.router) {
        return;
      }

      // Skip i18n directory if i18n is not enabled
      if (source.includes('/i18n/') && !variables.i18n) {
        return;
      }

      let content = readFileSync(source, 'utf-8');
      
      // Replace placeholders
      content = content.replace(/{{projectName}}/g, variables.projectName);
      content = content.replace(/{{packageName}}/g, variables.packageName || variables.projectName);
      content = content.replace(/{{appTagName}}/g, variables.appTagName);
      content = content.replace(/{{currentYear}}/g, new Date().getFullYear().toString());

      // Handle app.component.js generation
      if (source.endsWith('app.component.js')) {
        const imports = ["import { Component } from '@modernjs/core';"];
        const inject = {};
        const pipes = {};
        const onInit = [];
        
        if (variables.router) {
          imports[0] = "import { Component, Router } from '@modernjs/core';";
          imports.push("import { routes } from './app.routes.js';");
          inject.router = 'Router';
          onInit.push('this.router.register(routes);');
        } else {
          imports.push("import { HomePage } from './pages/home.page.js';");
        }

        if (variables.i18n) {
          if (variables.router) {
            imports[0] = "import { Component, Router, I18nService, TranslatePipe } from '@modernjs/core';";
          } else {
            imports[0] = "import { Component, I18nService, TranslatePipe } from '@modernjs/core';";
          }
          imports.push("import { LANGUAGES, DEFAULT_LANGUAGE } from './i18n/config.js';");
          inject.i18n = 'I18nService';
          pipes.translate = 'TranslatePipe';
          onInit.push(`this.i18n.configure({
      languages: LANGUAGES,
      defaultLanguage: DEFAULT_LANGUAGE
    });`);
        }

        imports.push("import './styles/main.css';");

        const template = ``;

        let componentBody = `/**
 * Main Application Component.
 * Acts as the root container and layout for the application.
 */
export const App = Component.create({
  selector: '${variables.appTagName}-app',

  state: {
    appName: '${variables.projectName}'
  },`;

        if (Object.keys(inject).length > 0) {
          const injectStr = Object.entries(inject)
            .map(([k, v]) => `    ${k}: ${v}`)
            .join(',\n');
          componentBody += `\n\n  // Dependencies
  inject: {\n${injectStr}\n  },`;
        }

        if (Object.keys(pipes).length > 0) {
          const pipesStr = Object.entries(pipes)
            .map(([k, v]) => `    ${k}: ${v}`)
            .join(',\n');
          componentBody += `\n\n  // Pipes
  pipes: {\n${pipesStr}\n  },`;
        }
        
        componentBody += `\n\n  template: \`
    <div class="app-container">
      <header class="app-header">
        <div class="logo">{{ appName }}</div>
        ${variables.i18n ? `<div class="lang-switch">
          <button (click)="setLang('en')">EN</button>
          <button (click)="setLang('fr')">FR</button>
        </div>` : ''}
      </header>
      <main class="app-content">
        ${variables.router ? '<router-outlet></router-outlet>' : '<home-page></home-page>'}
      </main>
    </div>
  \`,`;

        if (onInit.length > 0) {
          componentBody += `\n\n  onInit() {
    ${onInit.join('\n    ')}
  },`;
        }

        if (variables.i18n) {
            componentBody += `\n\n  setLang(lang) {
    this.i18n.setLocale(lang);
  }`;
        }

        componentBody += '\n});';

        content = imports.join('\n') + '\n\n' + componentBody;
      }

      // Handle home.page.js for i18n
      if (source.endsWith('home.page.js') && variables.i18n) {
        content = `import { Component, TranslatePipe } from '@modernjs/core';

export const HomePage = Component.create({
  selector: 'home-page',
  pipes: {
    translate: TranslatePipe
  },
  template: \`
    <div class="home-container">
      <div class="hero">
        <h1>{{ 'WELCOME' | translate }}</h1>
        <p>{{ 'READY' | translate }}</p>
        <div class="actions">
          <a href="https://github.com/modernjs/framework" target="_blank" class="btn primary">{{ 'DOCS' | translate }}</a>
        </div>
      </div>
    </div>
  \`
});`;
      }

      if (variables.testing) {
        content = content.replace(/{{testConfig}}/g, `test: {
    environment: 'jsdom',
    globals: true,
    coverage: {
      reporter: ['text', 'json', 'html']
    }
  }`);
      } else {
        content = content.replace(/{{testConfig}}/g, '');
      }
      
      // Handle conditional sections if any (simple approach for now)
      if (source.endsWith('package.json')) {
        try {
            const pkg = JSON.parse(content);
            if (!variables.testing) {
                delete pkg.scripts.test;
                delete pkg.devDependencies.vitest;
                delete pkg.devDependencies.jsdom;
            }
            content = JSON.stringify(pkg, null, 2);
        } catch (e) {
            console.warn('Failed to parse package.json for conditional modification', e);
        }
      }

      writeFileSync(dest, content);
    }
  }

  try {
    copyRecursive(templateDir, destination);
    // console.log(`Template ${templateName} copied to ${destination}`);
  } catch (error) {
    console.error('Error copying template:', error);
    throw error;
  }
}
