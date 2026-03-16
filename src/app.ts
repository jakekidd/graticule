import type { CharGrid, ClickRegion, ColorCell, VectorLine, VectorText, RenderResult } from './types.js';
import { Screen } from './screen.js';
import type { ScreenConfig } from './screen.js';

export interface AppConfig extends ScreenConfig {
  /** Enable hover highlighting (default true) */
  hover?: boolean;
  /** Hover highlight color (default '#ffffff') */
  hoverColor?: string;
}

/**
 * Top-level application container.
 *
 *   const app = cathode(canvas, { fontSize: 14 })
 *   app.render = (cols, rows) => { ... return { grid, clicks, colors } }
 *   app.start()
 *
 * The app owns the render loop: it draws to canvas, routes clicks,
 * tracks hover state, and re-renders on resize.
 */
export class App {
  public screen: Screen;

  /** User-supplied render function. Called with (cols, rows), must return a RenderResult. */
  public render: ((cols: number, rows: number) => RenderResult) | null = null;

  private clicks: ClickRegion[] = [];
  private colors: ColorCell[] = [];
  private vectors: VectorLine[] = [];
  private texts: VectorText[] = [];
  private lastGrid: CharGrid | null = null;
  private hoverEnabled: boolean;
  private hoverColor: string;
  private keyHandler?: (e: KeyboardEvent) => void;

  constructor(canvas: HTMLCanvasElement, config: AppConfig = {}) {
    this.hoverEnabled = config.hover ?? true;
    this.hoverColor = config.hoverColor ?? '#ffffff';
    this.screen = new Screen(canvas, config);

    this.screen.onClick((col, row) => this.handleClick(col, row));
    this.screen.onMouseMove(() => this.draw());
    this.screen.onResize(() => this.draw());
  }

  /** Perform initial render */
  start(): void {
    this.draw();
  }

  /** Trigger a re-render */
  update(): void {
    this.draw();
  }

  /** Listen for keyboard events */
  onKey(handler: (e: KeyboardEvent) => void): void {
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
    }
    this.keyHandler = handler;
    window.addEventListener('keydown', handler);
  }

  private draw(): void {
    if (!this.render) return;

    const { cols, rows } = this.screen.getDimensions();
    if (cols <= 0 || rows <= 0) return;

    const result = this.render(cols, rows);
    this.lastGrid = result.grid;
    this.clicks = result.clicks ?? [];
    this.colors = result.colors ?? [];
    this.vectors = result.vectors ?? [];
    this.texts = result.texts ?? [];

    // update cursor based on hover over click regions
    const { mouseCol, mouseRow } = this.screen;
    let cursor = 'default';
    if (mouseCol >= 0 && mouseRow >= 0) {
      for (const region of this.clicks) {
        if (mouseCol >= region.x && mouseCol < region.x + region.w &&
            mouseRow >= region.y && mouseRow < region.y + region.h) {
          cursor = region.cursor ?? 'pointer';
          break;
        }
      }
    }
    this.screen.setCursor(cursor);

    // draw grid with color overrides + hover
    this.screen.draw(result.grid, (col, row) => {
      // hover highlight
      if (this.hoverEnabled && col === this.screen.mouseCol && row === this.screen.mouseRow) {
        return this.hoverColor;
      }
      // explicit color overrides
      for (const c of this.colors) {
        if (c.col === col && c.row === row) return c.color;
      }
      return undefined;
    });

    // vector overlays
    if (this.vectors.length > 0) this.screen.drawVectors(this.vectors);
    if (this.texts.length > 0) this.screen.drawTexts(this.texts);
  }

  private handleClick(col: number, row: number): void {
    for (const region of this.clicks) {
      if (col >= region.x && col < region.x + region.w &&
          row >= region.y && row < region.y + region.h) {
        region.handler();
        this.draw();
        return;
      }
    }
  }

  /** Get the last rendered grid as a string (useful for debugging / copy) */
  dump(): string {
    if (!this.lastGrid) return '';
    return this.lastGrid.map(row => row.join('')).join('\n');
  }

  /** Clean up event listeners */
  destroy(): void {
    if (this.keyHandler) {
      window.removeEventListener('keydown', this.keyHandler);
    }
  }
}
