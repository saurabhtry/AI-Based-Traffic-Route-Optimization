import React, { useState } from "react";
import { Cpu, Layers, CheckCircle2 } from "lucide-react";

export default function TrafficGraph({
  nodes,
  edges,
  startNode,
  endNode,
  activeRoute,
  onNodeClick,
  onRoadClick,
  singleResult,
  compareResult,
  exploredOverlay = "both",
  setExploredOverlay,
}) {
  const [hoveredRoad, setHoveredRoad] = useState(null);
  const [hoveredNode, setHoveredNode] = useState(null);

  const routeEdgeSet = new Set();
  if (activeRoute && activeRoute.length > 1) {
    for (let i = 0; i < activeRoute.length - 1; i++) {
      const u = activeRoute[i];
      const v = activeRoute[i + 1];
      routeEdgeSet.add(`${Math.min(u, v)}-${Math.max(u, v)}`);
    }
  }

  const getTrafficColor = (density) => {
    if (density <= 0.30) return "#10b981";
    if (density <= 0.70) return "#f59e0b";
    return "#ef4444";
  };

  const nodeMap = new Map();
  nodes.forEach((n) => nodeMap.set(n.id, n));

  const dijkstraExploredList = compareResult?.dijkstra?.explored_nodes || [];
  const astarExploredList = compareResult?.astar?.explored_nodes || [];
  const singleExploredList = singleResult?.explored_nodes || [];

  const dijkstraExploredSet = new Set(dijkstraExploredList);
  const astarExploredSet = new Set(astarExploredList);
  const singleExploredSet = new Set(singleExploredList);

  const prunedList = dijkstraExploredList.filter((n) => !astarExploredSet.has(n));
  const prunedSet = new Set(prunedList);
  const bothSet = new Set(dijkstraExploredList.filter((n) => astarExploredSet.has(n)));

  const dCount = compareResult?.dijkstra?.nodes_explored ?? 0;
  const aCount = compareResult?.astar?.nodes_explored ?? 0;
  const diffCount = Math.max(0, dCount - aCount);
  const pctSaved = dCount > 0 ? Math.round((diffCount / dCount) * 100) : 0;

  return (
    <div className="graph-container">
      {/* Exploration Header & Overlay Controls */}
      {compareResult && (
        <div className="graph-exploration-bar">
          <div className="exploration-summary">
            <Cpu size={16} className="text-accent" />
            <span className="exp-label">
              Nodes Explored (Node {compareResult.start} ➔ {compareResult.end}):
            </span>
            <span className="exp-badge dijkstra">
              Dijkstra: <strong>{dCount}</strong> / 50 nodes
            </span>
            <span className="exp-badge astar">
              A* Search: <strong>{aCount}</strong> / 50 nodes
            </span>
            <span className="exp-badge diff">
              A* pruned <strong>{diffCount}</strong> nodes (-{pctSaved}%)
            </span>
          </div>

          <div className="exploration-toggle-group">
            <span className="toggle-label"><Layers size={13} /> Overlay:</span>
            <button
              type="button"
              className={`toggle-btn ${exploredOverlay === "route" ? "active" : ""}`}
              onClick={() => setExploredOverlay && setExploredOverlay("route")}
              title="Show only the optimal shortest path"
            >
              Route Only
            </button>
            <button
              type="button"
              className={`toggle-btn dijkstra ${exploredOverlay === "dijkstra" ? "active" : ""}`}
              onClick={() => setExploredOverlay && setExploredOverlay("dijkstra")}
              title="Highlight all nodes explored by Dijkstra"
            >
              Dijkstra ({dCount})
            </button>
            <button
              type="button"
              className={`toggle-btn astar ${exploredOverlay === "astar" ? "active" : ""}`}
              onClick={() => setExploredOverlay && setExploredOverlay("astar")}
              title="Highlight all nodes explored by A* Search"
            >
              A* Search ({aCount})
            </button>
            <button
              type="button"
              className={`toggle-btn both ${exploredOverlay === "both" ? "active" : ""}`}
              onClick={() => setExploredOverlay && setExploredOverlay("both")}
              title="Highlight common nodes vs pruned nodes"
            >
              Both / Pruned
            </button>
          </div>
        </div>
      )}

      {singleResult && !compareResult && (
        <div className="graph-exploration-bar">
          <div className="exploration-summary">
            <Cpu size={16} className="text-accent" />
            <span className="exp-label">
              Nodes Explored (Node {singleResult.route[0]} ➔ {singleResult.route[singleResult.route.length - 1]}):
            </span>
            <span className="exp-badge single">
              {singleResult.algorithm === "astar" ? "A* Search" : "Dijkstra"}:{" "}
              <strong>{singleResult.nodes_explored}</strong> / 50 nodes ({Math.round((singleResult.nodes_explored / 50) * 100)}% of network)
            </span>
          </div>

          <div className="exploration-toggle-group">
            <button
              type="button"
              className={`toggle-btn ${exploredOverlay === "route" ? "active" : ""}`}
              onClick={() => setExploredOverlay && setExploredOverlay("route")}
            >
              Route Only
            </button>
            <button
              type="button"
              className={`toggle-btn single ${exploredOverlay === "single" ? "active" : ""}`}
              onClick={() => setExploredOverlay && setExploredOverlay(exploredOverlay === "single" ? "route" : "single")}
            >
              {exploredOverlay === "single" ? "Hide" : "Show"} Explored ({singleResult.nodes_explored} nodes)
            </button>
          </div>
        </div>
      )}

      {/* Exploration Legend when overlay is enabled */}
      {compareResult && exploredOverlay !== "route" && (
        <div className="graph-overlay-legend">
          {exploredOverlay === "dijkstra" && (
            <span className="legend-tag dijkstra">
              <span className="tag-dot dijkstra"></span> Dijkstra Explored Nodes ({dCount})
            </span>
          )}
          {exploredOverlay === "astar" && (
            <span className="legend-tag astar">
              <span className="tag-dot astar"></span> A* Explored Nodes ({aCount})
            </span>
          )}
          {exploredOverlay === "both" && (
            <>
              <span className="legend-tag both">
                <span className="tag-dot both"></span> Explored by Both ({bothSet.size})
              </span>
              <span className="legend-tag pruned">
                <span className="tag-dot pruned"></span> Pruned by A* (Only Dijkstra Explored) ({prunedSet.size})
              </span>
            </>
          )}
          <span className="legend-tag route">
            <span className="tag-dot route"></span> Optimal Shortest Path
          </span>
        </div>
      )}

      <svg
        className="network-svg"
        viewBox="0 0 1020 520"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          <filter id="glow-route" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="glow-node" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <g className="edges-layer">
          {edges.map((edge) => {
            const u = nodeMap.get(edge.from_node);
            const v = nodeMap.get(edge.to_node);
            if (!u || !v) return null;

            const edgeKey = `${Math.min(edge.from_node, edge.to_node)}-${Math.max(edge.from_node, edge.to_node)}`;
            const isRoute = routeEdgeSet.has(edgeKey);
            const isHovered = hoveredRoad === edgeKey;
            const strokeColor = isRoute ? "#38bdf8" : getTrafficColor(edge.traffic_density);
            const strokeWidth = isRoute ? 5 : isHovered ? 3.5 : 2.2;

            const midX = (u.x + v.x) / 2;
            const midY = (u.y + v.y) / 2;

            return (
              <g key={edgeKey} className="edge-group">
                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke="transparent"
                  strokeWidth={20}
                  className="edge-hitarea"
                  onClick={() => onRoadClick(edge)}
                  onMouseEnter={() => setHoveredRoad(edgeKey)}
                  onMouseLeave={() => setHoveredRoad(null)}
                />

                <line
                  x1={u.x}
                  y1={u.y}
                  x2={v.x}
                  y2={v.y}
                  stroke={strokeColor}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                  strokeDasharray={edge.is_express ? "6,4" : undefined}
                  filter={isRoute ? "url(#glow-route)" : undefined}
                  className={`road-line ${isRoute ? "route-active" : ""}`}
                />

                {isRoute && (
                  <line
                    x1={u.x}
                    y1={u.y}
                    x2={v.x}
                    y2={v.y}
                    stroke="#ffffff"
                    strokeWidth={1.8}
                    strokeDasharray="8,12"
                    className="route-pulse-anim"
                  />
                )}

                <g
                  className="edge-badge"
                  transform={`translate(${midX}, ${midY})`}
                  onClick={() => onRoadClick(edge)}
                  onMouseEnter={() => setHoveredRoad(edgeKey)}
                  onMouseLeave={() => setHoveredRoad(null)}
                >
                  <rect
                    x={-14}
                    y={-8}
                    width={28}
                    height={16}
                    rx={4}
                    fill="#0f172a"
                    stroke={strokeColor}
                    strokeWidth={1.2}
                  />
                  <text
                    x={0}
                    y={3.5}
                    textAnchor="middle"
                    fontSize={8.5}
                    fontWeight="700"
                    fill={strokeColor}
                  >
                    {Math.round(edge.traffic_density * 100)}%
                  </text>
                </g>
              </g>
            );
          })}
        </g>

        <g className="nodes-layer">
          {nodes.map((node) => {
            const isStart = startNode === node.id;
            const isEnd = endNode === node.id;
            const isInRoute = activeRoute && activeRoute.includes(node.id);
            const isHovered = hoveredNode === node.id;

            // Exploration state
            let isExplored = false;
            let explorationType = null; // 'dijkstra', 'astar', 'both', 'pruned', 'single'

            if (!isStart && !isEnd && !isInRoute) {
              if (compareResult) {
                if (exploredOverlay === "dijkstra" && dijkstraExploredSet.has(node.id)) {
                  isExplored = true;
                  explorationType = "dijkstra";
                } else if (exploredOverlay === "astar" && astarExploredSet.has(node.id)) {
                  isExplored = true;
                  explorationType = "astar";
                } else if (exploredOverlay === "both") {
                  if (prunedSet.has(node.id)) {
                    isExplored = true;
                    explorationType = "pruned";
                  } else if (bothSet.has(node.id)) {
                    isExplored = true;
                    explorationType = "both";
                  }
                }
              } else if (singleResult && exploredOverlay === "single") {
                if (singleExploredSet.has(node.id)) {
                  isExplored = true;
                  explorationType = "single";
                }
              }
            }

            let fillColor = "#1e293b";
            let strokeColor = "#64748b";
            let radius = 17;

            if (isStart) {
              fillColor = "#10b981";
              strokeColor = "#ecfdf5";
              radius = 20;
            } else if (isEnd) {
              fillColor = "#ef4444";
              strokeColor = "#fff1f2";
              radius = 20;
            } else if (isInRoute) {
              fillColor = "#0284c7";
              strokeColor = "#38bdf8";
              radius = 18;
            } else if (isExplored) {
              if (explorationType === "dijkstra") {
                fillColor = "#451a03";
                strokeColor = "#f59e0b";
              } else if (explorationType === "astar") {
                fillColor = "#1e1b4b";
                strokeColor = "#818cf8";
              } else if (explorationType === "both") {
                fillColor = "#2e1065";
                strokeColor = "#c084fc";
              } else if (explorationType === "pruned") {
                fillColor = "#431407";
                strokeColor = "#f97316";
              } else if (explorationType === "single") {
                const isA = singleResult?.algorithm === "astar";
                fillColor = isA ? "#1e1b4b" : "#451a03";
                strokeColor = isA ? "#818cf8" : "#f59e0b";
              }
            } else if (isHovered) {
              fillColor = "#334155";
              strokeColor = "#94a3b8";
              radius = 18;
            }

            return (
              <g
                key={node.id}
                className="node-group"
                onClick={() => onNodeClick(node.id)}
                onMouseEnter={() => setHoveredNode(node.id)}
                onMouseLeave={() => setHoveredNode(null)}
              >
                {(isStart || isEnd) && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + 6}
                    fill="none"
                    stroke={isStart ? "#10b981" : "#ef4444"}
                    strokeWidth={2}
                    className="node-ring-pulse"
                  />
                )}

                {/* Explored Node Halo / Pruned Dash Ring */}
                {isExplored && (
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius + 4}
                    fill="none"
                    stroke={explorationType === "pruned" ? "#f97316" : strokeColor}
                    strokeWidth={explorationType === "pruned" ? 2 : 1.5}
                    strokeDasharray={explorationType === "pruned" ? "3,3" : undefined}
                    opacity={0.85}
                  />
                )}

                <circle
                  cx={node.x}
                  cy={node.y}
                  r={radius}
                  fill={fillColor}
                  stroke={strokeColor}
                  strokeWidth={2}
                  filter={isStart || isEnd ? "url(#glow-node)" : undefined}
                />

                <text
                  x={node.x}
                  y={node.y + 4.5}
                  textAnchor="middle"
                  fontSize={10.5}
                  fontWeight="800"
                  fill="#ffffff"
                  pointerEvents="none"
                >
                  {isStart ? "S" : isEnd ? "D" : node.id}
                </text>

                {(isStart || isEnd) && (
                  <text
                    x={node.x}
                    y={node.y - 25}
                    textAnchor="middle"
                    fontSize={9.5}
                    fontWeight="700"
                    fill={isStart ? "#34d399" : "#f87171"}
                  >
                    {isStart ? "START" : "DEST"}
                  </text>
                )}

                {/* Pruned indicator tag */}
                {isExplored && explorationType === "pruned" && (
                  <text
                    x={node.x}
                    y={node.y - 22}
                    textAnchor="middle"
                    fontSize={7.5}
                    fontWeight="700"
                    fill="#fb923c"
                  >
                    PRUNED
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
