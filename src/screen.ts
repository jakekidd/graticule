import type { CharGrid, VectorLine, VectorText } from './types.js';
import { FG, BG } from './palette.js';

export interface ScreenConfig {
  font?: string;
  fontSize?: number;
  fg?: string;
  bg?: string;
  lineHeight?: number;
}

const DEFAULT_CONFIG: Required<ScreenConfig> = {
  font: 'SF Mono, IBM Plex Mono, monospace',
  fontSize: 14,
  fg: FG,
  bg: BG,
  lineHeight: 1.2,
};

export class Screen {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private config: Required<ScreenConfig>;

  public charWidth = 0;
  public charHeight = 0;
  public cols = 0;
  public rows = 0;

  public mouseCol = -1;
  public mouseRow = -1;

  private clickHandler?: (col: number, row: number) => void;
  private mouseMoveHandler?: (col: number, row: number) => void;
  private resizeHandler?: () => void;

  constructor(canvas: HTMLCanvasElement, config: ScreenConfig = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.config = { ...DEFAULT_CONFIG, ...config };

    this.measure();
    this.resize();

    window.addEventListener('resize', () => {
      this.resize();
      this.resizeHandler?.();
    });
    canvas.addEventListener('click', (e) => this.handleClick(e));
    canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    canvas.addEventListener('mouseleave', () => {
      this.mouseCol = -1;
      this.mouseRow = -1;
      this.mouseMoveHandler?.(-1, -1);
    });
  }

  private measure(): void {
    const { font, fontSize, lineHeight } = this.config;
    this.ctx.font = `${fontSize}px ${font}`;
    this.charWidth = this.ctx.measureText('M').width;
    this.charHeight = fontSize * lineHeight;
  }

  public resize(): void {
    const dpr = window.devicePixelRatio || 1;
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * dpr;
    this.canvas.height = rect.height * dpr;
    this.ctx.scale(dpr, dpr);
    this.cols = Math.floor(rect.width / this.charWidth);
    this.rows = Math.floor(rect.height / this.charHeight);
    this.ctx.font = `${this.config.fontSize}px ${this.config.font}`;
    this.ctx.textBaseline = 'top';
  }

  /** Draw grid with optional per-cell color and glow overrides */
  public draw(
    grid: CharGrid,
    colorAt?: (col: number, row: number) => string | undefined,
    glowAt?: (col: number, row: number) => { color: string; blur: number } | undefined,
  ): void {
    const { fg, bg, font, fontSize } = this.config;
    const dpr = window.devicePixelRatio || 1;

    this.ctx.fillStyle = bg;
    this.ctx.fillRect(0, 0, this.canvas.width / dpr, this.canvas.height / dpr);
    this.ctx.font = `${fontSize}px ${font}`;
    this.ctx.textBaseline = 'top';

    let glowActive = false;

    for (let row = 0; row < grid.length && row < this.rows; row++) {
      const line = grid[row];
      const y = row * this.charHeight;
      for (let col = 0; col < line.length && col < this.cols; col++) {
        const char = line[col];
        if (char === ' ' && !colorAt && !glowAt) continue;
        const cellColor = colorAt?.(col, row);
        if (cellColor !== this.ctx.fillStyle) {
          this.ctx.fillStyle = cellColor || fg;
        }
        const glow = glowAt?.(col, row);
        if (glow) {
          this.ctx.shadowColor = glow.color;
          this.ctx.shadowBlur = glow.blur;
          glowActive = true;
        } else if (glowActive) {
          this.ctx.shadowColor = 'transparent';
          this.ctx.shadowBlur = 0;
          glowActive = false;
        }
        this.ctx.fillText(char, col * this.charWidth, y);
      }
    }

    if (glowActive) {
      this.ctx.shadowColor = 'transparent';
      this.ctx.shadowBlur = 0;
    }
  }

  /** Draw vector line overlays with CRT-style glow */
  public drawVectors(lines: VectorLine[]): void {
    if (lines.length === 0) return;
    const ctx = this.ctx;
    ctx.save();
    ctx.lineJoin = 'round';

    for (const line of lines) {
      if (line.points.length < 2) continue;
      const width = line.width ?? 1.5;
      const glow = line.glow ?? 6;
      ctx.lineCap = line.cap ?? 'round';

      if (glow > 0) {
        ctx.shadowColor = line.color;
        ctx.shadowBlur = glow;
        ctx.strokeStyle = line.color;
        ctx.lineWidth = width;
        ctx.globalAlpha = 0.5;
        ctx.beginPath();
        for (let i = 0; i < line.points.length; i++) {
          const px = (line.points[i].col + 0.5) * this.charWidth;
          const py = (line.points[i].row + 0.5) * this.charHeight;
          if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.strokeStyle = line.color;
      ctx.lineWidth = width;
      ctx.globalAlpha = 1;
      ctx.beginPath();
      for (let i = 0; i < line.points.length; i++) {
        const px = (line.points[i].col + 0.5) * this.charWidth;
        const py = (line.points[i].row + 0.5) * this.charHeight;
        if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    ctx.restore();
  }

  /** Draw canvas text labels */
  public drawTexts(texts: VectorText[]): void {
    if (texts.length === 0) return;
    const ctx = this.ctx;
    const { font, fontSize } = this.config;

    ctx.save();
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    for (const t of texts) {
      const size = t.fontSize ?? fontSize;
      ctx.font = `${size}px ${font}`;
      ctx.fillStyle = t.color;
      ctx.textAlign = t.align ?? 'center';
      ctx.textBaseline = t.baseline ?? 'bottom';
      ctx.fillText(t.text, (t.col + 0.5) * this.charWidth, (t.row + 0.5) * this.charHeight);
    }

    ctx.restore();
    ctx.font = `${fontSize}px ${font}`;
    ctx.textBaseline = 'top';
  }

  public getDimensions(): { cols: number; rows: number } {
    return { cols: this.cols, rows: this.rows };
  }

  public setCursor(cursor: string): void {
    this.canvas.style.cursor = cursor;
  }

  public setFont(font: string): void {
    this.config.font = font;
    this.measure();
    this.resize();
  }

  public getFont(): string {
    return this.config.font;
  }

  public onClick(handler: (col: number, row: number) => void): void {
    this.clickHandler = handler;
  }

  public onMouseMove(handler: (col: number, row: number) => void): void {
    this.mouseMoveHandler = handler;
  }

  public onResize(handler: () => void): void {
    this.resizeHandler = handler;
  }

  private handleClick(e: MouseEvent): void {
    if (!this.clickHandler) return;
    const rect = this.canvas.getBoundingClientRect();
    const col = Math.floor((e.clientX - rect.left) / this.charWidth);
    const row = Math.floor((e.clientY - rect.top) / this.charHeight);
    this.clickHandler(col, row);
  }

  private handleMouseMove(e: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    const oldCol = this.mouseCol;
    const oldRow = this.mouseRow;
    this.mouseCol = Math.floor((e.clientX - rect.left) / this.charWidth);
    this.mouseRow = Math.floor((e.clientY - rect.top) / this.charHeight);
    if (this.mouseCol !== oldCol || this.mouseRow !== oldRow) {
      this.mouseMoveHandler?.(this.mouseCol, this.mouseRow);
    }
  }
}
