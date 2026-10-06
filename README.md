# AI-Based Traffic Route Optimization Using Dijkstra and A* Search

A college AI project demonstrating graph search route optimization, dynamic congestion rerouting, and empirical performance comparison on a custom 50-node road network.

---

## 1. Project Overview

This project implements an interactive full-stack traffic routing application designed to compare two fundamental graph algorithms:

1. **Dijkstra's Algorithm** (Uniform-Cost Search)
2. **A* Search** (Informed Heuristic Search)

### Student-Designed Improvement

- **Dynamic Traffic Rerouting**: The system dynamically detects real-time congestion changes along active routes, recalculates affected edge weights, determines new optimal paths, and displays whether the route changed along with delta travel times.

---

## 2. Road Network Architecture

The road network consists of exactly **50 nodes** arranged in a 10 × 5 Cartesian grid:

```text
Row 0:   0 ─── 1 ─── 2 ─── 3 ─── 4 ─── 5 ─── 6 ─── 7 ─── 8 ─── 9
         │     │     │     │     │     │     │     │     │     │
Row 1:  10 ── 11 ── 12 ── 13 ── 14 ── 15 ── 16 ── 17 ── 18 ── 19
         │     │     │     │     │     │     │     │     │     │
Row 2:  20 ── 21 ── 22 ── 23 ── 24 ── 25 ── 26 ── 27 ── 28 ── 29
         │     │     │     │     │     │     │     │     │     │
Row 3:  30 ── 31 ── 32 ── 33 ── 34 ── 35 ── 36 ── 37 ── 38 ── 39
         │     │     │     │     │     │     │     │     │     │
Row 4:  40 ── 41 ── 42 ── 43 ── 44 ── 45 ── 46 ── 47 ── 48 ── 49
```

- **Coordinates**: Each node has coordinates x = col × 100 + 50, y = row × 100 + 50.
- **Edges**: Bidirectional road connections between adjacent grid nodes plus 6 arterial expressway bypasses.
- **Road Attributes**:
  - Distance: **1.0 km - 5.0 km**
  - Speed Limit: **30 km/h - 70 km/h**
  - Road Capacity: **500 - 2000 veh/h**
  - Default Traffic Density: **20% (0.20)**

---

## 3. Traffic Cost Model

```text
base_travel_time = (distance / speed) * 60  [in minutes]

traffic_factor = 1.0 + traffic_density      [where density is 0.0 to 1.0]

effective_travel_time = base_travel_time * traffic_factor
```

---

## 4. Algorithms Implementation

Both algorithms are implemented from scratch in pure Python without third-party pathfinding libraries.

### Dijkstra's Algorithm

- Min-priority queue using `heapq`
- Track accumulated cost: g(n)
- Dynamic predecessor map for route reconstruction
- Tracks total nodes explored and execution runtime in milliseconds

### A* Search

- Evaluation function: f(n) = g(n) + h(n)
- g(n): Accumulated travel time in minutes
- h(n): Admissible heuristic based on Euclidean spatial grid distance scaled by the network's fastest travel time per grid unit:

```text
h(n) = √((Δx)² + (Δy)²) × min( time(e) / grid_dist(e) )
```

- Guarantees h(n) ≤ h*(n) (admissibility), ensuring optimal path discovery with reduced node expansion.

---

## 5. Quantitative Experimental Results (120 Controlled Scenarios)

Experiments were executed across 120 test cases evaluating Low (0-30%), Medium (31-70%), High (71-100%), and Random congestion distributions.

### Overall Benchmark Summary

| Performance Metric | Dijkstra's Algorithm | A* Search (Guided) | Academic Finding |
|---|---:|---:|---|
| **Average Travel Time** | **23.32 min** | **23.32 min** | **Identical Optimal Cost (100% Quality Parity)** |
| **Average Route Distance** | **11.24 km** | **11.24 km** | **Identical Optimal Distance** |
| **Average Congestion** | **49.46%** | **49.46%** | **Identical Congestion Level** |
| **Average Nodes Explored** | **27.21 nodes** | **18.58 nodes** | **A* explores 31.7% fewer nodes** |
| **Average Execution Time** | **0.0622 ms** | **0.1371 ms** | **Sub-millisecond in-memory search** |
| **Success Rate** | **100.0%** | **100.0%** | **All destinations discovered** |

### Breakdown by Traffic Level (Nodes Explored)

| Traffic Level | Dijkstra Explored | A* Explored | Exploration Reduction |
|---|---:|---:|---:|
| **Low (0-30%)** | 24.50 nodes | 15.77 nodes | -35.6% |
| **Medium (31-70%)** | 29.37 nodes | 20.27 nodes | -31.0% |
| **High (71-100%)** | 27.50 nodes | 18.57 nodes | -32.5% |
| **Random (0-100%)** | 27.47 nodes | 19.73 nodes | -28.2% |

### Generated Comparison Charts

1. `experiments/graphs/1_nodes_explored.png`
2. `experiments/graphs/2_execution_time.png`
3. `experiments/graphs/3_travel_time.png`
4. `experiments/graphs/4_distance.png`
5. `experiments/graphs/5_traffic_levels_performance.png`

---

## 6. How to Run the Project

### Prerequisites

- Python 3.10+
- Node.js 18+ and npm

### Step 1: Start Backend (FastAPI)

```bash
cd backend
python -m uvicorn app.main:app --reload --port 8000
```

API Documentation will be live at:

`http://localhost:8000/docs`

### Step 2: Open Interactive Application

Because the production React bundle is built into `frontend/dist`, opening:

`http://localhost:8000`

serves the complete application directly.

To run the Vite development server independently:

```bash
cd frontend
npm run dev
```

Open:

`http://localhost:5173`

### Step 3: Run Quantitative Experiments

```bash
python experiments/run_experiments.py
```

### Step 4: Run Test Suite

```bash
cd backend
python -m pytest tests/ -v
```

---