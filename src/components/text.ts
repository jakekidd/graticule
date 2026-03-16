import type { CharGrid, Component } from '../types.js';
import * as grid from '../grid.js';

export class Text implements Component {
  private content: string;
  private align: 'left' | 'center' | 'right';

  constructor(content: string, align: 'left' | 'center' | 'right' = 'left') {
    this.content = content;
    this.align = align;
  }

  render(width: number, height: number): CharGrid {
    const g = grid.create(width, height);
    const lines = grid.wordWrap(this.content, width);
    for (let i = 0; i < lines.length && i < height; i++) {
      let line = lines[i];
      if (this.align === 'center') line = grid.center(line, width);
      else if (this.align === 'right') line = grid.padLeft(line, width);
      grid.write(g, 0, i, line);
    }
    return g;
  }

  set(content: string): void {
    this.content = content;
  }
}
