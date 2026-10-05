import random
from typing import Any

from .cost import calculate_edge_cost


class RoadNetwork:
    ROWS = 5
    COLS = 10
    TOTAL_NODES = ROWS * COLS

    def __init__(self, seed: int = 42):
        self.seed = seed
        self.nodes: dict[int, dict[str, Any]] = {}
        self.edges: dict[tuple[int, int], dict[str, Any]] = {}
        self.adj: dict[int, list[tuple[int, dict[str, Any]]]] = {}
        self._build_network()

    def _build_network(self) -> None:
        rng = random.Random(self.seed)
        
        for r in range(self.ROWS):
            for c in range(self.COLS):
                node_id = r * self.COLS + c
                self.nodes[node_id] = {
                    "id": node_id,
                    "row": r,
                    "col": c,
                    "x": float(c * 100 + 50),
                    "y": float(r * 100 + 50),
                    "label": f"Node {node_id}"
                }
                self.adj[node_id] = []

        def add_road(u: int, v: int, is_express: bool = False):
            if u == v:
                return
            edge_key = (min(u, v), max(u, v))
            if edge_key in self.edges:
                return

            if is_express:
                dist = round(rng.uniform(2.5, 4.5), 1)
                spd = round(rng.uniform(50.0, 70.0), 0)
                cap = rng.choice([1500, 1800, 2000])
            else:
                dist = round(rng.uniform(1.2, 3.8), 1)
                spd = round(rng.uniform(30.0, 50.0), 0)
                cap = rng.choice([600, 800, 1000, 1200, 1500])

            traffic_density = 0.20
            eff_time = calculate_edge_cost(dist, spd, traffic_density)

            edge_data = {
                "from_node": edge_key[0],
                "to_node": edge_key[1],
                "distance": dist,
                "speed": spd,
                "capacity": cap,
                "traffic_density": traffic_density,
                "effective_travel_time_min": eff_time,
                "is_express": is_express,
                "default_density": traffic_density
            }
            self.edges[edge_key] = edge_data

        for r in range(self.ROWS):
            for c in range(self.COLS - 1):
                u = r * self.COLS + c
                v = r * self.COLS + (c + 1)
                add_road(u, v)

        for r in range(self.ROWS - 1):
            for c in range(self.COLS):
                u = r * self.COLS + c
                v = (r + 1) * self.COLS + c
                add_road(u, v)

        # Comprehensive arterial diagonal expressways across all sectors
        diagonals = [
            # Forward diagonals (\)
            (1, 12), (3, 14), (5, 16), (7, 18),
            (10, 21), (12, 23), (14, 25), (16, 27), (18, 29),
            (21, 32), (23, 34), (25, 36), (27, 38),
            (30, 41), (32, 43), (34, 45), (36, 47), (38, 49),
            # Reverse / anti-diagonals (/)
            (11, 2), (13, 4), (15, 6), (17, 8),
            (20, 11), (22, 13), (24, 15), (26, 17), (28, 19),
            (31, 22), (33, 24), (35, 26), (37, 28),
            (40, 31), (42, 33), (44, 35), (46, 37), (48, 39)
        ]
        for u, v in diagonals:
            add_road(u, v, is_express=True)

        self._rebuild_adjacency()

    def _rebuild_adjacency(self) -> None:
        for u in self.nodes:
            self.adj[u] = []
            
        for (u, v), edge_data in self.edges.items():
            self.adj[u].append((v, edge_data))
            self.adj[v].append((u, edge_data))

    def update_traffic(self, u: int, v: int, traffic_density: float) -> dict[str, Any] | None:
        edge_key = (min(u, v), max(u, v))
        if edge_key not in self.edges:
            return None

        density = max(0.0, min(1.0, traffic_density))
        edge = self.edges[edge_key]
        edge["traffic_density"] = density
        edge["effective_travel_time_min"] = calculate_edge_cost(
            edge["distance"],
            edge["speed"],
            density
        )
        self._rebuild_adjacency()
        return edge

    def randomize_traffic(self, min_density: float = 0.05, max_density: float = 0.95, seed: int | None = None) -> list[dict[str, Any]]:
        rng = random.Random(seed) if seed is not None else random.Random()
        for edge in self.edges.values():
            density = round(rng.uniform(min_density, max_density), 2)
            edge["traffic_density"] = density
            edge["effective_travel_time_min"] = calculate_edge_cost(
                edge["distance"],
                edge["speed"],
                density
            )
        self._rebuild_adjacency()
        return list(self.edges.values())

    def reset_traffic(self) -> None:
        for edge in self.edges.values():
            edge["traffic_density"] = edge["default_density"]
            edge["effective_travel_time_min"] = calculate_edge_cost(
                edge["distance"],
                edge["speed"],
                edge["default_density"]
            )
        self._rebuild_adjacency()

    def get_node(self, node_id: int) -> dict[str, Any] | None:
        return self.nodes.get(node_id)

    def get_edge(self, u: int, v: int) -> dict[str, Any] | None:
        return self.edges.get((min(u, v), max(u, v)))

    def get_all_nodes(self) -> list[dict[str, Any]]:
        return list(self.nodes.values())

    def get_all_edges(self) -> list[dict[str, Any]]:
        return list(self.edges.values())

    def get_coordinates(self, node_id: int) -> tuple[float, float]:
        node = self.nodes[node_id]
        return (node["x"], node["y"])

    def get_grid_pos(self, node_id: int) -> tuple[int, int]:
        node = self.nodes[node_id]
        return (node["row"], node["col"])
