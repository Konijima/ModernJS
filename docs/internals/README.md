# Internals & Architecture

Deep dive into ModernJS framework internals and architecture.

## Contents

- [Architecture](./architecture.md) - Component, Rendering & VDOM system internals
- [Rendering Flow](./rendering-flow.md) - Visual diagrams of rendering pipelines

## Topics Covered

### Architecture Document
- Component lifecycle in detail
- VDOM system implementation
- Rendering pipeline architecture
- Diffing algorithms (two-ended, keyed, index-based)
- Performance optimizations
- Code flow examples

### Rendering Flow Diagrams
- Component render cycle visualization
- VDOM diffing process flow
- Template compilation pipeline
- Event delegation system
- List operation detection
- Performance optimization decision trees
- Memory management lifecycle

## Key Concepts

### VDOM System
ModernJS uses a Virtual DOM with smart diffing algorithms:
- **Two-ended algorithm** for keyed lists
- **Fast paths** for common operations (append, prepend, swap)
- **Incremental updates** for simple property changes

### Hybrid Approach
The framework combines:
- **Web Components** for encapsulation
- **VDOM** for efficient updates
- **Direct DOM** manipulation for simple changes
- **Automatic optimization** detection

### Performance Strategy
- Event delegation at shadow root level
- Props caching with shallow comparison
- Smart list operation detection
- Incremental DOM updates when possible

## Understanding the Code

For developers who want to contribute or deeply understand ModernJS:

1. Start with [Architecture](./architecture.md) for the conceptual overview
2. Review [Rendering Flow](./rendering-flow.md) for visual understanding
3. Examine the source code in `/packages/core/src/component/`

The framework is designed to be readable and maintainable while achieving competitive performance.