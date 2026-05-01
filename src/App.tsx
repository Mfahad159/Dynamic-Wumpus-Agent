import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { Grid } from './logic/Grid';
import { Agent } from './logic/Agent';
import type { GridConfig, Percept } from './logic/types';

const App: React.FC = () => {
  const [config, setConfig] = useState<GridConfig>({ rows: 5, cols: 5, pitProbability: 0.2 });
  const [grid, setGrid] = useState<Grid | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [inferenceSteps, setInferenceSteps] = useState(0);
  const [percepts, setPercepts] = useState<Percept[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'won' | 'stuck'>('idle');
  const [tick, setTick] = useState(0); // For forcing re-renders
  
  console.log('App rendering, status:', status);
  
  const timerRef = useRef<number | null>(null);

  const initGame = () => {
    const newGrid = new Grid(config);
    const newAgent = new Agent(newGrid);
    setGrid(newGrid);
    setAgent(newAgent);
    setInferenceSteps(0);
    setPercepts(newGrid.getCell(0, 0).percepts);
    setStatus('running');
  };

  const nextStep = () => {
    if (!agent || !grid) return;
    
    const moved = agent.step();
    setInferenceSteps(agent.getInferenceSteps());
    
    const [r, c] = agent.getPos();
    setPercepts(grid.getCell(r, c).percepts);

    if (agent.isAtGold()) {
      setStatus('won');
      if (timerRef.current) clearInterval(timerRef.current);
    } else if (!moved) {
      setStatus('stuck');
      if (timerRef.current) clearInterval(timerRef.current);
    }

    // Force re-render
    setTick(t => t + 1);
  };

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const renderCell = (r: number, c: number) => {
    if (!grid || !agent) return null;
    const cell = grid.getCell(r, c);
    const [ar, ac] = agent.getPos();
    const isAgent = ar === r && ac === c;
    
    let className = 'cell';
    if (!cell.isVisited) {
      className += ' unvisited';
      if (cell.isSafe) className += ' safe';
    } else {
      className += ' visited';
    }
    
    if (isAgent) className += ' agent';

    return (
      <div key={`${r}-${c}`} className={className}>
        <div className="percept-icon">
          {cell.percepts.includes('Breeze') && <div className="percept-dot breeze" title="Breeze" />}
          {cell.percepts.includes('Stench') && <div className="percept-dot stench" title="Stench" />}
        </div>
        {status === 'won' && cell.hasGold && '💰'}
        {(status === 'stuck' || status === 'won') && cell.hasPit && '🕳️'}
        {(status === 'stuck' || status === 'won') && cell.hasWumpus && '👹'}
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
        {Array.from({ length: config.rows }).map((_, r) => (
          Array.from({ length: config.cols }).map((_, c) => renderCell(r, c))
        ))}
      </div>
    );
  };

  return (
    <div className="app-container">
      <div className="grid-viewport">
        {grid ? renderGrid() : <div className="start-msg">Set dimensions and start!</div>}
      </div>

      <div className="side-panel">
        <div className="card">
          <h2>Wumpus Agent</h2>
          <div className="stat-row">
            <span className="stat-label">Status</span>
            <span className={`stat-value status-${status}`}>{status.toUpperCase()}</span>
          </div>
          <div className="stat-row">
            <span className="stat-label">Inference Steps</span>
            <span className="stat-value">{inferenceSteps}</span>
          </div>
        </div>

        <div className="card">
          <h2>Current Percepts</h2>
          <div className="percept-list">
            {percepts.length > 0 ? percepts.map(p => (
              <span key={p} className="percept-badge">{p}</span>
            )) : <span className="stat-label">None</span>}
          </div>
        </div>

        <div className="card controls">
          <h2>Controls</h2>
          <div className="stat-row">
            <span className="stat-label">Grid Size</span>
            <input 
              type="number" 
              value={config.rows} 
              onChange={e => setConfig({...config, rows: parseInt(e.target.value) || 5, cols: parseInt(e.target.value) || 5})}
              style={{ width: '60px', background: 'transparent', border: '1px solid #444', color: 'white', borderRadius: '4px', padding: '2px' }}
            />
          </div>
          <button onClick={initGame}>New Game</button>
          <button onClick={nextStep} disabled={status !== 'running'}>Step Agent</button>
        </div>
      </div>
    </div>
  );
};

export default App;
