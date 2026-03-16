import type { CharGrid, Component } from '../types.js';
import * as grid from '../grid.js';

export interface ChartData {
  labels: string[];
  values: number[];
}

export interface BarChartOptions {
  /** Fill bars without gaps (area chart look) */
  fill?: boolean;
}

export class BarChart implements Component {
  private data: ChartData;
  private fill: boolean;

  constructor(data: ChartData, options?: BarChartOptions) {
    this.data = data;
    this.fill = options?.fill ?? false;
  }

  render(width: number, height: number): CharGrid {
    const g = grid.create(width, height);
    const { labels, values } = this.data;
    if (labels.length === 0 || height < 4 || width < 10) return g;

    const maxVal = Math.max(...values, 1);
    const yLabelW = String(maxVal).length;
    const yAxisX = yLabelW + 1;
    const chartX = yAxisX + 1;
    const chartW = width - chartX;
    const chartH = height - 2;

    if (chartW < 2 || chartH < 2) return g;

    const numBars = labels.length;
    let barW: number, step: number;
    if (this.fill) {
      barW = Math.max(1, Math.floor(chartW / numBars));
      step = barW;
    } else {
      barW = Math.max(1, Math.floor(chartW / numBars) - 1);
      step = barW + 1;
    }

    // y-axis ticks
    const tickCount = Math.min(5, chartH);
    for (let i = 0; i <= tickCount; i++) {
      const val = Math.round((maxVal * i) / tickCount);
      const row = chartH - 1 - Math.round((chartH - 1) * i / tickCount);
      const label = String(val);
      grid.write(g, yAxisX - 1 - label.length, row, label);
    }

    // y-axis line
    for (let row = 0; row < chartH; row++) grid.write(g, yAxisX, row, '\u2502');

    // x-axis
    grid.write(g, yAxisX, chartH, '\u253c');
    for (let x = chartX; x < width; x++) grid.write(g, x, chartH, '\u2500');

    // label spacing
    const labelLen = 5;
    const showEvery = Math.max(1, Math.ceil((labelLen + 1) / step));

    // bars + labels
    for (let i = 0; i < numBars; i++) {
      const val = values[i];
      const barH = maxVal > 0 ? Math.max(val > 0 ? 1 : 0, Math.round((val / maxVal) * (chartH - 1))) : 0;
      const bx = chartX + i * step;
      if (bx >= width) break;

      for (let h = 0; h < barH; h++) {
        for (let w = 0; w < barW && bx + w < width; w++) {
          grid.write(g, bx + w, chartH - 1 - h, '\u2588');
        }
      }

      // x-axis label
      const raw = labels[i];
      const short = /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw.slice(5).replace('-', '/') : raw;
      const showLabel = (i % showEvery === 0) || (i === numBars - 1);
      if (showLabel && bx + short.length <= width) {
        grid.write(g, bx, height - 1, short);
      }
    }

    return g;
  }

  setData(data: ChartData): void { this.data = data; }
}
