import type { CharGrid, Component, Bounds } from '../types.js';
import * as grid from '../grid.js';

export class Button implements Component {
  public bounds?: Bounds;
  public hovered = false;
  private label: string;
  private handler?: () => void;

  constructor(label: string, handler?: () => void) {
    this.label = label;
    this.handler = handler;
  }

  render(width: number, height: number): CharGrid {
    const g = grid.create(width, height);
    const text = `[ ${this.label.toUpperCase()} ]`;
    grid.write(g, 0, Math.floor((height - 1) / 2), grid.truncate(text, width));
    return g;
  }

  naturalWidth(): number {
    return this.label.length + 4;
  }

  onClick(): void { this.handler?.(); }

  hitTest(x: number, y: number): boolean {
    if (!this.bounds) return false;
    return x >= this.bounds.x && x < this.bounds.x + this.bounds.w &&
           y >= this.bounds.y && y < this.bounds.y + this.bounds.h;
  }

  setLabel(label: string): void { this.label = label; }
  setHandler(handler: () => void): void { this.handler = handler; }
}
