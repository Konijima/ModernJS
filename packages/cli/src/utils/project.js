import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';

/**
 * Find the root of a ModernJS project by looking for package.json
 * with @modernjs/core dependency
 */
export function findProjectRoot(startPath = process.cwd()) {
  let currentPath = startPath;

  while (currentPath !== '/') {
    const packageJsonPath = join(currentPath, 'package.json');

    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

        // Check if it's a ModernJS project
        if (
          packageJson.dependencies?.['@modernjs/core'] ||
          packageJson.devDependencies?.['@modernjs/core']
        ) {
          return currentPath;
        }
      } catch (error) {
        // Ignore parse errors and continue searching
      }
    }

    // Move up one directory
    const parentPath = dirname(currentPath);
    if (parentPath === currentPath) {
      break; // Reached root
    }
    currentPath = parentPath;
  }

  return null;
}

/**
 * Check if a path is inside a ModernJS project
 */
export function isInsideProject(path) {
  return findProjectRoot(path) !== null;
}

/**
 * Get project configuration
 */
export function getProjectConfig(projectRoot) {
  const packageJsonPath = join(projectRoot, 'package.json');

  if (!existsSync(packageJsonPath)) {
    return null;
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
    return {
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description,
      hasRouter: !!packageJson.dependencies?.['@modernjs/router'],
      hasTesting: !!packageJson.devDependencies?.['vitest']
    };
  } catch (error) {
    return null;
  }
}