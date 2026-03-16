/** A 2D grid of characters — the core rendering primitive */
export type CharGrid = string[][];

/** Bounds of a rendered component in the grid */
export interface Bounds {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Base component interface. All cathode components implement this. */
export interface Component {
  render(width: number, height: number): CharGrid;
  bounds?: Bounds;
  /** Optional click handler. Components with this are interactive. */
  onClick?(): void;
  /** Hit-test for click routing. Return true if (x,y) is inside this component. */
  hitTest?(x: number, y: number): boolean;
}

/** A clickable region registered during render */
export interface ClickRegion {
  x: number;
  y: number;
  w: number;
  h: number;
  handler: () => void;
  cursor?: string;
}

/** Per-cell color override */
export interface ColorCell {
  col: number;
  row: number;
  color: string;
}

/** Box-drawing character sets */
export const BoxChars = {
  ascii: {
    tl: '+', tr: '+', bl: '+', br: '+',
    h: '-', v: '|',
    lt: '+', rt: '+', tt: '+', bt: '+',
    x: '+',
  },
  single: {
    tl: '\u250c', tr: '\u2510', bl: '\u2514', br: '\u2518',
    h: '\u2500', v: '\u2502',
    lt: '\u251c', rt: '\u2524', tt: '\u252c', bt: '\u2534',
    x: '\u253c',
  },
  double: {
    tl: '\u2554', tr: '\u2557', bl: '\u255a', br: '\u255d',
    h: '\u2550', v: '\u2551',
    lt: '\u2560', rt: '\u2563', tt: '\u2566', bt: '\u2569',
    x: '\u256c',
  },
  rounded: {
    tl: '\u256d', tr: '\u256e', bl: '\u2570', br: '\u256f',
    h: '\u2500', v: '\u2502',
    lt: '\u251c', rt: '\u2524', tt: '\u252c', bt: '\u2534',
    x: '\u253c',
  },
} as const;

export type BoxCharSet = typeof BoxChars[keyof typeof BoxChars];

/** Vector line overlay drawn on canvas (not ASCII grid) */
export interface VectorLine {
  points: Array<{ col: number; row: number }>;
  color: string;
  width?: number;
  glow?: number;
  cap?: 'round' | 'butt';
}

/** Canvas-drawn text label (not part of ASCII grid) */
export interface VectorText {
  col: number;
  row: number;
  text: string;
  color: string;
  fontSize?: number;
  align?: 'left' | 'center' | 'right';
  baseline?: 'top' | 'middle' | 'bottom';
}

/** Result of rendering a component tree — returned by render functions */
export interface RenderResult {
  grid: CharGrid;
  clicks?: ClickRegion[];
  colors?: ColorCell[];
  vectors?: VectorLine[];
  texts?: VectorText[];
}
