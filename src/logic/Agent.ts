import { Grid } from './Grid';
import { KnowledgeBase } from './KnowledgeBase';
import type { Percept } from './types';

export class Agent {
  private pos: [number, number] = [0, 0];
  private kb: KnowledgeBase;
  private grid: Grid;
  private visited: Set<string> = new Set();
  private inferenceSteps: number = 0;
  private history: [number, number][] = [];

  constructor(grid: Grid) {
    this.grid = grid;
    this.kb = new KnowledgeBase();
    this.visited.add('0,0');
    this.history.push([0, 0]);
    this.grid.setVisited(0, 0);
    
    // Initial safe fact
    this.kb.tell(new Set(['~P_0_0']));
    this.kb.tell(new Set(['~W_0_0']));
  }

  public getPos() { return this.pos; }
  public getInferenceSteps() { return this.inferenceSteps; }

  public step(): boolean {
    const [r, c] = this.pos;
    const cell = this.grid.getCell(r, c);
    
    // 1. Sens & Tell
    const adj = this.grid.getAdjacent(r, c);
    this.kb.addRules(r, c, adj);
    this.kb.tellPercept(r, c, cell.percepts);

    // 2. Inference & Decision
    // Find neighbors to visit
    const neighbors = adj.map(([nr, nc]) => ({ r: nr, c: nc, key: `${nr},${nc}` }));
    
    // Check safe unvisited neighbors
    for (const n of neighbors) {
      if (!this.visited.has(n.key)) {
        this.inferenceSteps++;
        if (this.kb.askSafe(n.r, n.c)) {
          this.moveTo(n.r, n.c);
          return true;
        }
      }
    }

    // If no safe unvisited neighbors, backtrack to a visited neighbor that has safe unvisited options
    // For simplicity, just backtrack in history
    if (this.history.length > 1) {
      this.history.pop(); // Remove current
      const prev = this.history[this.history.length - 1];
      this.pos = [prev[0], prev[1]];
      return true;
    }

    return false; // Stuck
  }

  private moveTo(r: number, c: number) {
    this.pos = [r, c];
    this.visited.add(`${r},${c}`);
    this.history.push([r, c]);
    this.grid.setVisited(r, c);
    this.grid.setSafe(r, c);
  }

  public isAtGold(): boolean {
    const [r, c] = this.pos;
    return this.grid.getCell(r, c).hasGold;
  }
}
