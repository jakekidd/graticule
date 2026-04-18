# LineGraph

A vector-rendered multi-series line chart. Data lines, axes, and labels are drawn as canvas overlays (not ASCII). The legend is rendered on the ASCII grid.

Use inside `Row`, `Col`, or `Box` like any other component. Overlays propagate automatically through layout containers.

## Constructor

```ts
new LineGraph(series: Series[], options?: LineGraphOptions)
```

### Series

```ts
interface Series {
  label: string
  values: number[]
  color: string
}
```

### LineGraphOptions

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `xLabels` | `string[]` | Index numbers | X-axis labels |
| `yMin` | `number` | Auto | Minimum y value |
| `yMax` | `number` | Auto | Maximum y value |
| `yTicks` | `number` | `5` | Number of y-axis ticks |
| `legend` | `boolean` | `true` | Show ASCII legend |
| `legendPosition` | `'top' \| 'bottom'` | `'top'` | Legend placement |
| `glow` | `number` | `6` | Line glow radius (0 to disable) |
| `lineWidth` | `number` | `1.5` | Line width |
| `gridLines` | `boolean` | `false` | Show horizontal grid lines |
| `style` | `'line' \| 'step'` | `'line'` | Line interpolation |

## Properties

| Property | Type | Description |
|----------|------|-------------|
| `overlays` | `ComponentOverlays` | Vectors/texts/colors produced during render |

## Methods

### render()

```ts
render(width: number, height: number): CharGrid
```

Returns an ASCII grid (mostly blank, with legend text). Populates `overlays` with vector lines for the data, axes, tick marks, and text labels.

### setData()

```ts
setData(series: Series[]): void
```

## Collecting Overlays

Overlays propagate through `Row`, `Col`, and `Box` automatically. Use `grid.collectOverlays()` to apply the final position offset:

```ts
const chart = new LineGraph(series, { xLabels })
const layout = new Box('Revenue', chart)
grid.overlay(g, layout.render(60, 20), 5, 3)

const overlays = grid.collectOverlays(layout, 5, 3)
return {
  grid: g,
  ...overlays,
}
```

## Example

```ts
const series = [
  { label: 'Revenue', values: [10, 25, 42, 35, 55], color: palette.BLUE },
  { label: 'Costs', values: [8, 15, 28, 22, 35], color: palette.RED },
]

const chart = new LineGraph(series, {
  xLabels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
  gridLines: true,
  glow: 6,
})

// use in a layout
new Row([
  new Box('Financials', chart),
  new Box('Info', new Text('...')),
])
```

## Dump

When you call `app.dump()`, the chart area appears as blank space since the visual data is rendered via canvas vectors, not ASCII characters. The legend (on the ASCII grid) is preserved.
