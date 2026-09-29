import React, { useState } from "react";

export default function TrafficGraph({
  nodes,
  edges,
  startNode,
  endNode,
  activeRoute,
  onNodeClick,
  onRoadClick,
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

  return (
    <div className="graph-container">
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
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}
