import React from "react";
import { Play, GitCompare, RotateCcw, RefreshCw, BarChart2, Shuffle } from "lucide-react";

export default function ControlPanel({
  startNode,
  endNode,
  algorithm,
  setAlgorithm,
  onCalculateRoute,
  onCompare,
  onClearSelection,
  onResetTraffic,
  onRandomizeTraffic,
  onOpenExperiments,
  loading,
}) {
  return (
    <div className="control-panel-card">
      <div className="selection-status-row">
        <div className="status-chip start">
          <span className="dot"></span>
          <span className="label">Start Node:</span>
          <span className="value">
            {startNode !== null ? `Node ${startNode}` : "Click any node"}
          </span>
        </div>

        <div className="status-chip dest">
          <span className="dot"></span>
          <span className="label">Destination:</span>
          <span className="value">
            {endNode !== null ? `Node ${endNode}` : "Click another node"}
          </span>
        </div>

        <div className="quick-actions">
          <button
            type="button"
            className="btn-action-small randomize-btn"
            onClick={onRandomizeTraffic}
            title="Randomize traffic across all 50 nodes and roads instantly"
          >
            <Shuffle size={14} /> Randomize Grid Traffic
          </button>
          <button
            type="button"
            className="btn-action-small"
            onClick={onClearSelection}
            disabled={startNode === null && endNode === null}
          >
            <RotateCcw size={14} /> Clear Selection
          </button>
          <button
            type="button"
            className="btn-action-small"
            onClick={onResetTraffic}
            title="Reset all edge traffic densities to default 20%"
          >
            <RefreshCw size={14} /> Reset Traffic (20%)
          </button>
          <button
            type="button"
            className="btn-action-small highlight"
            onClick={onOpenExperiments}
          >
            <BarChart2 size={14} /> View 120 Experiments
          </button>
        </div>
      </div>

      <div className="algorithm-actions-row">
        <div className="algo-selector-group">
          <button
            type="button"
            className={`algo-btn ${algorithm === "dijkstra" ? "active" : ""}`}
            onClick={() => setAlgorithm("dijkstra")}
          >
            Dijkstra's Algorithm
          </button>
          <button
            type="button"
            className={`algo-btn ${algorithm === "astar" ? "active" : ""}`}
            onClick={() => setAlgorithm("astar")}
          >
            A* Search (Admissible Heuristic)
          </button>
        </div>

        <div className="exec-buttons">
          <button
            type="button"
            className="btn-primary-glow"
            onClick={onCalculateRoute}
            disabled={startNode === null || endNode === null || loading}
          >
            <Play size={16} fill="currentColor" /> Run {algorithm === "astar" ? "A* Search" : "Dijkstra"}
          </button>
          <button
            type="button"
            className="btn-compare-glow"
            onClick={onCompare}
            disabled={startNode === null || endNode === null || loading}
          >
            <GitCompare size={16} /> Compare Both Side-by-Side
          </button>
        </div>
      </div>
    </div>
  );
}
