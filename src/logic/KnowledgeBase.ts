type Literal = string;
type Clause = Set<Literal>;

export class KnowledgeBase {
  private clauses: Clause[] = [];

  constructor() {}

  public tell(clause: Clause) {
    // Basic simplification: don't add tautologies (L and ~L)
    if (this.isTautology(clause)) return;
    this.clauses.push(new Set(clause));
  }

  private isTautology(clause: Clause): boolean {
    for (const lit of clause) {
      if (clause.has(this.negate(lit))) return true;
    }
    return false;
  }

  private negate(lit: Literal): Literal {
    return lit.startsWith('~') ? lit.slice(1) : '~' + lit;
  }

  public askSafe(r: number, c: number): boolean {
    // To prove a cell is safe, we must prove (~P_r_c AND ~W_r_c).
    // This is equivalent to proving (~P_r_c) AND proving (~W_r_c).
    const pitSafe = this.prove(`~P_${r}_${c}`);
    const wumpusSafe = this.prove(`~W_${r}_${c}`);
    return pitSafe && wumpusSafe;
  }

  private prove(query: Literal): boolean {
    // Resolution Refutation: To prove Query, show KB & ~Query is unsatisfiable.
    const goal = this.negate(query);
    const workingSet = [...this.clauses, new Set([goal])];
    const newClauses: Clause[] = [];

    // Simple resolution algorithm
    // Note: For a real project, we'd want a more optimized version.
    // We'll limit iterations to prevent infinite loops in complex KBs.
    let iterations = 0;
    const maxIterations = 500; 

    while (iterations < maxIterations) {
      const pairs: [Clause, Clause][] = [];
      for (let i = 0; i < workingSet.length; i++) {
        for (let j = i + 1; j < workingSet.length; j++) {
          pairs.push([workingSet[i], workingSet[j]]);
        }
      }

      for (const [c1, c2] of pairs) {
        const resolvents = this.resolve(c1, c2);
        for (const res of resolvents) {
          if (res.size === 0) return true; // Contradiction found!
          if (!this.contains(workingSet, res) && !this.contains(newClauses, res)) {
            newClauses.push(res);
          }
        }
      }

      if (newClauses.length === 0) return false;
      
      // Add new clauses to working set
      for (const nc of newClauses) {
        workingSet.push(nc);
      }
      newClauses.length = 0;
      iterations++;
    }

    return false;
  }

  private resolve(c1: Clause, c2: Clause): Clause[] {
    const resolvents: Clause[] = [];
    for (const l1 of c1) {
      const nl1 = this.negate(l1);
      if (c2.has(nl1)) {
        const res = new Set(c1);
        res.delete(l1);
        for (const l2 of c2) {
          if (l2 !== nl1) res.add(l2);
        }
        if (!this.isTautology(res)) {
          resolvents.push(res);
        }
      }
    }
    return resolvents;
  }

  private contains(setOfClauses: Clause[], target: Clause): boolean {
    return setOfClauses.some(c => {
      if (c.size !== target.size) return false;
      for (const l of target) {
        if (!c.has(l)) return false;
      }
      return true;
    });
  }

  // Helper to add Wumpus World rules for a cell
  public addRules(r: number, c: number, adj: [number, number][]) {
    const breeze = `B_${r}_${c}`;
    const stench = `S_${r}_${c}`;

    // B_r_c <=> (P_adj1 v P_adj2 v ...)
    // 1. ~B_r_c v P_adj1 v P_adj2 v ...
    const bToP = new Set<Literal>([this.negate(breeze)]);
    for (const [ar, ac] of adj) bToP.add(`P_${ar}_${ac}`);
    this.tell(bToP);

    // 2. ~P_adji v B_r_c
    for (const [ar, ac] of adj) {
      this.tell(new Set([this.negate(`P_${ar}_${ac}`), breeze]));
    }

    // Same for Stench and Wumpus
    const sToW = new Set<Literal>([this.negate(stench)]);
    for (const [ar, ac] of adj) sToW.add(`W_${ar}_${ac}`);
    this.tell(sToW);

    for (const [ar, ac] of adj) {
      this.tell(new Set([this.negate(`W_${ar}_${ac}`), stench]));
    }
    
    // Constraint: Exactly one Wumpus (simplified: at least one and at most one)
    // Actually, for simplicity in this agent, we just rely on percepts.
  }

  public tellPercept(r: number, c: number, percepts: string[]) {
    const breeze = `B_${r}_${c}`;
    const stench = `S_${r}_${c}`;

    if (percepts.includes('Breeze')) {
      this.tell(new Set([breeze]));
    } else {
      this.tell(new Set([this.negate(breeze)]));
    }

    if (percepts.includes('Stench')) {
      this.tell(new Set([stench]));
    } else {
      this.tell(new Set([this.negate(stench)]));
    }
  }
}
