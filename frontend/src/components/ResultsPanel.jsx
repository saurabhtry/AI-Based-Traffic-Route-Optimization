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
    const nodeDiff = Math.max(0, d.nodes_explored - a.nodes_explored);
    const nodeReductionPct = d.nodes_explored > 0 
      ? Math.round((nodeDiff / d.nodes_explored) * 100) 
      : 0;

    const dijkstraExplored = d.explored_nodes || [];
    const astarExplored = a.explored_nodes || [];
    const astarSet = new Set(astarExplored);
    const prunedNodes = dijkstraExplored.filter((n) => !astarSet.has(n));

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
                <td className="text-warning font-bold">{d.nodes_explored} nodes ({Math.round((d.nodes_explored / 50) * 100)}%)</td>
                <td className="text-success font-bold">{a.nodes_explored} nodes ({Math.round((a.nodes_explored / 50) * 100)}%)</td>
                <td className="text-accent font-bold">
                  {nodeDiff > 0 
                    ? `A* explored ${nodeDiff} fewer nodes (-${nodeReductionPct}%)` 
                    : "Identical search space"}
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

        {/* Optimal Path Routes */}
        <div className="routes-comparison-summary">
          <div className="route-box">
            <span className="route-box-title dijkstra">Dijkstra Optimal Route ({d.route.length} nodes):</span>
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
            <span className="route-box-title astar">A* Search Optimal Route ({a.route.length} nodes):</span>
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

        {/* Detailed Explored Nodes Section */}
        <div className="explored-nodes-section">
          <div className="explored-section-header">
            <Cpu size={18} className="text-accent" />
            <h4 className="explored-section-title">
              Nodes Explored by Both Algorithms (Moving from Node {compareResult.start} ➔ Node {compareResult.end})
            </h4>
          </div>

          <div className="explored-grid">
            <div className="explored-box dijkstra">
              <div className="explored-box-header">
                <span className="title">Dijkstra Explored Nodes ({d.nodes_explored} of 50 nodes)</span>
                <span className="count-badge dijkstra">{Math.round((d.nodes_explored / 50) * 100)}% of network</span>
              </div>
              <p className="explored-box-desc">
                Nodes visited in increasing order of travel time $g(n)$ from start:
              </p>
              <div className="explored-chips-container">
                {dijkstraExplored.length > 0 ? (
                  dijkstraExplored.map((node, idx) => (
                    <span
                      key={`exp-d-${node}-${idx}`}
                      className={`explored-chip dijkstra ${d.route.includes(node) ? "in-route" : ""}`}
                      title={d.route.includes(node) ? `Node ${node} (In Optimal Route)` : `Node ${node} (Explored)`}
                    >
                      <span className="step-num">{idx + 1}.</span> {node}
                    </span>
                  ))
                ) : (
                  <span className="empty-explored">No nodes explored</span>
                )}
              </div>
            </div>

            <div className="explored-box astar">
              <div className="explored-box-header">
                <span className="title">A* Search Explored Nodes ({a.nodes_explored} of 50 nodes)</span>
                <span className="count-badge astar">{Math.round((a.nodes_explored / 50) * 100)}% of network</span>
              </div>
              <p className="explored-box-desc">
                Nodes visited under heuristic guidance $f(n) = g(n) + h(n)$ towards destination:
              </p>
              <div className="explored-chips-container">
                {astarExplored.length > 0 ? (
                  astarExplored.map((node, idx) => (
                    <span
                      key={`exp-a-${node}-${idx}`}
                      className={`explored-chip astar ${a.route.includes(node) ? "in-route" : ""}`}
                      title={a.route.includes(node) ? `Node ${node} (In Optimal Route)` : `Node ${node} (Explored)`}
                    >
                      <span className="step-num">{idx + 1}.</span> {node}
                    </span>
                  ))
                ) : (
                  <span className="empty-explored">No nodes explored</span>
                )}
              </div>
            </div>
          </div>

          {/* Pruned Nodes Summary */}
          {prunedNodes.length > 0 && (
            <div className="pruned-nodes-card">
              <div className="pruned-card-header">
                <Zap size={16} className="text-warning" />
                <span className="pruned-title">
                  Pruned Nodes: {prunedNodes.length} Unnecessary Nodes Bypassed by A* Search (-{nodeReductionPct}%)
                </span>
              </div>
              <p className="pruned-desc">
                Dijkstra blindly expanded these nodes away from the destination, whereas A*'s admissible heuristic correctly assigned them higher expected costs and avoided exploring them:
              </p>
              <div className="pruned-chips-container">
                {prunedNodes.map((node) => (
                  <span key={`pruned-${node}`} className="pruned-chip">
                    Node {node}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const res = singleResult;
  const explored = res.explored_nodes || [];

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
          <div className="metric-sub">{Math.round((res.nodes_explored / 50) * 100)}% of 50-node network</div>
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
        <span className="route-flow-label">Optimal Path Sequence:</span>
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

      {/* Explored Nodes Sequence in Single Mode */}
      <div className="explored-nodes-section single">
        <div className="explored-section-header">
          <Cpu size={18} className="text-accent" />
          <h4 className="explored-section-title">
            Nodes Explored in Order Moving from Node {res.route[0]} to Node {res.route[res.route.length - 1]} ({res.nodes_explored} nodes visited)
          </h4>
        </div>
        <p className="explored-box-desc">
          Sequence of nodes popped from priority queue during search:
        </p>
        <div className="explored-chips-container">
          {explored.map((node, idx) => (
            <span
              key={`exp-s-${node}-${idx}`}
              className={`explored-chip ${res.algorithm === "astar" ? "astar" : "dijkstra"} ${res.route.includes(node) ? "in-route" : ""}`}
              title={res.route.includes(node) ? `Node ${node} (In Optimal Path)` : `Node ${node} (Explored)`}
            >
              <span className="step-num">{idx + 1}.</span> {node}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
