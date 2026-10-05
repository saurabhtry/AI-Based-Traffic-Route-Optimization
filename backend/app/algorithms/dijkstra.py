import heapq
import time
from typing import Any


def dijkstra_search(network, start_node: int, end_node: int) -> dict[str, Any]:
    start_time = time.perf_counter()
    
    if start_node == end_node:
        return {
            "algorithm": "dijkstra",
            "route": [start_node],
            "distance": 0.0,
            "travel_time": 0.0,
            "average_traffic": 0.0,
            "nodes_explored": 0,
            "execution_time_ms": round((time.perf_counter() - start_time) * 1000.0, 4)
        }

    pq: list[tuple[float, int]] = []
    heapq.heappush(pq, (0.0, start_node))
    
    distances: dict[int, float] = {start_node: 0.0}
    parents: dict[int, int | None] = {start_node: None}
    visited = set()
    nodes_explored = 0

    while pq:
        curr_dist, u = heapq.heappop(pq)
        
        if u in visited:
            continue
        visited.add(u)
        nodes_explored += 1

        if u == end_node:
            break

        for v, edge in network.adj[u]:
            cost = edge["effective_travel_time_min"]
            new_dist = curr_dist + cost

            if new_dist < distances.get(v, float("inf")):
                distances[v] = new_dist
                parents[v] = u
                heapq.heappush(pq, (new_dist, v))

    exec_time_ms = round((time.perf_counter() - start_time) * 1000.0, 4)

    if end_node not in distances:
        return {
            "algorithm": "dijkstra",
            "route": [],
            "distance": 0.0,
            "travel_time": 0.0,
            "average_traffic": 0.0,
            "nodes_explored": nodes_explored,
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
        "algorithm": "dijkstra",
        "route": route,
        "distance": round(total_dist, 2),
        "travel_time": round(total_time, 2),
        "average_traffic": avg_traffic,
        "nodes_explored": nodes_explored,
        "execution_time_ms": exec_time_ms
    }
