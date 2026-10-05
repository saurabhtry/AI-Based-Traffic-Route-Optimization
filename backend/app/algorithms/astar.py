import heapq
import math
import time
from typing import Any


def heuristic(network, u: int, goal: int, min_step_time: float) -> float:
    pos_u = network.get_grid_pos(u)
    pos_g = network.get_grid_pos(goal)
    dx = abs(pos_u[1] - pos_g[1])
    dy = abs(pos_u[0] - pos_g[0])
    euclidean = math.sqrt(dx * dx + dy * dy)
    return euclidean * min_step_time

def astar_search(network, start_node: int, end_node: int) -> dict[str, Any]:
    start_time = time.perf_counter()
    
    if start_node == end_node:
        return {
            "algorithm": "astar",
            "route": [start_node],
            "distance": 0.0,
            "travel_time": 0.0,
            "average_traffic": 0.0,
            "nodes_explored": 0,
            "explored_nodes": [start_node],
            "execution_time_ms": round((time.perf_counter() - start_time) * 1000.0, 4)
        }

    min_step_time = float("inf")
    for edge in network.get_all_edges():
        u, v = edge["from_node"], edge["to_node"]
        pu = network.get_grid_pos(u)
        pv = network.get_grid_pos(v)
        step_dist = math.sqrt((pu[1] - pv[1]) ** 2 + (pu[0] - pv[0]) ** 2)
        if step_dist > 0:
            time_per_step = edge["effective_travel_time_min"] / step_dist
            min_step_time = min(min_step_time, time_per_step)
    
    if min_step_time == float("inf"):
        min_step_time = 0.5
    else:
        min_step_time = min_step_time * 0.95

    counter = 0
    pq: list[tuple[float, float, int, int]] = []
    
    h_start = heuristic(network, start_node, end_node, min_step_time)
    heapq.heappush(pq, (h_start, 0.0, counter, start_node))
    
    g_scores: dict[int, float] = {start_node: 0.0}
    parents: dict[int, int | None] = {start_node: None}
    visited = set()
    explored_nodes: list[int] = []
    nodes_explored = 0

    while pq:
        _, g_val, _, u = heapq.heappop(pq)
        
        if u in visited:
            continue
        visited.add(u)
        explored_nodes.append(u)
        nodes_explored += 1

        if u == end_node:
            break

        for v, edge in network.adj[u]:
            tentative_g = g_val + edge["effective_travel_time_min"]

            if tentative_g < g_scores.get(v, float("inf")):
                g_scores[v] = tentative_g
                parents[v] = u
                h_val = heuristic(network, v, end_node, min_step_time)
                f_score = tentative_g + h_val
                counter += 1
                heapq.heappush(pq, (f_score, tentative_g, counter, v))

    exec_time_ms = round((time.perf_counter() - start_time) * 1000.0, 4)

    if end_node not in g_scores:
        return {
            "algorithm": "astar",
            "route": [],
            "distance": 0.0,
            "travel_time": 0.0,
            "average_traffic": 0.0,
            "nodes_explored": nodes_explored,
            "explored_nodes": explored_nodes,
            "execution_time_ms": exec_time_ms
        }

    curr = end_node
    route: list[int] = []
    while curr is not None:
        route.append(curr)
        curr = parents[curr]
    route.reverse()

    total_dist = 0.0
    total_time = 0.0
    densities: list[float] = []

    for i in range(len(route) - 1):
        edge = network.get_edge(route[i], route[i+1])
        if edge:
            total_dist += edge["distance"]
            total_time += edge["effective_travel_time_min"]
            densities.append(edge["traffic_density"])

    avg_traffic = round((sum(densities) / len(densities)) * 100.0, 2) if densities else 0.0

    return {
        "algorithm": "astar",
        "route": route,
        "distance": round(total_dist, 2),
        "travel_time": round(total_time, 2),
        "average_traffic": avg_traffic,
        "nodes_explored": nodes_explored,
        "explored_nodes": explored_nodes,
        "execution_time_ms": exec_time_ms
    }
