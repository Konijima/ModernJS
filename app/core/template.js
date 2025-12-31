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
            const expr = token.slice(2, -2);
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
