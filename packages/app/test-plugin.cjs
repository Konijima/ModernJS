try {
    const plugin = require('@modernjs/language-service');
    console.log('Plugin loaded successfully');
    
    const ts = require('typescript');
    console.log('TypeScript found:', ts.version);
} catch (e) {
    console.error('Error loading modules:', e);
}
