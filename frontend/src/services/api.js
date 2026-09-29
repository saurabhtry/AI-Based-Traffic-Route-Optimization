const API_BASE = window.location.port === "8000" ? "/api" : "http://localhost:8000/api";

export async function fetchNetwork() {
  const res = await fetch(`${API_BASE}/network`);
  if (!res.ok) throw new Error("Failed to load road network from backend.");
  return await res.json();
}

export async function calculateRoute(start, end, algorithm = "astar") {
  const res = await fetch(`${API_BASE}/route`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ start, end, algorithm }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to calculate route.");
  }
  return await res.json();
}

export async function compareRoutes(start, end) {
  const res = await fetch(`${API_BASE}/compare`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ start, end }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to compare algorithms.");
  }
  return await res.json();
}

export async function updateTraffic(fromNode, toNode, trafficDensity) {
  const res = await fetch(`${API_BASE}/update-traffic`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      from_node: fromNode,
      to_node: toNode,
      traffic_density: trafficDensity,
    }),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Failed to update road traffic density.");
  }
  return await res.json();
}

export async function resetNetwork() {
  const res = await fetch(`${API_BASE}/reset`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to reset traffic network.");
  return await res.json();
}

export async function randomizeTraffic() {
  const res = await fetch(`${API_BASE}/randomize-traffic`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to randomize network traffic.");
  return await res.json();
}

export async function fetchExperiments() {
  const res = await fetch(`${API_BASE}/experiments`);
  if (!res.ok) throw new Error("Failed to load experiment data.");
  return await res.json();
}
