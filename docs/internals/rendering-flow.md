# ModernJS Rendering Flow Diagrams

## Component Render Cycle

```
┌─────────────────────────────────────────────────────────────────┐
│                      Component Render Cycle                      │
└─────────────────────────────────────────────────────────────────┘

    User Interaction / State Change
              │
              ▼
    ┌──────────────────┐
    │  State Updated    │
    │  via Proxy Set    │
    └──────────────────┘
              │
              ▼
    ┌──────────────────┐
    │  update() called  │
    │  (batched via RAF)│
    └──────────────────┘
              │
              ▼
    ┌──────────────────────────┐
    │  Incremental Update Check │
    │  analyzePatch()            │
    └──────────────────────────┘
              │
              ├─── Simple Change ──→ ┌─────────────────────┐
              │                       │  Direct DOM Update  │
              │                       │  (Skip VDOM)        │
              │                       └─────────────────────┘
              │
              └─── Complex Change ──→ ┌─────────────────────┐
                                       │  Full VDOM Process  │
                                       └─────────────────────┘
                                                 │
                                                 ▼
                                       ┌─────────────────────┐
                                       │  render() method    │
                                       │  returns template   │
                                       └─────────────────────┘
                                                 │
                                                 ▼
                                       ┌─────────────────────┐
                                       │  Compile to VNodes  │
                                       │  (if string)        │
                                       └─────────────────────┘
                                                 │
                                                 ▼
                                       ┌─────────────────────┐
                                       │  VDOM Diffing       │
                                       │  Algorithm          │
                                       └─────────────────────┘
                                                 │
                                                 ▼
                                       ┌─────────────────────┐
                                       │  Apply DOM Updates  │
                                       │  (minimal changes)  │
                                       └─────────────────────┘
```

## VDOM Diffing Algorithm Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      VDOM Diffing Process                       │
└─────────────────────────────────────────────────────────────────┘

         Old VNodes                    New VNodes
              │                            │
              └──────────┬─────────────────┘
                         ▼
            ┌─────────────────────────┐
            │  Check for Fast Paths   │
            └─────────────────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    │                    │                    │
    ▼                    ▼                    ▼
┌─────────┐      ┌─────────────┐      ┌────────────┐
│ Append? │      │   Prepend?   │      │   Swap?    │
└─────────┘      └─────────────┘      └────────────┘
    │                    │                    │
    │                    │                    │
    └────────────────────┼────────────────────┘
                         │
                    No Fast Path
                         │
                         ▼
            ┌─────────────────────────┐
            │  Check for Keys         │
            └─────────────────────────┘
                         │
           Yes ──────────┼────────── No
           │                          │
           ▼                          ▼
┌─────────────────────┐    ┌─────────────────────┐
│  Keyed Diffing      │    │  Index Diffing      │
│  (Two-ended)        │    │  (Simple position)  │
└─────────────────────┘    └─────────────────────┘
           │                          │
           └──────────┬───────────────┘
                      ▼
         ┌─────────────────────────┐
         │  Generate DOM Operations │
         │  - Create nodes          │
         │  - Update attributes     │
         │  - Move nodes            │
         │  - Remove nodes          │
         └─────────────────────────┘
```

## Template Compilation Pipeline

```
┌─────────────────────────────────────────────────────────────────┐
│                   Template Compilation Flow                      │
└─────────────────────────────────────────────────────────────────┘

    String Template
    "<div>{{ state.count }}</div>"
              │
              ▼
    ┌──────────────────┐
    │  Parse Template   │
    │  (Tokenize)       │
    └──────────────────┘
              │
              ▼
    ┌──────────────────────────┐
    │  Identify:               │
    │  - Interpolations {{}}    │
    │  - Directives @if/@for    │
    │  - Event bindings (click) │
    │  - Props bindings [prop]  │
    └──────────────────────────┘
              │
              ▼
    ┌──────────────────┐
    │  Generate AST     │
    │  (Abstract Syntax │
    │   Tree)           │
    └──────────────────┘
              │
              ▼
    ┌──────────────────────────┐
    │  Generate Function       │
    │  function(h, text, ctx) { │
    │    return h('div', {},    │
    │      [text(ctx.state.     │
    │        count)])            │
    │  }                         │
    └──────────────────────────┘
              │
              ▼
    ┌──────────────────┐
    │  Cache Function   │
    │  this._renderFn    │
    └──────────────────┘
```

## Event Handling Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Event Delegation Flow                       │
└─────────────────────────────────────────────────────────────────┘

                    DOM Event Occurs
                          │
                          ▼
            ┌──────────────────────────┐
            │  Shadow Root Listener    │
            │  (Single per event type) │
            └──────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │  Find Target Element     │
            │  event.target             │
            └──────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │  Walk up DOM tree        │
            │  Check for handlers      │
            └──────────────────────────┘
                          │
                          ▼
            ┌──────────────────────────┐
            │  Found handler?          │
            │  element._delegatedH...  │
            └──────────────────────────┘
                          │
                    Yes ──┴── No (continue)
                     │
                     ▼
            ┌──────────────────────────┐
            │  Execute Handler         │
            │  in component context    │
            └──────────────────────────┘
                     │
                     ▼
            ┌──────────────────────────┐
            │  Handler may trigger     │
            │  state change            │
            └──────────────────────────┘
                     │
                     ▼
              (Back to Render Cycle)
```

## List Operation Detection

```
┌─────────────────────────────────────────────────────────────────┐
│                    List Operation Detection                      │
└─────────────────────────────────────────────────────────────────┘

    Old: [A, B, C]        New: [A, B, C, D, E]
           │                        │
           └────────┬───────────────┘
                    ▼
        ┌────────────────────┐
        │  Compare lengths   │
        │  Old: 3, New: 5    │
        └────────────────────┘
                    │
                    ▼
        ┌────────────────────┐
        │  Check first 3     │
        │  A=A? ✓ B=B? ✓     │
        │  C=C? ✓            │
        └────────────────────┘
                    │
                    ▼
        ┌────────────────────┐
        │  Detected: APPEND  │
        │  Fast path: just   │
        │  add D, E to end   │
        └────────────────────┘

    ─────────────────────────────────────────

    Old: [A, B, C, D]    New: [A, D, C, B]
           │                      │
           └──────┬───────────────┘
                  ▼
        ┌────────────────────┐
        │  Same length: 4    │
        │  Check differences │
        └────────────────────┘
                  │
                  ▼
        ┌────────────────────┐
        │  Diff at index 1,3 │
        │  B→D, D→B           │
        └────────────────────┘
                  │
                  ▼
        ┌────────────────────┐
        │  Detected: SWAP    │
        │  Fast path: swap   │
        │  nodes 1 and 3     │
        └────────────────────┘
```

## Performance Optimization Decision Tree

```
┌─────────────────────────────────────────────────────────────────┐
│                 Performance Optimization Flow                    │
└─────────────────────────────────────────────────────────────────┘

                State Change Detected
                        │
                        ▼
            ┌───────────────────────┐
            │  What changed?        │
            └───────────────────────┘
                        │
       ┌────────────────┼────────────────┐
       │                │                │
       ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│Single prop? │  │List change? │  │Complex?     │
└─────────────┘  └─────────────┘  └─────────────┘
       │                │                │
       ▼                ▼                ▼
┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│Direct DOM   │  │Check pattern │  │Full VDOM    │
│update       │  │(append/swap) │  │diff         │
└─────────────┘  └─────────────┘  └─────────────┘
       │                │                │
       │                ├─ Pattern? ─→ Fast path
       │                │
       │                └─ No pattern → Full diff
       │                                 │
       └────────────────┬────────────────┘
                        ▼
                ┌─────────────┐
                │  DOM Updated │
                └─────────────┘
```

## Memory Management

```
┌─────────────────────────────────────────────────────────────────┐
│                      Memory Lifecycle                            │
└─────────────────────────────────────────────────────────────────┘

    Component Created
           │
           ▼
    ┌─────────────┐
    │  Allocate:  │
    │  - State    │
    │  - Shadow   │
    │  - Refs     │
    └─────────────┘
           │
           ▼
    ┌─────────────────────┐
    │  During Updates:    │
    │  - Reuse VNodes     │
    │  - Cache props      │
    │  - Pool text nodes  │
    └─────────────────────┘
           │
           ▼
    ┌─────────────────────┐
    │  Component Removed  │
    └─────────────────────┘
           │
           ▼
    ┌─────────────────────┐
    │  Cleanup:           │
    │  - Clear bindings   │
    │  - Remove listeners │
    │  - Unsubscribe      │
    │  - Clear refs       │
    └─────────────────────┘
           │
           ▼
    ┌─────────────────────┐
    │  Garbage Collection │
    └─────────────────────┘
```

## Summary

These diagrams illustrate the key flows in ModernJS:

1. **Component Render Cycle**: Shows how state changes trigger updates
2. **VDOM Diffing**: Details the algorithm for finding minimal updates
3. **Template Compilation**: How strings become executable functions
4. **Event Delegation**: Efficient event handling at scale
5. **List Operations**: Smart detection of common patterns
6. **Performance Decisions**: How the framework chooses optimization strategies
7. **Memory Management**: Lifecycle of component resources

Each flow is optimized for performance while maintaining simplicity and predictability.