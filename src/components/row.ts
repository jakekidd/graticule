import type { CharGrid, Component } from '../types.js';
import * as grid from '../grid.js';

export interface RowChild {
  component: Component;
  width?: number;
  flex?: number;
}

export class Row implements Component {
  private children: RowChild[];

  constructor(children: (Component | RowChild)[]) {
    this.children = children.map(c =>
      'component' in c ? c : { component: c, flex: 1 }
    );
  }

  render(width: number, height: number): CharGrid {
    const g = grid.create(width, height);
    if (this.children.length === 0) return g;

    const widths = this.distribute(width);
    let x = 0;
    for (let i = 0; i < this.children.length; i++) {
      const w = widths[i];
      if (w > 0) {
        const child = this.children[i];
        grid.overlay(g, child.component.render(w, height), x, 0);
        if ('bounds' in child.component) {
          (child.component as { bounds: unknown }).bounds = { x, y: 0, w, h: height };
        }
      }
      x += w;
    }
    return g;
  }

  private distribute(total: number): number[] {
    const widths = new Array(this.children.length).fill(0);
    let remaining = total;
    let totalFlex = 0;

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (child.width !== undefined) {
        widths[i] = Math.min(child.width, remaining);
        remaining -= widths[i];
      } else {
        totalFlex += child.flex ?? 1;
      }
    }

    if (totalFlex > 0 && remaining > 0) {
      for (let i = 0; i < this.children.length; i++) {
        if (this.children[i].width === undefined) {
          widths[i] = Math.floor(((this.children[i].flex ?? 1) / totalFlex) * remaining);
        }
      }
    }
    return widths;
  }
}
