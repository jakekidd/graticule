import type { CharGrid, Component, Bounds } from '../types.js';
import * as grid from '../grid.js';

export class Tabs implements Component {
  public bounds?: Bounds;
  private tabBounds: Bounds[] = [];
  private items: string[];
  private active: number;
  private onChange?: (index: number) => void;

  constructor(items: string[], active = 0, onChange?: (index: number) => void) {
    this.items = items;
    this.active = active;
    this.onChange = onChange;
  }

  render(width: number, height: number): CharGrid {
    const g = grid.create(width, height);
    this.tabBounds = [];

    let x = 0;
    for (let i = 0; i < this.items.length; i++) {
      const label = this.items[i].toUpperCase();
      const text = i === this.active ? `[${label}]` : ` ${label} `;

      if (x + text.length <= width) {
        grid.write(g, x, 0, text);
        this.tabBounds.push({ x, y: 0, w: text.length, h: 1 });
        x += text.length + 1;
      }
    }
    return g;
  }

  onClick(): void {}

  hitTest(x: number, y: number): boolean {
    for (let i = 0; i < this.tabBounds.length; i++) {
      const b = this.tabBounds[i];
      if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) {
        if (i !== this.active) {
          this.active = i;
          this.onChange?.(i);
        }
        return true;
      }
    }
    return false;
  }

  getActive(): number { return this.active; }

  setActive(index: number): void {
    if (index >= 0 && index < this.items.length) this.active = index;
  }

  setItems(items: string[]): void {
    this.items = items;
    if (this.active >= items.length) this.active = Math.max(0, items.length - 1);
  }
}
