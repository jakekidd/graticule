import type { CharGrid } from './types.js';

/** Create an empty grid filled with spaces */
export function create(width: number, height: number, fill = ' '): CharGrid {
  const grid: CharGrid = [];
  for (let y = 0; y < height; y++) {
    grid.push(new Array(width).fill(fill));
  }
  return grid;
}

/** Write a string to the grid at position (x, y) */
export function write(grid: CharGrid, x: number, y: number, text: string): void {
  if (y < 0 || y >= grid.length) return;
  const row = grid[y];
  for (let i = 0; i < text.length; i++) {
    const col = x + i;
    if (col >= 0 && col < row.length) {
      row[col] = text[i];
    }
  }
}

/** Write multiple lines starting at (x, y) */
export function writeLines(grid: CharGrid, x: number, y: number, lines: string[]): void {
  for (let i = 0; i < lines.length; i++) {
    write(grid, x, y + i, lines[i]);
  }
}

/** Overlay one grid onto another at position (x, y) */
export function overlay(target: CharGrid, source: CharGrid, x: number, y: number): void {
  for (let sy = 0; sy < source.length; sy++) {
    const ty = y + sy;
    if (ty < 0 || ty >= target.length) continue;
    const sourceRow = source[sy];
    const targetRow = target[ty];
    for (let sx = 0; sx < sourceRow.length; sx++) {
      const tx = x + sx;
      if (tx >= 0 && tx < targetRow.length) {
        targetRow[tx] = sourceRow[sx];
      }
    }
  }
}

/** Fill a rectangular region with a character */
export function fillRect(grid: CharGrid, x: number, y: number, w: number, h: number, char = ' '): void {
  for (let dy = 0; dy < h; dy++) {
    const row = y + dy;
    if (row < 0 || row >= grid.length) continue;
    for (let dx = 0; dx < w; dx++) {
      const col = x + dx;
      if (col >= 0 && col < grid[row].length) {
        grid[row][col] = char;
      }
    }
  }
}

/** Convert grid to a single string */
export function toString(grid: CharGrid): string {
  return grid.map(row => row.join('')).join('\n');
}

/** Clone a grid */
export function clone(grid: CharGrid): CharGrid {
  return grid.map(row => [...row]);
}

/** Get dimensions of a grid */
export function dimensions(grid: CharGrid): { width: number; height: number } {
  if (grid.length === 0) return { width: 0, height: 0 };
  return { width: grid[0].length, height: grid.length };
}

/** Word-wrap text to fit width */
export function wordWrap(text: string, width: number): string[] {
  if (width <= 0) return [];
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    if (current.length === 0) {
      current = word;
    } else if (current.length + 1 + word.length <= width) {
      current += ' ' + word;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current.length > 0) lines.push(current);
  return lines;
}

/** Truncate text with ellipsis if needed */
export function truncate(text: string, width: number): string {
  if (text.length <= width) return text;
  if (width <= 3) return text.slice(0, width);
  return text.slice(0, width - 3) + '...';
}

/** Center text within a given width */
export function center(text: string, width: number): string {
  if (text.length >= width) return text.slice(0, width);
  const padding = Math.floor((width - text.length) / 2);
  return ' '.repeat(padding) + text + ' '.repeat(width - text.length - padding);
}

/** Left-pad text to a given width */
export function padLeft(text: string, width: number): string {
  if (text.length >= width) return text;
  return ' '.repeat(width - text.length) + text;
}

/** Right-pad text to a given width */
export function padRight(text: string, width: number): string {
  if (text.length >= width) return text;
  return text + ' '.repeat(width - text.length);
}
