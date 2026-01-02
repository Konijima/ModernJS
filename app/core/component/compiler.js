import { h, createTextVNode } from './vdom.js';

/**
 * Compiles a template string into a render function that returns a VNode tree.
 */
export function compileToVNode(template) {
    // 1. Parse to AST
    const ast = parse(template);
    
    // 2. Generate Code
    const code = generate(ast);
    
    // 3. Create Function
    try {
        return new Function('h', 'createTextVNode', 'context', code);
    } catch (e) {
        console.error('Compiler Error:', e);
        console.log('Generated Code:', code);
        throw e;
    }
}

// --- Parser ---

function parse(template) {
    const root = { type: 'root', children: [] };
    const stack = [root];
    
    // Regex to match tokens
    // 1. Control Flow Start: @if(...){ | @for(...){
    // 2. Control Flow End: }
    // 3. Tag Open: <tagName ...>
    // 4. Tag Close: </tagName>
    // 5. Interpolation: {{...}}
    // 6. Text: (captured between others)
    
    const regex = /(@(?:if|for|else\s*if|else)\s*(?:\(.*\))?\s*\{)|(\})|(<\/?[a-zA-Z0-9-:]+(?:\s+[^>]*?)?\/?>)|(\{\{.*?\}\})/g;
    
    let lastIndex = 0;
    let match;
    
    while ((match = regex.exec(template)) !== null) {
        const index = match.index;
        
        // Handle text before the match
        if (index > lastIndex) {
            const text = template.slice(lastIndex, index);
            if (text.trim()) {
                current(stack).children.push({ type: 'text', content: text });
            }
        }
        
        const token = match[0];
        
        if (match[1]) { // Control Flow Start
            const type = token.startsWith('@if') ? 'if' : 
                         token.startsWith('@for') ? 'for' : 
                         token.startsWith('@else') ? 'else' : 'unknown';
            
            const node = { type, content: token, children: [] };
            
            // Extract condition/expression
            if (type === 'if' || type === 'for') {
                const exprMatch = token.match(/\((.*)\)/);
                node.expression = exprMatch ? exprMatch[1] : '';
            }
            
            current(stack).children.push(node);
            stack.push(node);
            
        } else if (match[2]) { // Control Flow End '}'
            // Only pop if we are in a control block
            if (stack.length > 1 && ['if', 'for', 'else'].includes(current(stack).type)) {
                stack.pop();
            } else {
                // Treat as text if not matching a control block
                current(stack).children.push({ type: 'text', content: '}' });
            }
            
        } else if (match[3]) { // HTML Tag
            const tagStr = match[3];
            const isClose = tagStr.startsWith('</');
            const isSelfClosing = tagStr.endsWith('/>');
            
            if (isClose) {
                // Find matching open tag in stack
                const tagName = tagStr.match(/<\/([a-zA-Z0-9-:]+)/)[1];
                // Pop until we find the tag (handling unclosed tags gracefully-ish)
                let i = stack.length - 1;
                while (i > 0) {
                    if (stack[i].type === 'element' && stack[i].tag === tagName) {
                        // Pop everything up to here
                        while (stack.length > i) stack.pop();
                        break;
                    }
                    i--;
                }
            } else {
                // Open Tag
                const tagNameMatch = tagStr.match(/<([a-zA-Z0-9-:]+)/);
                const tagName = tagNameMatch ? tagNameMatch[1] : 'div';
                const attrs = parseAttributes(tagStr);
                
                const node = { type: 'element', tag: tagName, props: attrs, children: [] };
                current(stack).children.push(node);
                
                // Void elements or self-closing
                const voidElements = ['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr'];
                if (!isSelfClosing && !voidElements.includes(tagName.toLowerCase())) {
                    stack.push(node);
                }
            }
            
        } else if (match[4]) { // Interpolation
            current(stack).children.push({ type: 'interpolation', content: match[4] });
        }
        
        lastIndex = regex.lastIndex;
    }
    
    // Remaining text
    if (lastIndex < template.length) {
        const text = template.slice(lastIndex);
        if (text.trim()) {
            current(stack).children.push({ type: 'text', content: text });
        }
    }
    
    return root;
}

function current(stack) {
    return stack[stack.length - 1];
}

function parseAttributes(tagStr) {
    const props = {};
    // Remove tag name and brackets
    const content = tagStr.replace(/^<[a-zA-Z0-9-:]+/, '').replace(/\/?>$/, '');
    
    // Regex for attributes: name="value" | name='value' | name=value | name
    const attrRegex = /([a-zA-Z0-9-:@.\[\]\(\)]+)(?:=(?:"([^"]*)"|'([^']*)'|([^"'\s]+)))?/g;
    
    let match;
    while ((match = attrRegex.exec(content)) !== null) {
        const name = match[1];
        const value = match[2] || match[3] || match[4] || '';
        props[name] = value;
    }
    return props;
}

// --- Generator ---

function generate(node) {
    if (node.type === 'root') {
        return `return [${node.children.map(generate).join(',')}];`;
    }
    
    if (node.type === 'text') {
        // Escape backticks
        const safeText = node.content.replace(/`/g, '\\`').replace(/\n/g, '\\n');
        return `createTextVNode(\`${safeText}\`)`;
    }
    
    if (node.type === 'interpolation') {
        // {{ expr }} -> expr
        const expr = parsePipes(node.content.slice(2, -2));
        return `createTextVNode(${expr})`;
    }
    
    if (node.type === 'element') {
        const propsObj = JSON.stringify(node.props).replace(/"([^"]+)":/g, '$1:'); // Simple cleanup
        // We need to handle dynamic props in the generated code
        // But for now, let's just pass the props object and let the runtime handle bindings
        // Actually, we need to interpolate values in props: id="{{id}}"
        
        const propsCode = generateProps(node.props);
        const childrenCode = node.children.map(generate).join(',');
        
        return `h('${node.tag}', ${propsCode}, [${childrenCode}])`;
    }
    
    if (node.type === 'if') {
        const childrenCode = node.children.map(generate).join(',');
        return `(${node.expression} ? [${childrenCode}] : null)`;
    }
    
    if (node.type === 'for') {
        // @for(item of items)
        const match = node.expression.match(/(.*)\s+of\s+(.*)/);
        if (!match) return 'null';
        let [_, item, items] = match;
        
        // Strip let/const/var from item
        item = item.replace(/^(?:let|const|var)\s+/, '');
        
        const childrenCode = node.children.map(generate).join(',');
        
        return `(${items} || []).map(${item} => [${childrenCode}])`;
    }
    
    return 'null';
}

function generateProps(props) {
    let code = '{';
    for (const [key, value] of Object.entries(props)) {
        // Handle Property Binding [prop]="expr"
        if (key.startsWith('[') && key.endsWith(']')) {
            const expr = parsePipes(value);
            code += `'${key}': ${expr},`;
        }
        // Check for interpolation in value
        else if (value.includes('{{')) {
            // Split by {{...}} to handle text and expressions separately
            const parts = value.split(/({{.*?}})/g);
            const expr = parts.map(part => {
                if (part.startsWith('{{') && part.endsWith('}}')) {
                    // It's an expression
                    const content = part.slice(2, -2);
                    return `\${${parsePipes(content)}}`;
                } else {
                    // It's text, escape backticks
                    return part.replace(/`/g, '\\`');
                }
            }).join('');
            
            code += `'${key}': \`${expr}\`,`;
        } else {
            // Static value: escape single quotes
            code += `'${key}': '${value.replace(/'/g, "\\'")}',`;
        }
    }
    code += '}';
    return code;
}

function parsePipes(expression) {
    // Reuse the pipe parser logic from template.js (simplified here)
    const parts = expression.split(/(?<!\|)\|(?!\|)/);
    if (parts.length === 1) return expression.trim();
    
    let result = parts[0].trim();
    for (let i = 1; i < parts.length; i++) {
        const pipePart = parts[i].trim();
        const [name, ...args] = pipePart.split(':').map(s => s.trim());
        const argsStr = args.length > 0 ? `, ${args.join(', ')}` : '';
        result = `context._pipes['${name}'].transform(${result}${argsStr})`;
    }
    return result;
}
