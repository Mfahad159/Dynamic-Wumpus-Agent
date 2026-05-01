import type { CellState, GridConfig, Percept } from './types';

export class Grid {
  private cells: CellState[][];
  private rows: number;
  private cols: number;

  constructor(config: GridConfig) {
    this.rows = config.rows;
    this.cols = config.cols;
    this.cells = this.initializeGrid(config);
  }

  private initializeGrid(config: GridConfig): CellState[][] {
    const grid: CellState[][] = [];
    for (let r = 0; r < this.rows; r++) {
      grid[r] = [];
      for (let c = 0; c < this.cols; c++) {
        grid[r][c] = {
          row: r,
          col: c,
          hasPit: false,
          hasWumpus: false,
          hasGold: false,
          isVisited: false,
          isSafe: (r === 0 && c === 0), // Start is always safe
          percepts: [],
        };
      }
    }

    // Place Pits (randomly, except start)
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        if (r === 0 && c === 0) continue;
        if (Math.random() < config.pitProbability) {
          grid[r][c].hasPit = true;
        }
      }
    }

    // Place Wumpus (randomly, except start)
    let wRow, wCol;
    do {
      wRow = Math.floor(Math.random() * this.rows);
      wCol = Math.floor(Math.random() * this.cols);
    } while (wRow === 0 && wCol === 0);
    grid[wRow][wCol].hasWumpus = true;

    // Place Gold (randomly, except start)
    let gRow, gCol;
    do {
      gRow = Math.floor(Math.random() * this.rows);
      gCol = Math.floor(Math.random() * this.cols);
    } while (gRow === 0 && gCol === 0);
    grid[gRow][gCol].hasGold = true;

    // Pre-calculate percepts
    this.calculateAllPercepts(grid);

    return grid;
  }

  private calculateAllPercepts(grid: CellState[][]) {
    for (let r = 0; r < this.rows; r++) {
      for (let c = 0; c < this.cols; c++) {
        const percepts: Percept[] = [];
        const adj = this.getAdjacent(r, c);

        if (adj.some(([ar, ac]) => grid[ar][ac].hasPit)) {
          percepts.push('Breeze');
        }
        if (adj.some(([ar, ac]) => grid[ar][ac].hasWumpus)) {
          percepts.push('Stench');
        }
        if (grid[r][c].hasGold) {
          percepts.push('Glitter');
        }
        grid[r][c].percepts = percepts;
      }
    }
  }

  getAdjacent(r: number, c: number): [number, number][] {
    const adj: [number, number][] = [];
    if (r > 0) adj.push([r - 1, c]);
    if (r < this.rows - 1) adj.push([r + 1, c]);
    if (c > 0) adj.push([r, c - 1]);
    if (c < this.cols - 1) adj.push([r, c + 1]);
    return adj;
  }

  getCell(r: number, c: number): CellState {
    return this.cells[r][c];
  }

  getRows() { return this.rows; }
  getCols() { return this.cols; }

  setVisited(r: number, c: number) {
    this.cells[r][c].isVisited = true;
  }

  setSafe(r: number, c: number) {
    this.cells[r][c].isSafe = true;
  }
}
