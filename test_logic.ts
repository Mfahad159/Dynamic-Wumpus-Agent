import { Grid } from './src/logic/Grid';
import { Agent } from './src/logic/Agent';
import { KnowledgeBase } from './src/logic/KnowledgeBase';

console.log("--- Validating Phase 1: Grid Engine ---");
const grid = new Grid({ rows: 4, cols: 4, pitProbability: 0.2 });
console.log("Grid initialized. Rows:", grid.getRows(), "Cols:", grid.getCols());
const startCell = grid.getCell(0, 0);
console.log("Start cell safe:", startCell.isSafe);
console.log("Start cell hazards:", startCell.hasPit, startCell.hasWumpus);

console.log("\n--- Validating Phase 2: Knowledge Base (Inference) ---");
const kb = new KnowledgeBase();
// Scenario: Breeze at 0,0 implies pit at 0,1 or 1,0
kb.addRules(0, 0, [[0, 1], [1, 0]]);
kb.tellPercept(0, 0, ['Breeze']);
console.log("Query: Is (0,1) safe? (Should be false):", kb.askSafe(0, 1));

const kb2 = new KnowledgeBase();
kb2.addRules(0, 0, [[0, 1], [1, 0]]);
kb2.tellPercept(0, 0, []); // No Breeze
console.log("Query: Is (0,1) safe? (Should be true):", kb2.askSafe(0, 1));

console.log("\n--- Validating Phase 3: Agent Decision Engine ---");
const agent = new Agent(grid);
console.log("Initial Pos:", agent.getPos());
const moved = agent.step();
console.log("Agent moved?", moved);
console.log("New Pos:", agent.getPos());
console.log("Inference steps:", agent.getInferenceSteps());
