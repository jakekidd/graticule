import type { CharGrid, Component } from '../types.js';
import * as grid from '../grid.js';

export interface ColChild {
  component: Component;
  height?: number;
  flex?: number;
}

export class Col implements Component {
  private children: ColChild[];

  constructor(children: (Component | ColChild)[]) {
    this.children = children.map(c =>
      'component' in c ? c : { component: c, flex: 1 }
    );
  }

  render(width: number, height: number): CharGrid {
    const g = grid.create(width, height);
    if (this.children.length === 0) return g;

    const heights = this.distribute(height);
    let y = 0;
    for (let i = 0; i < this.children.length; i++) {
      const h = heights[i];
      if (h > 0) {
        const child = this.children[i];
        grid.overlay(g, child.component.render(width, h), 0, y);
        if ('bounds' in child.component) {
          (child.component as { bounds: unknown }).bounds = { x: 0, y, w: width, h };
        }
      }
      y += h;
    }
    return g;
  }

  private distribute(total: number): number[] {
    const heights = new Array(this.children.length).fill(0);
    let remaining = total;
    let totalFlex = 0;

    for (let i = 0; i < this.children.length; i++) {
      const child = this.children[i];
      if (child.height !== undefined) {
        heights[i] = Math.min(child.height, remaining);
        remaining -= heights[i];
      } else {
        totalFlex += child.flex ?? 1;
      }
    }

    if (totalFlex > 0 && remaining > 0) {
      for (let i = 0; i < this.children.length; i++) {
        if (this.children[i].height === undefined) {
          heights[i] = Math.floor(((this.children[i].flex ?? 1) / totalFlex) * remaining);
        }
      }
    }
    return heights;
  }
}
