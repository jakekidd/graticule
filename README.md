# Tessera

[![npm version](https://img.shields.io/npm/v/tessera.svg)](https://www.npmjs.com/package/tessera)
[![npm bundle size](https://img.shields.io/bundlephobia/minzip/tessera)](https://bundlephobia.com/package/tessera)
[![license](https://img.shields.io/npm/l/tessera.svg)](https://github.com/jakekidd/tessera/blob/main/LICENSE)
[![zero dependencies](https://img.shields.io/badge/dependencies-0-brightgreen)](https://www.npmjs.com/package/tessera)

Browser-canvas ASCII component framework for building retro terminal dashboards. Zero dependencies. ~19 KB.

Each character cell is a tessera; compose them into mosaics.

**[Documentation](https://jakekidd.github.io/tessera/)** / **[Live Demo](https://jakekidd.github.io/tessera/demo/)** / **[Sandbox](https://jakekidd.github.io/tessera/demo/sandbox.html)**

---

## What is this?

Tessera renders a character grid to an HTML5 canvas. You get the retro terminal look with all the things you'd expect from a modern browser: DPR-aware rendering, mouse interaction, vector overlays with CRT glow effects, and a component model you can actually compose.

```ts
import { tessera, grid, Box, Text } from 'tessera'

const app = tessera(document.getElementById('canvas'), { fontSize: 14 })

app.render = (cols, rows) => {
  const g = grid.create(cols, rows)
  const box = new Box('Hello', new Text('Welcome to Tessera'))
  grid.overlay(g, box.render(cols, rows), 0, 0)
  return { grid: g }
}

app.start()
```

## Install

```bash
npm install tessera
```

> TypeScript source is included in the package alongside compiled output. This library is still young and actively evolving, so having the source available makes debugging and contributing easier while the API stabilizes.

## Features

- **Zero dependencies** - no runtime deps, just your code and a canvas
- **Canvas-native** - proper DPR scaling, monospace font measurement, sub-pixel rendering
- **Component model** - everything implements `render(width, height)` and just works
- **Flex layout** - `Row` and `Col` with fixed and flex sizing, nest them however you want
- **Vector graphs** - `LineGraph` and `BarGraph` render via canvas overlays, not ASCII
- **Interactivity** - click regions, keyboard events, hover highlighting, tab navigation
- **Copy-friendly** - `app.copy()` returns the ASCII grid as text (graph areas are blank)

## Components

### Display

| Component | Description |
|-----------|-------------|
| `Text` | Word-wrapping text with left/center/right alignment |
| `Box` | Bordered container with title. Single, double, rounded, or ASCII borders |
| `Table` | Data table with configurable column widths, flex, and alignment |
| `BarChart` | ASCII bar chart with Y-axis ticks and X-axis labels |

### Layout

| Component | Description |
|-----------|-------------|
| `Row` | Horizontal flex container. Fixed widths + flex factors |
| `Col` | Vertical flex container. Fixed heights + flex factors |

### Interactive

| Component | Description |
|-----------|-------------|
| `Button` | Clickable `[ LABEL ]` with hit testing |
| `Tabs` | Tab bar with click-based selection |

### Vector Graphs

| Component | Description |
|-----------|-------------|
| `LineGraph` | Multi-series line chart with glow, ASCII legend |
| `BarGraph` | Multi-series bar chart with grouped bars |

Vector graphs take up space in the character grid like any other component, but they draw their data with canvas overlays instead of ASCII. Axes, labels, and data points are all freeform and pixel-precise. Legends live on the ASCII grid. Overlays propagate through `Row`, `Col`, and `Box` automatically, so you can nest them without thinking about it.

```ts
const chart = new LineGraph([
  { label: 'Revenue', values: [10, 25, 42, 35, 55], color: palette.BLUE },
  { label: 'Costs', values: [8, 15, 28, 22, 35], color: palette.RED },
], { xLabels: ['Q1', 'Q2', 'Q3', 'Q4', 'Q5'], gridLines: true })

const layout = new Box('Financials', chart)
grid.overlay(g, layout.render(60, 20), 0, 0)

// collect vector overlays from the component tree
const overlays = grid.collectOverlays(layout, 0, 0)
return { grid: g, ...overlays }
```

## Grid Utilities

The `grid` module has everything you need to work with character grids:

```ts
import { grid } from 'tessera'

const g = grid.create(80, 24)          // empty grid
grid.write(g, 0, 0, 'Hello')          // write text
grid.overlay(g, child, 5, 2)          // compose grids
grid.fillRect(g, 0, 0, 80, 1, '=')   // fill region
grid.wordWrap(text, 40)               // word wrap
grid.truncate(text, 20)               // truncate with ...
grid.collectOverlays(component, x, y) // gather vector overlays
```

## Styling

```ts
import { palette } from 'tessera'

// per-cell color overrides
const colors = [
  { col: 0, row: 0, color: palette.RED },
  { col: 1, row: 0, color: palette.GREEN },
]

// vector line overlays with CRT glow
const vectors = [{
  points: [{ col: 0, row: 5 }, { col: 40, row: 2 }],
  color: palette.CYAN,
  width: 1.5,
  glow: 6,
}]

return { grid: g, colors, vectors }
```

Available colors: `BLUE`, `GREEN`, `YELLOW`, `RED`, `GRAY`, `ORANGE`, `PURPLE`, `CYAN`, `AXIS`, `HINT`, `FG`, `BG`.

## Interactivity

```ts
// click regions
return {
  grid: g,
  clicks: [{ x: 5, y: 3, w: 12, h: 1, handler: () => doThing() }],
}

// keyboard
app.onKey((e) => {
  if (e.key === 'Enter') submit()
})

// tabs with click routing
const tabs = new Tabs(['HOME', 'DATA'], 0, (i) => { active = i; app.update() })
app.screen.onClick((col, row) => { tabs.hitTest(col, 0); app.update() })
```

## Custom Components

Implement the `Component` interface:

```ts
import { grid } from 'tessera'
import type { CharGrid, Component } from 'tessera'

class ProgressBar implements Component {
  constructor(private value: number) {}

  render(width: number, height: number): CharGrid {
    const g = grid.create(width, height)
    const filled = Math.round((this.value / 100) * (width - 2))
    grid.write(g, 0, 0, '[' + '#'.repeat(filled) + '-'.repeat(width - 2 - filled) + ']')
    return g
  }
}

// works anywhere a built-in component works
new Row([new Box('Progress', new ProgressBar(75)), sidebar])
```

## Configuration

```ts
const app = tessera(canvas, {
  fontSize: 14,                              // font size in px
  font: 'SF Mono, IBM Plex Mono, monospace', // monospace font
  fg: '#c0c0c0',                             // foreground color
  bg: '#0a0a0a',                             // background color
  lineHeight: 1.2,                           // line height multiplier
  hover: true,                               // hover highlighting
  hoverColor: '#ffffff',                     // hover color
})
```

## Development

```bash
bun install
bun run demo          # dev server with live reload
bun run build         # compile TypeScript
bun run docs          # VitePress dev server
bun run docs:build    # build demo + docs for deployment
```

## License

MIT
