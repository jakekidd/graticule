import type { CharGrid, Component } from '../types.js';
import { BoxChars } from '../types.js';
import * as grid from '../grid.js';

export interface TableColumn {
  header: string;
  width?: number;
  flex?: number;
  align?: 'left' | 'center' | 'right';
}

export class Table implements Component {
  private columns: TableColumn[];
  private data: string[][];

  constructor(columns: TableColumn[], data: string[][]) {
    this.columns = columns;
    this.data = data;
  }

  render(width: number, height: number): CharGrid {
    const g = grid.create(width, height);
    const { h: hChar, v: vChar, tl, tr, bl, br, lt, rt, tt, bt, x: xChar } = BoxChars.single;

    if (height < 3 || width < this.columns.length * 3) return g;

    const colWidths = this.distribute(width);
    let y = 0;

    // top border
    grid.write(g, 0, y, this.hline(colWidths, tl, tt, tr, hChar));
    y++;
    if (y >= height) return g;

    // header
    let x = 0;
    grid.write(g, x, y, vChar); x++;
    for (let c = 0; c < this.columns.length; c++) {
      const w = colWidths[c];
      grid.write(g, x, y, grid.center(grid.truncate(this.columns[c].header, w), w));
      x += w;
      grid.write(g, x, y, vChar); x++;
    }
    y++;
    if (y >= height) return g;

    // separator
    grid.write(g, 0, y, this.hline(colWidths, lt, xChar, rt, hChar));
    y++;

    // data rows
    for (let r = 0; r < this.data.length && y < height - 1; r++) {
      const row = this.data[r];
      x = 0;
      grid.write(g, x, y, vChar); x++;
      for (let c = 0; c < this.columns.length; c++) {
        const col = this.columns[c];
        const w = colWidths[c];
        const cell = grid.truncate(row[c] ?? '', w);
        const padded = col.align === 'right' ? grid.padLeft(cell, w)
          : col.align === 'center' ? grid.center(cell, w)
          : grid.padRight(cell, w);
        grid.write(g, x, y, padded);
        x += w;
        grid.write(g, x, y, vChar); x++;
      }
      y++;
    }

    // bottom border
    if (y < height) {
      grid.write(g, 0, y, this.hline(colWidths, bl, bt, br, hChar));
    }

    return g;
  }

  private hline(widths: number[], left: string, mid: string, right: string, fill: string): string {
    let line = left;
    for (let i = 0; i < widths.length; i++) {
      line += fill.repeat(widths[i]);
      line += i < widths.length - 1 ? mid : right;
    }
    return line;
  }

  private distribute(totalWidth: number): number[] {
    const available = totalWidth - this.columns.length - 1;
    const widths = new Array(this.columns.length).fill(0);
    let remaining = available;
    let totalFlex = 0;

    for (let i = 0; i < this.columns.length; i++) {
      const col = this.columns[i];
      if (col.width !== undefined) {
        widths[i] = Math.min(col.width, remaining);
        remaining -= widths[i];
      } else {
        totalFlex += col.flex ?? 1;
      }
    }

    if (totalFlex > 0 && remaining > 0) {
      for (let i = 0; i < this.columns.length; i++) {
        if (this.columns[i].width === undefined) {
          widths[i] = Math.floor(((this.columns[i].flex ?? 1) / totalFlex) * remaining);
        }
      }
    }
    return widths;
  }

  setData(data: string[][]): void { this.data = data; }
}
