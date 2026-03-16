import { cathode, grid, Box, Row, Col, Text, Table, BarChart, Tabs, palette } from '../src/index.js';
import type { RenderResult, ClickRegion, ColorCell } from '../src/index.js';

const canvas = document.getElementById('screen') as HTMLCanvasElement;
const app = cathode(canvas, { fontSize: 14 });

// state
let activeTab = 0;
const tabNames = ['OVERVIEW', 'CHART', 'TABLE'];

const tabs = new Tabs(tabNames, activeTab, (index) => {
  activeTab = index;
  app.update();
});

// sample data
const chartData = {
  labels: ['2025-01-01', '2025-01-02', '2025-01-03', '2025-01-04', '2025-01-05',
           '2025-01-06', '2025-01-07', '2025-01-08', '2025-01-09', '2025-01-10'],
  values: [12, 45, 23, 67, 34, 89, 56, 78, 42, 91],
};

const tableColumns = [
  { header: 'NAME', flex: 2 },
  { header: 'STATUS', width: 12, align: 'center' as const },
  { header: 'VALUE', width: 10, align: 'right' as const },
];

const tableData = [
  ['Alpha Service', 'ONLINE', '1,234'],
  ['Beta Worker', 'ONLINE', '567'],
  ['Gamma Cache', 'DEGRADED', '89'],
  ['Delta Queue', 'ONLINE', '2,345'],
  ['Epsilon Store', 'OFFLINE', '0'],
];

app.render = (cols: number, rows: number): RenderResult => {
  const g = grid.create(cols, rows);
  const clicks: ClickRegion[] = [];
  const colors: ColorCell[] = [];

  // header
  grid.write(g, 1, 0, 'CATHODE DEMO');

  // tab bar at row 2
  const tabGrid = tabs.render(cols - 2, 1);
  grid.overlay(g, tabGrid, 1, 2);

  // tab hit region
  clicks.push({
    x: 1, y: 2, w: cols - 2, h: 1,
    handler: () => {},
    cursor: 'pointer',
  });

  // color the header
  for (let i = 0; i < 12; i++) {
    colors.push({ col: 1 + i, row: 0, color: palette.BLUE });
  }

  // content area
  const contentY = 4;
  const contentH = rows - contentY - 1;
  const contentW = cols - 2;

  if (activeTab === 0) {
    // overview: two boxes side by side
    const left = new Box('Status', new Text('All systems operational.\n\nCathode is a browser-canvas ASCII component framework.\nBuild retro terminal dashboards with zero dependencies.'));
    const right = new Box('Metrics', new Text('Uptime: 99.97%\nRequests: 1.2M\nLatency: 12ms p50\nErrors: 0.03%'));
    const layout = new Row([left, right]);
    const layoutGrid = layout.render(contentW, contentH);
    grid.overlay(g, layoutGrid, 1, contentY);
  } else if (activeTab === 1) {
    // chart
    const box = new Box('Daily Volume', new BarChart(chartData));
    grid.overlay(g, box.render(contentW, contentH), 1, contentY);
  } else {
    // table
    const box = new Box('Services', new Table(tableColumns, tableData));
    grid.overlay(g, box.render(contentW, contentH), 1, contentY);
  }

  // footer
  grid.write(g, 1, rows - 1, `${cols}x${rows}`);
  for (let i = 0; i < `${cols}x${rows}`.length; i++) {
    colors.push({ col: 1 + i, row: rows - 1, color: palette.GRAY });
  }

  return { grid: g, clicks, colors };
};

// route clicks to tabs
app.screen.onClick((col, row) => {
  if (row === 2 && col >= 1) {
    tabs.hitTest(col - 1, 0);
    app.update();
  }
});

app.start();
