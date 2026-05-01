export type Percept = 'Breeze' | 'Stench' | 'Glitter' | 'Bump' | 'Scream';

export type CellState = {
  row: number;
  col: number;
  hasPit: boolean;
  hasWumpus: boolean;
  hasGold: boolean;
  isVisited: boolean;
  isSafe: boolean; // Proven safe by logic
  percepts: Percept[];
};

export type GridConfig = {
  rows: number;
  cols: number;
  pitProbability: number;
};
