import type { CharGrid, Component, BoxCharSet } from '../types.js';
import { BoxChars } from '../types.js';
import * as grid from '../grid.js';

export interface BoxOptions {
  chars?: BoxCharSet;
  padding?: number;
}

export class Box implements Component {
  private title: string | null;
  private child: Component | null;
  private chars: BoxCharSet;
  private padding: number;

  constructor(title: string | null, child: Component | null, options: BoxOptions = {}) {
    this.title = title;
    this.child = child;
    this.chars = options.chars ?? BoxChars.single;
    this.padding = options.padding ?? 1;
  }

  render(width: number, height: number): CharGrid {
    const g = grid.create(width, height);
    const { tl, tr, bl, br, h, v } = this.chars;
    if (width < 2 || height < 2) return g;

    grid.write(g, 0, 0, tl + h.repeat(width - 2) + tr);
    if (this.title && width > 4) {
      grid.write(g, 1, 0, ` ${grid.truncate(this.title, width - 4)} `);
    }
    for (let y = 1; y < height - 1; y++) {
      grid.write(g, 0, y, v);
      grid.write(g, width - 1, y, v);
    }
    grid.write(g, 0, height - 1, bl + h.repeat(width - 2) + br);

    if (this.child) {
      const innerW = width - 2 - (this.padding * 2);
      const innerH = height - 2 - (this.padding * 2);
      if (innerW > 0 && innerH > 0) {
        grid.overlay(g, this.child.render(innerW, innerH), 1 + this.padding, 1 + this.padding);
      }
    }

    return g;
  }

  setTitle(title: string | null): void { this.title = title; }
  setChild(child: Component | null): void { this.child = child; }
}
