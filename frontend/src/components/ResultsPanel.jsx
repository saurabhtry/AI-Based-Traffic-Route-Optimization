import React from "react";
import { CheckCircle2, Zap, Clock, MapPin, Activity, Cpu } from "lucide-react";

export default function ResultsPanel({ singleResult, compareResult }) {
  if (!singleResult && !compareResult) {
    return (
      <div className="results-empty-card">
        <MapPin size={32} className="empty-icon" />
        <p className="empty-text">Select Start & Destination nodes, then click Run or Compare to view optimal routes and performance metrics.</p>
      </div>
    );
  }

  if (compareResult) {
    const d = compareResult.dijkstra;
    const a = compareResult.astar;
    const nodeDiff = d.nodes_explored - a.nodes_explored;
    const nodeReductionPct = d.nodes_explored > 0 
      ? Math.round((nodeDiff / d.nodes_explored) * 100) 
      : 0;

    return (
      <div className="results-card">
        <div className="results-header">
          <div className="header-left">
            <CheckCircle2 size={20} className="success-icon" />
            <span className="results-title">Head-to-Head Algorithm Comparison</span>
          </div>
          <span className="badge-comparison">Identical Graph & Traffic Conditions</span>
        </div>

        <div className="comparison-table-wrapper">
          <table className="comparison-table">
            <thead>
              <tr>
                <th>Performance Metric</th>
                <th className="th-dijkstra">Dijkstra's Algorithm</th>
                <th className="th-astar">A* Search (Guided)</th>
                <th>Comparison / Observation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Travel Time (Optimal Cost)</td>
                <td className="highlight-val">{d.travel_time} min</td>
                <td className="highlight-val">{a.travel_time} min</td>
                <td className="text-success font-semibold">Identical Optimal Quality (Admissible)</td>
              </tr>
              <tr>
                <td>Total Route Distance</td>
                <td>{d.distance} km</td>
                <td>{a.distance} km</td>
                <td>Identical Optimal Path Length</td>
              </tr>
              <tr>
                <td>Average Route Congestion</td>
                <td>{d.average_traffic}%</td>
                <td>{a.average_traffic}%</td>
                <td>Identical Congestion Level</td>
              </tr>
              <tr className="highlight-row">
                <td>Nodes Explored (Search Space)</td>
                <td className="text-warning font-bold">{d.nodes_explored} nodes</td>
                <td className="text-success font-bold">{a.nodes_explored} nodes</td>
                <td className="text-accent font-bold">
                  {nodeDiff >= 0 
                    ? `A* explored ${nodeDiff} fewer nodes (-${nodeReductionPct}%)` 
                    : "Similar search space"}
                </td>
              </tr>
              <tr>
                <td>Algorithm Execution Time</td>
                <td>{d.execution_time_ms} ms</td>
                <td>{a.execution_time_ms} ms</td>
                <td>Measured using Python perf_counter</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="routes-comparison-summary">
          <div className="route-box">
            <span className="route-box-title dijkstra">Dijkstra Route ({d.route.length} nodes):</span>
            <div className="route-tags">
              {d.route.map((node, i) => (
                <React.Fragment key={`d-${node}-${i}`}>
                  <span className="node-chip">{node}</span>
                  {i < d.route.length - 1 && <span className="arrow">➔</span>}
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className="route-box">
            <span className="route-box-title astar">A* Search Route ({a.route.length} nodes):</span>
            <div className="route-tags">
              {a.route.map((node, i) => (
                <React.Fragment key={`a-${node}-${i}`}>
                  <span className="node-chip astar-chip">{node}</span>
                  {i < a.route.length - 1 && <span className="arrow">➔</span>}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const res = singleResult;
  return (
    <div className="results-card">
      <div className="results-header">
        <div className="header-left">
          <CheckCircle2 size={20} className="success-icon" />
          <span className="results-title">
            Optimal Route Found ({res.algorithm === "astar" ? "A* Search" : "Dijkstra's Algorithm"})
          </span>
        </div>
      </div>

      <div className="metrics-summary-grid">
        <div className="metric-card">
          <div className="metric-header">
            <Clock size={16} />
            <span>Travel Time</span>
          </div>
          <div className="metric-big-value">{res.travel_time} <span className="unit">min</span></div>
          <div className="metric-sub">Traffic-adjusted cost</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <MapPin size={16} />
            <span>Route Distance</span>
          </div>
          <div className="metric-big-value">{res.distance} <span className="unit">km</span></div>
          <div className="metric-sub">{res.route.length} nodes in path</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <Activity size={16} />
            <span>Avg Congestion</span>
          </div>
          <div className="metric-big-value">{res.average_traffic} <span className="unit">%</span></div>
          <div className="metric-sub">Across chosen roads</div>
        </div>

        <div className="metric-card highlight">
          <div className="metric-header">
            <Cpu size={16} />
            <span>Nodes Explored</span>
          </div>
          <div className="metric-big-value">{res.nodes_explored} <span className="unit">nodes</span></div>
          <div className="metric-sub">Search efficiency metric</div>
        </div>

        <div className="metric-card">
          <div className="metric-header">
            <Zap size={16} />
            <span>Runtime</span>
          </div>
          <div className="metric-big-value">{res.execution_time_ms} <span className="unit">ms</span></div>
          <div className="metric-sub">In-memory execution</div>
        </div>
      </div>

      <div className="route-flow-container">
        <span className="route-flow-label">Path Sequence:</span>
        <div className="route-flow-sequence">
          {res.route.map((node, i) => (
            <React.Fragment key={`r-${node}-${i}`}>
              <span className={`flow-chip ${i === 0 ? "start-chip" : i === res.route.length - 1 ? "dest-chip" : ""}`}>
                {node}
              </span>
              {i < res.route.length - 1 && <span className="flow-arrow">➔</span>}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}
