# Dynamic Wumpus Logic Agent

A high-performance, web-based implementation of a Knowledge-Based Agent navigating a Wumpus World environment. The agent utilizes Propositional Logic and a Resolution Refutation engine to deduce safe paths through a dynamically generated grid of hazards.

## Project Overview

The objective of this project is to demonstrate the practical application of symbolic AI in a dynamic environment. The agent operates without prior knowledge of the map, receiving percepts (Breeze, Stench) at each step to build its internal Knowledge Base (KB). Using resolution, it proves the safety of adjacent cells before making a move, ensuring a theoretically optimal survival rate in a deterministic environment.

## Key Features

- **Dynamic Environment**: User-configurable grid dimensions with randomized placement of Pits, the Wumpus, and Gold.
- **Automated Inference**: A custom-built propositional logic engine that performs Resolution Refutation to verify cell safety.
- **Real-time Metrics**: Live tracking of inference steps, percept active states, and agent status.
- **Premium UI**: Modern dark-themed interface built with React, featuring smooth transitions and clear visualization of logical states (Safe, Unknown, Hazard).
- **Auto-Play Mode**: Configurable simulation speed for observing agent behavior across large grids.

## Technical Architecture

The system is decoupled into three primary layers:

1.  **Grid Engine**: Manages state, hazard distribution, and percept generation based on adjacency rules.
2.  **Inference Engine (KB)**: Maintains a set of clauses in Conjunctive Normal Form (CNF) and executes the resolution algorithm.
3.  **Agent Logic**: Implements a search strategy that prioritizes cells proven safe by the KB.

## Logic and Inference Engine

The core of the agent is the Propositional Logic KB. 

### Symbols and Rules
- **P(r, c)**: Pit at row r, column c.
- **W(r, c)**: Wumpus at row r, column c.
- **B(r, c)**: Breeze at row r, column c.
- **S(r, c)**: Stench at row r, column c.

Rules are encoded as biconditionals: `B(r, c) <=> P(adj_1) v P(adj_2) v ...`. These are expanded into CNF clauses for the resolution engine.

### Resolution Refutation
To prove a cell (r, c) is safe, the agent attempts to prove the conjunction of `~P(r, c)` and `~W(r, c)`. For each property, the engine:
1. Negates the goal.
2. Adds it to the KB clauses.
3. Iteratively resolves pairs of clauses to find a contradiction (the empty clause).

### Challenges and Implementation Details
Building a resolution engine in a dynamic web environment presented several challenges:
- **Computational Complexity**: Resolution is NP-complete. To maintain a smooth UI at 60fps, the engine limits the depth of search and utilizes unit propagation where possible to simplify the clause set.
- **CNF Conversion**: Converting complex biconditionals into CNF without an exponential blow-up in clause count required careful management of literal sets.
- **Memory Management**: On large grids, the number of generated clauses can grow rapidly. The implementation ensures that only relevant local neighborhood rules are injected into the KB at any given time.

## Tech Stack

- **Framework**: React 18+
- **Build Tool**: Vite
- **Language**: TypeScript
- **Styling**: Vanilla CSS (Custom Variable System)
- **Deployment**: Vercel

## Setup and Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Live Demo
[Link to Live Application (Vercel)]

---
Developed as part of the AI (Semester 6) coursework.
