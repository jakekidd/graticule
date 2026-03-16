// Types
export type {
  CharGrid, Bounds, Component,
  ClickRegion, ColorCell,
  BoxCharSet, VectorLine, VectorText,
  RenderResult,
} from './types.js';
export { BoxChars } from './types.js';

// Grid utilities
export * as grid from './grid.js';

// Screen (low-level canvas renderer)
export { Screen } from './screen.js';
export type { ScreenConfig } from './screen.js';

// App (high-level "here's a canvas" entry point)
import { App } from './app.js';
export { App };
export type { AppConfig } from './app.js';

// Components
export { Text, Box, Button, Row, Col, Tabs, Table, BarChart } from './components/index.js';
export type { BoxOptions, RowChild, ColChild, TableColumn, ChartData, BarChartOptions } from './components/index.js';

// Palette
export * as palette from './palette.js';

/** Convenience: create an App from a canvas element */
export function cathode(canvas: HTMLCanvasElement, config?: import('./app.js').AppConfig): import('./app.js').App {
  return new App(canvas, config);
}
