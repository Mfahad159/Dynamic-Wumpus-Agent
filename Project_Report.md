# Project Report: Dynamic Wumpus Logic Agent

**Course:** AI (Semester 6)  
**Date:** May 1, 2026  

---

## 1. Project Links
**GitHub Repository:** [https://github.com/Mfahad159/Dynamic-Wumpus-Agent](https://github.com/Mfahad159/Dynamic-Wumpus-Agent)  
**Live Deployment (Vercel):** [https://dynamic-wumpus-agent-z7ik.vercel.app/](https://dynamic-wumpus-agent-z7ik.vercel.app/)  

---

## 2. Project Objective
The **Dynamic Wumpus Logic Agent** is a Knowledge-Based Agent (KBA) designed to navigate a hazardous grid environment (Wumpus World). The primary goal is to use **Propositional Logic** and **Resolution Refutation** to deduce safe paths, avoiding pits and the Wumpus while searching for gold. Unlike simple pathfinders, this agent uses deductive reasoning to prove a cell is safe before entering it.

## 3. Technical Stack
The application is built using a modern, high-performance web stack to ensure smooth inference and premium aesthetics:
- **Framework:** React 18+ (Vite)
- **Language:** TypeScript (for type-safe logic implementation)
- **Styling:** Vanilla CSS with custom variables for a glassmorphic dark-themed UI.
- **Icons:** Lucide-React (Professional vector icons)
- **Logic Engine:** Custom Resolution Refutation implementation.

## 4. System Architecture
The system follows a decoupled architecture split into three distinct layers:

### 4.1 Grid Engine
- Manages the environment state (N×N grid).
- Randomly places hazards (Pits, Wumpus) and the objective (Gold).
- Generates percepts dynamically:
    - **Breeze:** If a Pit is adjacent.
    - **Stench:** If the Wumpus is adjacent.
    - **Glitter:** If Gold is in the current cell.

### 4.2 Inference Engine (Knowledge Base)
- Stores knowledge in **Conjunctive Normal Form (CNF)**.
- Implements the **Resolution Algorithm** to answer queries about cell safety.
- Handles the conversion of environment rules (e.g., "Breeze if and only if adjacent to a pit") into logical clauses.

### 4.3 Agent Engine
- Acts as the decision-maker.
- Prioritizes moving to cells proven safe by the KB.
- Implements a backtracking strategy to escape dead ends.

---

## 5. Logic and Inference Detail
The core strength of the agent lies in its ability to perform formal logical deduction.

### 5.1 Propositional Logic Rules
The agent encodes the rules of the world as logical sentences:
- $B_{r,c} \iff (P_{r+1,c} \lor P_{r-1,c} \lor P_{r,c+1} \lor P_{r,c-1})$
- $S_{r,c} \iff (W_{r+1,c} \lor W_{r-1,c} \lor W_{r,c+1} \lor W_{r,c-1})$

### 5.2 Resolution Refutation Process
To check if a cell $(r, c)$ is safe:
1. **Goal:** Prove $\neg P_{r,c} \land \neg W_{r,c}$.
2. **Negation:** The engine negates the goal and adds it to the KB.
3. **Contradiction Search:** It performs resolution on clauses. If an empty clause is derived, the goal is proven true via contradiction.

---

## 6. UI/UX Features
The interface is designed for academic presentation and real-time monitoring:
- **Interactive Dashboard:** Real-time metrics for inference steps and movement history.
- **Visual Logic States:** Cells are color-coded (Safe, Visited, Unknown, Hazard).
- **Auto-Play Simulation:** Users can adjust speed to observe the agent's deductive process autonomously.
- **Dynamic Controls:** Configurable grid dimensions and pit density.

## 7. Performance and Challenges
- **NP-Completeness:** Resolution is computationally expensive. The implementation optimizes by limiting search depth and using unit propagation to prune redundant clauses.
- **State Management:** React's `useRef` and `useCallback` hooks were utilized to manage the high-frequency updates during auto-play without stale closures.

## 8. Conclusion
This project successfully integrates symbolic AI with modern web technologies. It demonstrates how a logical agent can operate effectively in uncertain environments by building a mathematical model of its surroundings and acting only on proven facts.
