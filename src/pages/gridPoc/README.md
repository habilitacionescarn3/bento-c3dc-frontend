# Grid Layout POC

**Status:** ✅ SUCCESSFUL
**Completed:** March 17, 2026
**Route:** `/grid-poc`

A proof of concept for integrating `react-grid-layout` with C3DC's tech stack (React 17, MUI 4, Webpack 4, styled-components) before implementing in the Cohort Analyzer.

---

## File Structure

```
src/pages/gridPoc/
├── index.js              # Export file
├── GridPocView.js        # Page wrapper component
├── GridPocDashboard.js   # react-grid-layout with dynamic card management
├── DemoCard.js           # Draggable card with remove button
├── AddCardPlaceholder.js # Ghostly plus button for adding cards
├── gridPocConfig.js      # Layout and cards configuration
└── README.md             # This file
```

---

## Features Validated

| Test | Expected Result | Status |
|------|-----------------|--------|
| Install | npm install with overrides succeeds | ✅ PASS |
| Build | npm start runs without errors | ✅ PASS |
| Route | /grid-poc loads the POC page | ✅ PASS |
| Drag | Cards drag smoothly by header only | ✅ PASS |
| Phantom box | Blue placeholder appears during drag | ✅ PASS |
| Resize | Cards resize from corner handle | ✅ PASS |
| Grid snap | Cards snap to grid units | ✅ PASS |
| Compaction | Cards compact vertically (no gaps) | ✅ PASS |
| Persistence | Refresh page, layout is preserved | ✅ PASS |
| Reset | "Reset Layout" button restores default | ✅ PASS |
| Responsive | Resize browser, grid adjusts | ✅ PASS |
| Add Card | Ghostly plus opens card type menu | ✅ PASS |
| Remove Card | × button removes card from grid | ✅ PASS |
| Card Persistence | Added/removed cards persist on refresh | ✅ PASS |

---

## Challenges Encountered & Solutions

### Challenge 1: ESM Export Error (react-grid-layout v2.2.2)

**Error:**
```
Can't reexport the named export 'DEFAULT_BREAKPOINTS' from non EcmaScript module
```

**Cause:** Webpack 4.28.3 has limited ES modules support. react-grid-layout v2.x uses ESM syntax incompatible with Webpack 4.

**Solution:** Downgrade to `react-grid-layout@0.16.6` (same version used by cBioPortal).

---

### Challenge 2: Optional Chaining Syntax Error

**Error:**
```
Module parse failed: Unexpected token (270:24)
return this.props?.nodeRef?.current ?? _reactDom.default.findDOMNode(this);
```

**Cause:** Webpack 4 cannot parse ES2020 optional chaining (`?.`) or nullish coalescing (`??`) operators.

**Affected packages:** react-grid-layout v1.x/v2.x, react-draggable v4.x, react-resizable v2.x/v3.x

**Solution:** Pin to older versions without modern syntax.

---

### Challenge 3: Transitive Dependency Issue

**Error persisted after pinning versions:**
```
./node_modules/react-resizable/node_modules/react-draggable/build/cjs/Draggable.js
```

**Cause:** react-resizable created a nested `node_modules/react-draggable` folder with a newer incompatible version.

**Solution:** Add npm `overrides` to force global version resolution.

---

### Challenge 4: Infinite Loop on Layout Change

**Error:**
```
Maximum update depth exceeded. This can happen when a component repeatedly calls setState inside componentWillUpdate or componentDidUpdate.
```

**Cause:** The `onLayoutChange` callback fires on every render because `fullLayout` is recreated as a new array each render, and `handleLayoutChange` calls `setLayout()` unconditionally.

**Solution:** Compare layouts before updating state - only call `setLayout()` when the layout has actually changed.

```javascript
const layoutsEqual = (a, b) => {
  if (a.length !== b.length) return false;
  return a.every((item, idx) => {
    const other = b[idx];
    return item.i === other.i &&
           item.x === other.x &&
           item.y === other.y &&
           item.w === other.w &&
           item.h === other.h;
  });
};
```

---

## Package Configuration

### Webpack 4 Compatible Version Matrix

| Package | Compatible Version | Incompatible Versions |
|---------|-------------------|----------------------|
| react-grid-layout | **0.16.6** | 1.x, 2.x |
| react-draggable | **3.3.2** | 4.x |
| react-resizable | **1.11.1** | 2.x, 3.x |

### package.json Configuration

```json
{
  "overrides": {
    "react-draggable": "3.3.2"
  },
  "dependencies": {
    "react-draggable": "3.3.2",
    "react-grid-layout": "0.16.6",
    "react-resizable": "1.11.1"
  }
}
```

### Installation Command

```bash
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

---

## Add Card Feature

The POC includes a dynamic "Add Card" feature demonstrating how users can add visualization cards to the grid:

- **Ghostly plus button** - Dashed border with transparent background, appears at end of grid
- **Card type selection menu** - Modal with 6 card types:
  - Venn Diagram (blue)
  - KM Plot (green)
  - Risk Table (orange)
  - Histogram - Sex (purple)
  - Histogram - Race (red)
  - Histogram - Treatment (teal)
- **Already-added detection** - Cards already on board are disabled in the menu
- **Remove cards** - × button in card header removes cards from the grid
- **Persistence** - Both cards and layout positions saved to localStorage

### State Management

```javascript
// Two separate localStorage keys
export const STORAGE_KEY = 'grid-poc-layout';       // Layout positions
export const CARDS_STORAGE_KEY = 'grid-poc-cards';  // Card definitions
```

---

## Key Learnings for Phase 1

1. Use `react-grid-layout@0.16.6` with npm overrides
2. Pin all three packages: react-grid-layout, react-draggable, react-resizable
3. Always use `--legacy-peer-deps` flag
4. Clean install required when changing these dependencies
5. Use layout comparison to prevent infinite loops in `onLayoutChange`
6. Separate state for cards (what exists) vs layout (positions/sizes)

---

## Next Steps

Proceed with Phase 1 implementation in Cohort Analyzer:
- Apply grid layout to existing visualization components
- Implement tab-based navigation (Primary/Graphic View and Table View)
- Add show/hide tiles functionality
- Implement layout persistence per user
