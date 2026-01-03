import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { App } from '../src/app.component.js';

describe('App', () => {
  let element;

  beforeEach(() => {
    element = new App();
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('should be defined', () => {
    expect(element).toBeDefined();
    expect(element.tagName.toLowerCase()).toBe('{{appTagName}}-app');
  });
});
