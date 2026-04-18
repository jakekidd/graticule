# Components

Tessera ships with a set of built-in components. Each implements the `Component` interface with a `render(width, height)` method that returns a `CharGrid`.

## Text

Renders a string with word-wrapping and alignment.

```ts
new Text('Hello world')                   // left-aligned (default)
new Text('Centered text', 'center')       // centered
new Text('Right-aligned', 'right')        // right-aligned
```

Long text automatically wraps to fit the available width. Update content with `text.set('new content')`.

## Box

A bordered container with an optional title and child component.

```ts
new Box('Title', new Text('Content'))
new Box(null, child)                          // no title
new Box('Title', child, { chars: BoxChars.double })  // double border
new Box('Title', child, { padding: 2 })       // extra inner padding
```

Available border styles: `BoxChars.single` (default), `BoxChars.double`, `BoxChars.rounded`, `BoxChars.ascii`.

## Button

A clickable label that renders as `[ LABEL ]`.

```ts
new Button('Submit', () => console.log('clicked'))
```

Buttons track their `bounds` for hit-testing and expose `hovered` state.

## Row

Horizontal flex container. Children share the available width.

```ts
// equal flex (each child gets flex: 1)
new Row([componentA, componentB, componentC])

// mixed fixed and flex
new Row([
  { component: sidebar, width: 30 },   // fixed 30 chars
  { component: main, flex: 2 },         // gets 2/3 of remaining
  { component: aside, flex: 1 },        // gets 1/3 of remaining
])
```

## Col

Vertical flex container. Same API as Row but distributes height.

```ts
new Col([
  { component: header, height: 3 },  // fixed 3 rows
  { component: body, flex: 1 },       // fills remaining
])
```

## Tabs

A tab bar with click-based selection.

```ts
const tabs = new Tabs(['ONE', 'TWO', 'THREE'], 0, (index) => {
  activeTab = index
  app.update()
})
```

Active tab shows as `[LABEL]`, inactive as ` LABEL `. Use `tabs.hitTest(x, y)` to route clicks.

## Table

A bordered data table with configurable columns.

```ts
const columns = [
  { header: 'NAME', flex: 2 },
  { header: 'STATUS', width: 10, align: 'center' },
  { header: 'VALUE', width: 8, align: 'right' },
]
const data = [
  ['Alpha', 'OK', '100'],
  ['Beta', 'ERR', '0'],
]
new Table(columns, data)
```

## BarChart

A vertical bar chart with Y-axis labels and X-axis labels.

```ts
new BarChart({
  labels: ['Mon', 'Tue', 'Wed'],
  values: [10, 25, 15],
})

// filled mode (no gaps between bars)
new BarChart(data, { fill: true })
```

Date-format labels (`YYYY-MM-DD`) are automatically shortened to `MM/DD`.

## LineGraph

A vector-rendered multi-series line chart. Lines, axes, and labels are drawn on the canvas (not ASCII). The legend renders on the ASCII grid.

```ts
const series = [
  { label: 'Revenue', values: [10, 25, 42, 35], color: palette.BLUE },
  { label: 'Costs', values: [8, 15, 28, 22], color: palette.RED },
]
new LineGraph(series, {
  xLabels: ['Q1', 'Q2', 'Q3', 'Q4'],
  gridLines: true,
})
```

Overlays propagate through Row/Col/Box. Use `grid.collectOverlays()` to apply the final offset. Supports `'line'` and `'step'` styles.

## BarGraph

A vector-rendered bar chart with filled rectangles. Supports multiple series (grouped bars).

```ts
new BarGraph([
  { label: '2024', values: [120, 95, 140], color: palette.BLUE },
  { label: '2025', values: [150, 110, 130], color: palette.CYAN },
], {
  xLabels: ['North', 'South', 'East'],
  valueLabels: true,
})
```

Both `LineGraph` and `BarGraph` occupy deterministic space on the grid like any component, but their visual content is rendered via canvas vectors. When you call `app.dump()`, the chart area appears as blank space while the ASCII legend is preserved.
