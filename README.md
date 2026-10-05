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

The road network consists of exactly **50 nodes** arranged in a $10 \times 5$ Cartesian grid:

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

- **Coordinates**: Each node has coordinates $x = \text{col} \times 100 + 50$, $y = \text{row} \times 100 + 50$.
- **Edges**: Bidirectional road connections between adjacent grid nodes plus 6 arterial expressway bypasses.
- **Road Attributes**:
  - Distance: $1.0\text{ km} - 5.0\text{ km}$
  - Speed Limit: $30\text{ km/h} - 70\text{ km/h}$
  - Road Capacity: $500 - 2000\text{ veh/h}$
  - Default Traffic Density: $20\%$ ($0.20$)

---

## 3. Traffic Cost Model

$$
\text{base\_travel\_time}
=
\left(\frac{\text{distance}}{\text{speed}}\right)
\times 60
\quad (\text{minutes})
$$

$$
\text{traffic\_factor}
=
1.0 + \text{traffic\_density}
\quad
(\text{where } \text{traffic\_density} \in [0.0,1.0])
$$

$$
\text{effective\_travel\_time}
=
\text{base\_travel\_time}
\times
\text{traffic\_factor}
$$

---

## 4. Algorithms Implementation

Both algorithms are implemented from scratch in pure Python without third-party pathfinding libraries.

### Dijkstra's Algorithm

- Min-priority queue using `heapq`
- Track accumulated cost $g(n)$
- Dynamic predecessor map for route reconstruction
- Tracks total nodes explored and execution runtime in milliseconds

### A* Search

- Evaluation function: $f(n)=g(n)+h(n)$
- $g(n)$: Accumulated travel time in minutes
- $h(n)$: Admissible heuristic based on Euclidean spatial grid distance scaled by the network's fastest travel time per grid unit:

$$
h(n)
=
\sqrt{(\Delta x)^2 + (\Delta y)^2}
\times
\min_e
\left(
\frac{\text{time}(e)}{\text{grid\_dist}(e)}
\right)
$$

- Guarantees $h(n) \le h^*(n)$ (admissibility), ensuring optimal path discovery with reduced node expansion.

---

## 5. Quantitative Experimental Results (120 Controlled Scenarios)

Experiments were executed across 120 test cases evaluating Low ($0-30\%$), Medium ($31-70\%$), High ($71-100\%$), and Random congestion distributions.

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
| **Low ($0-30\%$)** | 24.50 nodes | 15.77 nodes | -35.6% |
| **Medium ($31-70\%$)** | 29.37 nodes | 20.27 nodes | -31.0% |
| **High ($71-100\%$)** | 27.50 nodes | 18.57 nodes | -32.5% |
| **Random ($0-100\%$)** | 27.47 nodes | 19.73 nodes | -28.2% |

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
npm.cmd run dev
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

## 7. Viva Voce Questions & Answers

### 1. What problem are you solving?

We are solving the AI-based road traffic route optimization problem: finding the fastest, congestion-aware route between any two junctions in a road network while adapting dynamically to changing traffic density.

### 2. Why use graph algorithms for traffic routing?

Road networks naturally model as graphs where intersections are nodes and roads are weighted edges. Graph search algorithms guarantee finding mathematically optimal paths.

### 3. What is Dijkstra's Algorithm?

Dijkstra's Algorithm is an uninformed graph search algorithm that explores nodes in increasing order of accumulated path cost $g(n)$ from the start node using a min-priority queue.

### 4. What is A* Search?

A* is an informed search algorithm that evaluates nodes using $f(n)=g(n)+h(n)$, combining the known cost $g(n)$ from the start with a heuristic estimate $h(n)$ to the goal.

### 5. What is the difference between Dijkstra and A*?

Dijkstra expands search radially in all directions (blind search). A* uses heuristic estimates to guide search toward the destination, pruning unpromising branches and exploring fewer nodes.

### 6. What is a heuristic?

A heuristic is an estimate of the remaining cost from the current state to the goal state.

### 7. What heuristic did you use?

We used Euclidean coordinate distance scaled by the network's maximum possible speed:

$$
h(n)
=
\text{distance}(n,\text{goal})
\times
\min_e
\left(
\frac{\text{cost}(e)}{\text{distance}(e)}
\right)
$$

### 8. Why can A* explore fewer nodes?

The heuristic $h(n)$ biases node priority toward the goal, so nodes leading away from the destination receive higher $f$-values and are pushed down the priority queue.

### 9. Can Dijkstra and A* return the same route?

Yes. When the heuristic is admissible ($h(n) \le h^*(n)$), A* is guaranteed to return the exact same optimal route cost as Dijkstra.

### 10. How is traffic represented?

Traffic density is represented as a percentage from $0\%$ (free-flow) to $100\%$ (severe congestion) for each road edge.

### 11. How does traffic density affect edge cost?

Effective travel time is multiplied by $(1.0 + \text{traffic\_density})$. A road with $100\%$ traffic takes twice as long to traverse as a road with $0\%$ traffic.

### 12. Why does the user manually enter traffic?

Manual control allows examiners and users to test congestion scenarios, simulate traffic jams on specific arteries, and witness dynamic rerouting in real time.

### 13. Why did you use 50 nodes?

A 50-node $10 \times 5$ grid is large enough to demonstrate realistic multi-path routing choices while remaining visually clean and easy to explain in a viva.

### 14. How did you compare the algorithms fairly?

Both algorithms were run on identical start/end pairs, identical graph topology, identical edge speeds, distances, and traffic densities.

### 15. What metrics did you measure?

1. Travel time (minutes)
2. Route distance (km)
3. Average traffic density (%)
4. Total nodes explored
5. Execution runtime (ms)
6. Success rate (%)

### 16. What is your student-designed improvement?

Dynamic Traffic Rerouting: Real-time detection of traffic updates along the active route that triggers automatic weight recalculation, path re-planning, and delta analysis.

### 17. How does dynamic rerouting work?

When an edge density changes, the backend recalculates `effective_travel_time_min`, rebuilds the adjacency list, executes the routing search, and returns comparison metrics showing whether the route changed.

### 18. What happens when traffic on the selected route increases?

The travel cost along that path increases. If an alternative bypass becomes faster, the search algorithm automatically diverts the path around the congested road.

### 19. What are the limitations of the project?

The project uses a static custom grid topology with in-memory state rather than real-world GPS road geometry or continuous time-dependent traffic forecasting.

### 20. How could this be extended to real-world traffic?

By integrating OpenStreetMap road networks, real-time sensor/GPS probes via MQTT or WebSockets, and predictive traffic models using Recurrent Neural Networks (LSTMs) or Graph Neural Networks (GNNs).
