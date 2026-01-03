const templates = {
  component: ({ className, fileName }) => `import { Component } from '@modernjs/core';
import './${fileName}.css';

export const ${className}Component = Component.create({
  selector: '${fileName}',

  template: \`
    <div class="${fileName}-container">
      <h2>${className} Component</h2>
      <!-- Add your component HTML here -->

      <!-- Example navigation with router-link directive:
      <nav>
        <a router-link="/home" class="nav-link">Home</a>
        <a router-link="/about" class="nav-link">About</a>
      </nav>
      -->
    </div>
  \`,

  onInit() {
    // Called when component is initialized
    console.log('${className}Component initialized');
  },

  onUpdate() {
    // Called after component updates
  },

  onDestroy() {
    // Cleanup when component is destroyed
  }
});

export default ${className}Component;`,

  service: ({ className, name }) => `export class ${className}Service {
  constructor() {
    this.baseUrl = import.meta.env.VITE_API_URL || '/api';
  }

  /**
   * Example GET request
   */
  async getAll() {
    try {
      const response = await fetch(\`\${this.baseUrl}/${name}\`);
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  /**
   * Example GET by ID request
   */
  async getById(id) {
    try {
      const response = await fetch(\`\${this.baseUrl}/${name}/\${id}\`);
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  }

  /**
   * Example POST request
   */
  async create(data) {
    try {
      const response = await fetch(\`\${this.baseUrl}/${name}\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error creating data:', error);
      throw error;
    }
  }

  /**
   * Example PUT request
   */
  async update(id, data) {
    try {
      const response = await fetch(\`\${this.baseUrl}/${name}/\${id}\`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error updating data:', error);
      throw error;
    }
  }

  /**
   * Example DELETE request
   */
  async delete(id) {
    try {
      const response = await fetch(\`\${this.baseUrl}/${name}/\${id}\`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      return response.status === 204 ? null : await response.json();
    } catch (error) {
      console.error('Error deleting data:', error);
      throw error;
    }
  }
}

export default ${className}Service;`,

  guard: ({ className, name }) => `/**
 * ${className} Guard
 * Route guard to protect routes
 */
export function ${name}Guard(to, from, next) {
  console.log(\`Guarding route: \${to.path}\`);

  // Example: Check if user is authenticated
  const isAuthenticated = checkAuthentication();

  if (isAuthenticated) {
    // Allow navigation
    next();
  } else {
    // Redirect to login or show error
    console.warn('Access denied - user not authenticated');
    next('/login');
  }
}

function checkAuthentication() {
  // Implement your authentication check logic here
  // Example: Check for token in localStorage
  const token = localStorage.getItem('auth_token');
  return !!token;
}

export default ${name}Guard;`,

  directive: ({ className, name }) => `import { Directive } from '@modernjs/core';

/**
 * ${className} Directive
 * Custom directive for ModernJS
 */
export class ${className}Directive extends Directive {
  /**
   * Called when the directive is initialized.
   */
  onInit() {
    console.log('${className}Directive initialized on', this.element);
    
    // Example: Add event listener
    this.handleClick = (e) => {
      console.log('Element clicked:', e.target);
    };
    
    this.element.addEventListener('click', this.handleClick);
    this.element.style.cursor = 'pointer';
  }

  /**
   * Called when the bound value changes.
   * @param {any} value - The new value
   */
  onUpdate(value) {
    console.log('${className}Directive updated with value:', value);
    // Update directive logic based on new binding value
  }

  /**
   * Called when the directive (or element) is destroyed.
   */
  onDestroy() {
    console.log('${className}Directive destroyed');
    // Cleanup
    if (this.handleClick) {
      this.element.removeEventListener('click', this.handleClick);
    }
  }
}

export default ${className}Directive;`,

  pipe: ({ className, name }) => `import { Pipe } from '@modernjs/core';

/**
 * ${className} Pipe
 * Transform data in templates
 */
export class ${className}Pipe extends Pipe {
  /**
   * Transform the input value
   * @param {*} value - The value to transform
   * @param {...*} args - Additional arguments
   * @returns {*} Transformed value
   */
  transform(value, ...args) {
    if (!value) return value;

    // Add your transformation logic here
    // Example: uppercase transformation
    if (typeof value === 'string') {
      return value.toUpperCase();
    }

    return value;
  }
}

export default ${className}Pipe;\`,

  store: ({ className, name }) => \`/**
 * ${className} Store
 * State management store
 */
export class ${className}Store {
  constructor() {
    this.state = {
      // Initial state
      loading: false,
      data: null,
      error: null
    };
    this.listeners = new Set();
  }

  /**
   * Get current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Update state
   */
  setState(updates) {
    this.state = {
      ...this.state,
      ...updates
    };
    this.notify();
  }

  /**
   * Subscribe to state changes
   */
  subscribe(listener) {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of state change
   */
  notify() {
    this.listeners.forEach(listener => {
      listener(this.getState());
    });
  }

  /**
   * Example async action
   */
  async fetchData() {
    this.setState({ loading: true, error: null });

    try {
      // Simulate API call
      const response = await fetch('/api/${name}');
      const data = await response.json();

      this.setState({
        loading: false,
        data
      });
    } catch (error) {
      this.setState({
        loading: false,
        error: error.message
      });
    }
  }

  /**
   * Reset store to initial state
   */
  reset() {
    this.state = {
      loading: false,
      data: null,
      error: null
    };
    this.notify();
  }
}

// Create singleton instance
export const ${name}Store = new ${className}Store();

export default ${className}Store;`,

  model: ({ className, name }) => `/**
 * ${className} Model
 * Data model class
 */
export class ${className} {
  constructor(data = {}) {
    this.id = data.id || null;
    this.createdAt = data.createdAt || new Date();
    this.updatedAt = data.updatedAt || new Date();

    // Add your model properties here
    this.name = data.name || '';
    this.description = data.description || '';
    this.status = data.status || 'active';
  }

  /**
   * Validate model data
   */
  validate() {
    const errors = [];

    if (!this.name || this.name.trim() === '') {
      errors.push('Name is required');
    }

    if (this.name && this.name.length > 100) {
      errors.push('Name must be less than 100 characters');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Convert to plain object
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * Create instance from JSON
   */
  static fromJSON(json) {
    return new ${className}(json);
  }

  /**
   * Clone the model
   */
  clone() {
    return new ${className}(this.toJSON());
  }

  /**
   * Update model properties
   */
  update(data) {
    Object.assign(this, data);
    this.updatedAt = new Date();
    return this;
  }
}

export default ${className};`,

  util: ({ name }) => `/**
 * ${name} Utility Functions
 */

/**
 * Example utility function
 * @param {*} value - Input value
 * @returns {*} Processed value
 */
export function ${name}(value) {
  // Add your utility logic here
  return value;
}

/**
 * Example async utility
 */
export async function ${name}Async(value) {
  // Add async logic here
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(value);
    }, 100);
  });
}

/**
 * Example helper function
 */
export function ${name}Helper(options = {}) {
  const defaults = {
    // Default options
  };

  const config = { ...defaults, ...options };

  // Helper logic here
  return config;
}

export default {
  ${name},
  ${name}Async,
  ${name}Helper
};`,

  css: ({ name }) => `.${name}-container {
  /* Component styles */
  padding: 1rem;
  margin: 1rem 0;
  border-radius: 8px;
  background: #f5f5f5;
}

.${name}-container h2 {
  color: #333;
  margin-bottom: 1rem;
}

/* Add more styles as needed */`,

  test: ({ className, type, name }) => `import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ${className}${type === 'component' ? 'Component' : ''} } from './${name}.${type}';

describe('${className}${type === 'component' ? 'Component' : ''}', () => {
  ${type === 'component' ? `let component;

  beforeEach(() => {
    // For Component.create() components
    component = ${className}Component;
  });

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('should have a selector', () => {
    expect(component.selector).toBeDefined();
    expect(component.selector).toBe('${name}');
  });

  it('should have a template method', () => {
    expect(component.template).toBeDefined();
    expect(typeof component.template).toBe('function');
  });

  it('should render template with correct content', () => {
    const template = component.template.call({});
    expect(template).toContain('${className} Component');
    expect(template).toContain('${name}-container');
  });` : ''}

  ${type === 'service' ? `let instance;

  beforeEach(() => {
    instance = new ${className}${type === 'component' ? 'Component' : ''}();
  });

  it('should create an instance', () => {
    expect(instance).toBeDefined();
  });

  it('should have baseUrl property', () => {
    expect(instance.baseUrl).toBeDefined();
  });

  it('should handle getAll method', async () => {
    // Mock fetch
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ data: [] })
      })
    );

    const result = await instance.getAll();
    expect(result).toEqual({ data: [] });
  });` : ''}

  ${type === 'directive' ? `let directive;
  let mockElement;
  let mockComponent;

  beforeEach(() => {
    mockElement = document.createElement('div');
    mockComponent = {};
    directive = new ${className}Directive(mockElement, mockComponent);
  });

  it('should create an instance', () => {
    expect(directive).toBeDefined();
  });

  it('should have element and component properties', () => {
    expect(directive.element).toBe(mockElement);
    expect(directive.component).toBe(mockComponent);
  });

  it('should handle onInit', () => {
    // Spy on element.addEventListener
    const addSpy = vi.spyOn(mockElement, 'addEventListener');
    
    directive.onInit();
    
    expect(addSpy).toHaveBeenCalledWith('click', expect.any(Function));
    expect(mockElement.style.cursor).toBe('pointer');
  });

  it('should handle onDestroy', () => {
    // Initialize first to set up listener
    directive.onInit();
    
    const removeSpy = vi.spyOn(mockElement, 'removeEventListener');
    
    directive.onDestroy();
    
    expect(removeSpy).toHaveBeenCalledWith('click', expect.any(Function));
  });` : ''}

  ${type !== 'component' && type !== 'service' && type !== 'directive' ? `let instance;

  beforeEach(() => {
    instance = new ${className}${type === 'component' ? 'Component' : ''}();
  });

  it('should create an instance', () => {
    expect(instance).toBeDefined();
  });` : ''}

  // Add more tests as needed
});`
};

export function generateFile(type, variables) {
  const template = templates[type];

  if (!template) {
    throw new Error(`No template found for type: ${type}`);
  }

  return template(variables);
}