/**
 * Simple template engine supporting @if, @for, and {{ }}
 * @param {string} template 
 * @param {object} context 
 * @returns {string}
 */
export function compileTemplate(template, context) {
    let code = "let __out = '';\n";
    
    let cursor = 0;
    // Regex to match control blocks and interpolation
    // Matches: @if(...){, @for(...){, @else if(...){, @else{, }, {{...}}
    // Added 'm' flag and ^\s*\} to only match closing braces at the start of a line (ignoring indentation)
    // This prevents matching } inside object literals in attributes
    const regex = /(@if\s*\(.*?\)\s*\{|@for\s*\(.*?\)\s*\{|@else\s*if\s*\(.*?\)\s*\{|@else\s*\{|^\s*\}|{{.*?}})/gm;
    
    let match;
    while ((match = regex.exec(template)) !== null) {
        const token = match[0];
        const text = template.slice(cursor, match.index);
        
        if (text) {
            // If we are about to output an 'else' block, we must ignore preceding whitespace
            // to ensure valid JS syntax (if } else {).
            if (token.startsWith('@else') && !text.trim()) {
                // Skip whitespace
            } else {
                // Escape backticks in text
                code += `__out += \`${text.replace(/`/g, '\\`')}\`;\n`;
            }
        }
        
        if (token.startsWith('@')) {
            // Control flow: remove @ and add to code
            code += token.slice(1) + '\n';
        } else if (token.trim() === '}') {
            // Closing brace (trimmed to handle indentation)
            code += '}\n';
        } else if (token.startsWith('{{')) {
            // Interpolation: remove {{ and }} and add to code
            const content = token.slice(2, -2);
            const expr = parsePipes(content);
            code += `__out += (${expr});\n`;
        }
        
        cursor = match.index + token.length;
    }
    
    // Add remaining text
    const text = template.slice(cursor);
    if (text) {
        code += `__out += \`${text.replace(/`/g, '\\`')}\`;\n`;
    }
    
    code += "return __out;";
    
    try {
        // Create function with context bound to 'this'
        return new Function(code).call(context);
    } catch (e) {
        console.error("Template Error:", e);
        console.debug("Generated Code:", code);
        return `<div class="error">Template Error: ${e.message}</div>`;
    }
}

/**
 * Parses pipe syntax in expressions.
 * Example: "value | uppercase" -> "this._pipes['uppercase'].transform(value)"
 * @param {string} expression 
 * @returns {string} Transformed expression
 */
function parsePipes(expression) {
    // Simple pipe parser: splits by | that are not part of ||
    // Note: This is a basic implementation and might fail on complex expressions containing strings with |
    const parts = expression.split(/(?<!\|)\|(?!\|)/);
    
    if (parts.length === 1) return expression;

    let result = parts[0].trim();
    
    for (let i = 1; i < parts.length; i++) {
        const pipePart = parts[i].trim();
        if (!pipePart) continue;
        
        // Parse pipe name and args: pipeName : arg1 : arg2
        // Note: Simple split by : might break on object literals or ternary operators
        const [name, ...args] = pipePart.split(':').map(s => s.trim());
        
        const argsStr = args.length > 0 ? `, ${args.join(', ')}` : '';
        
        // Generate code to transform value
        result = `(this._pipes && this._pipes['${name}'] ? this._pipes['${name}'].transform(${result}${argsStr}) : ${result})`;
    }
    
    return result;
}
