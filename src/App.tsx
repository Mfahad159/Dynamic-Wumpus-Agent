import React, { useState, useEffect, useRef } from 'react';
import './index.css';
import { Grid } from './logic/Grid';
import { Agent } from './logic/Agent';
import type { GridConfig, Percept } from './logic/types';
import { Bot, Coins, Skull, Zap, Wind, Waves, Play, Square, FastForward, RotateCcw } from 'lucide-react';

const App: React.FC = () => {
  const [config, setConfig] = useState<GridConfig>({ rows: 5, cols: 5, pitProbability: 0.2 });
  const [grid, setGrid] = useState<Grid | null>(null);
  const [agent, setAgent] = useState<Agent | null>(null);
  const [inferenceSteps, setInferenceSteps] = useState(0);
  const [percepts, setPercepts] = useState<Percept[]>([]);
  const [status, setStatus] = useState<'idle' | 'running' | 'won' | 'stuck' | 'auto'>('idle');
  const [speed, setSpeed] = useState(500);
  const [tick, setTick] = useState(0); 
  
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
    if (status === 'auto') {
      timerRef.current = window.setInterval(nextStep, speed);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [status, speed]);

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
          {cell.percepts.includes('Breeze') && <Wind size={10} className="icon-breeze" />}
          {cell.percepts.includes('Stench') && <Waves size={10} className="icon-stench" />}
        </div>
        {isAgent && <Bot size={32} color="var(--agent-color)" className="agent-icon" />}
        {status === 'won' && cell.hasGold && <Coins size={24} color="#fbbf24" />}
        {(status === 'stuck' || status === 'won') && cell.hasPit && <Skull size={24} color="#ef4444" />}
        {(status === 'stuck' || status === 'won') && cell.hasWumpus && <Zap size={24} color="#f87171" />}
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
          <button onClick={initGame} className="btn-primary">
            <RotateCcw size={16} /> New Game
          </button>
          <div className="button-group">
            <button 
              onClick={nextStep} 
              disabled={status !== 'running'}
              className="btn-secondary"
            >
              <Play size={16} /> Step
            </button>
            <button 
              onClick={() => setStatus(status === 'auto' ? 'running' : 'auto')}
              disabled={status === 'idle' || status === 'won' || status === 'stuck'}
              className="btn-secondary"
            >
              {status === 'auto' ? <><Square size={16} /> Stop</> : <><FastForward size={16} /> Auto</>}
            </button>
          </div>
          <div className="stat-row">
            <span className="stat-label">Speed (ms)</span>
            <input 
              type="range" 
              min="100" 
              max="2000" 
              value={speed} 
              onChange={e => setSpeed(parseInt(e.target.value))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
