import React, { useState, useEffect, useRef, useCallback } from 'react';
import './index.css';
import { Grid } from './logic/Grid';
import { Agent } from './logic/Agent';
import type { GridConfig, Percept } from './logic/types';
import {
  Bot, Coins, Skull, Zap, Wind, Waves,
  Play, Square, FastForward, RotateCcw,
  BrainCircuit, Activity, Gauge
} from 'lucide-react';

const STATUS_LABELS: Record<string, string> = {
  idle: 'Idle',
  running: 'Exploring',
  auto: 'Auto',
  won: 'Gold Found',
  stuck: 'Stuck',
};

const App: React.FC = () => {
  const [config, setConfig] = useState<GridConfig>({ rows: 5, cols: 5, pitProbability: 0.2 });
  const [grid, setGrid] = useState<Grid | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [inferenceSteps, setInferenceSteps] = useState(0);
  const [percepts, setPercepts] = useState<Percept[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'won' | 'stuck' | 'auto'>('idle');
  const [speed, setSpeed] = useState(500);
  const [tick, setTick] = useState(0);
  const [moves, setMoves] = useState(0);

  // Use refs so the auto-play interval always reads fresh values
  const agentRef = useRef<Agent | null>(null);
  const gridRef = useRef<Grid | null>(null);
  const statusRef = useRef<typeof status>('idle');
  const timerRef = useRef<number | null>(null);

  const syncAgentState = useCallback(() => {
    const a = agentRef.current;
    const g = gridRef.current;
    if (!a || !g) return;
    const [r, c] = a.getPos();
    setInferenceSteps(a.getInferenceSteps());
    setPercepts(g.getCell(r, c).percepts);
    setTick(t => t + 1);
  }, []);

  const finishGame = useCallback((result: 'won' | 'stuck') => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    setStatus(result);
    statusRef.current = result;
  }, []);

  const doStep = useCallback(() => {
    const a = agentRef.current;
    const g = gridRef.current;
    if (!a || !g) return;
    const moved = a.step();
    setMoves(m => m + 1);
    syncAgentState();
    if (a.isAtGold()) finishGame('won');
    else if (!moved) finishGame('stuck');
  }, [syncAgentState, finishGame]);

  const initGame = () => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    const newGrid = new Grid(config);
    const newAgent = new Agent(newGrid);
    gridRef.current = newGrid;
    agentRef.current = newAgent;
    setGrid(newGrid);
    setAgent(newAgent);
    setInferenceSteps(0);
    setMoves(0);
    setPercepts(newGrid.getCell(0, 0).percepts);
    setStatus('running');
    statusRef.current = 'running';
  };

  // Auto-play: start/stop interval when status changes
  useEffect(() => {
    if (status === 'auto') {
      timerRef.current = window.setInterval(doStep, speed);
    } else {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
    }
    return () => { if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; } };
  }, [status, speed, doStep]);

  const toggleAuto = () => {
    if (status === 'auto') setStatus('running');
    else if (status === 'running') setStatus('auto');
  };

  const renderCell = (r: number, c: number) => {
    if (!grid || !agent) return null;
    const cell = grid.getCell(r, c);
    const [ar, ac] = agent.getPos();
    const isAgentHere = ar === r && ac === c;

    let cls = 'cell';
    if (!cell.isVisited) {
      cls += ' unvisited';
      if (cell.isSafe) cls += ' safe';
    } else {
      cls += ' visited';
    }
    if (isAgentHere) cls += ' agent';

    const revealHazards = status === 'won' || status === 'stuck';

    return (
      <div key={`${r}-${c}`} className={cls}>
        {/* Percept indicators */}
        <div className="percept-icon">
          {cell.percepts.includes('Breeze') && <Wind size={11} className="icon-breeze" />}
          {cell.percepts.includes('Stench') && <Waves size={11} className="icon-stench" />}
        </div>
        {/* Cell contents */}
        {isAgentHere && <Bot size={28} color="var(--agent-color)" className="agent-icon" />}
        {!isAgentHere && revealHazards && cell.hasPit && <Skull size={22} color="#ef4444" />}
        {!isAgentHere && revealHazards && cell.hasWumpus && <Zap size={22} color="#f87171" />}
        {!isAgentHere && revealHazards && cell.hasGold && <Coins size={22} color="#fbbf24" />}
      </div>
    );
  };

  const renderGrid = () => {
    if (!grid) return null;
    return (
      <div
        className="grid-container"
        style={{ gridTemplateColumns: `repeat(${config.cols}, 60px)` }}
      >
        {Array.from({ length: config.rows }).map((_, r) =>
          Array.from({ length: config.cols }).map((_, c) => renderCell(r, c))
        )}
      </div>
    );
  };

  const statusClass = `status-badge status-${status}`;

  return (
    <div className="page-wrapper">
      {/* Title Bar */}
      <header className="title-bar">
        <div className="title-bar-left">
          <BrainCircuit size={22} color="var(--accent-color)" />
          <span className="title-text">Dynamic Wumpus Logic Agent</span>
        </div>
        <span className={statusClass}>{STATUS_LABELS[status]}</span>
      </header>

      <div className="app-container">
        {/* Grid Area */}
        <div className="grid-viewport">
          {grid
            ? renderGrid()
            : <div className="start-msg">
                <BrainCircuit size={40} color="var(--accent-color)" style={{ marginBottom: 12 }} />
                <p>Configure the grid and press <strong>New Game</strong> to begin.</p>
              </div>
          }
        </div>

        {/* Sidebar */}
        <div className="side-panel">

          {/* Metrics */}
          <div className="card">
            <h2><Activity size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />Metrics</h2>
            <div className="stat-row">
              <span className="stat-label">Inference Steps</span>
              <span className="stat-value accent">{inferenceSteps}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Moves Made</span>
              <span className="stat-value">{moves}</span>
            </div>
            <div className="stat-row">
              <span className="stat-label">Grid Size</span>
              <span className="stat-value">{config.rows} × {config.cols}</span>
            </div>
          </div>

          {/* Percepts */}
          <div className="card">
            <h2><Waves size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />Percepts</h2>
            <div className="percept-list">
              {percepts.length > 0
                ? percepts.map(p => <span key={p} className={`percept-badge percept-${p.toLowerCase()}`}>{p}</span>)
                : <span className="stat-label">None</span>
              }
            </div>
          </div>

          {/* Controls */}
          <div className="card controls">
            <h2><Gauge size={15} style={{ marginRight: 6, verticalAlign: 'middle' }} />Controls</h2>

            <div className="stat-row" style={{ alignItems: 'center' }}>
              <span className="stat-label">Grid Size (N×N)</span>
              <input
                id="grid-size"
                type="number"
                min={3} max={10}
                value={config.rows}
                onChange={e => {
                  const n = Math.max(3, Math.min(10, parseInt(e.target.value) || 5));
                  setConfig({ ...config, rows: n, cols: n });
                }}
                className="number-input"
              />
            </div>

            <div className="stat-row" style={{ alignItems: 'center' }}>
              <span className="stat-label">Pit Density</span>
              <span className="stat-value">{Math.round(config.pitProbability * 100)}%</span>
            </div>
            <input
              type="range" min={0} max={40} step={5}
              value={Math.round(config.pitProbability * 100)}
              onChange={e => setConfig({ ...config, pitProbability: parseInt(e.target.value) / 100 })}
              className="range-input"
            />

            <button id="btn-new-game" onClick={initGame} className="btn-primary">
              <RotateCcw size={15} /> New Game
            </button>

            <div className="button-group">
              <button
                id="btn-step"
                onClick={doStep}
                disabled={status !== 'running'}
                className="btn-secondary"
              >
                <Play size={15} /> Step
              </button>
              <button
                id="btn-auto"
                onClick={toggleAuto}
                disabled={status === 'idle' || status === 'won' || status === 'stuck'}
                className={status === 'auto' ? 'btn-danger' : 'btn-secondary'}
              >
                {status === 'auto'
                  ? <><Square size={15} /> Stop</>
                  : <><FastForward size={15} /> Auto</>
                }
              </button>
            </div>

            <div className="speed-row">
              <span className="stat-label">Speed: {speed}ms</span>
              <input
                type="range" min={100} max={2000} step={100}
                value={speed}
                onChange={e => setSpeed(parseInt(e.target.value))}
                className="range-input"
              />
            </div>
          </div>

          {/* Legend */}
          <div className="card legend">
            <h2>Legend</h2>
            <div className="legend-item"><span className="legend-swatch safe-swatch" /> Safe (proven)</div>
            <div className="legend-item"><span className="legend-swatch visited-swatch" /> Visited</div>
            <div className="legend-item"><span className="legend-swatch unknown-swatch" /> Unknown</div>
            <div className="legend-item"><Bot size={14} color="var(--agent-color)" /> Agent</div>
            <div className="legend-item"><Skull size={14} color="#ef4444" /> Pit</div>
            <div className="legend-item"><Zap size={14} color="#f87171" /> Wumpus</div>
            <div className="legend-item"><Coins size={14} color="#fbbf24" /> Gold</div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;
