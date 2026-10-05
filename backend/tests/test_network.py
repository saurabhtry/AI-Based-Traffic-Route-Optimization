import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.traffic.cost import calculate_edge_cost
from app.traffic.network import RoadNetwork


def test_exact_50_nodes():
    net = RoadNetwork()
    nodes = net.get_all_nodes()
    assert len(nodes) == 50
    node_ids = {n["id"] for n in nodes}
    assert node_ids == set(range(50))
    for node in nodes:
        node_id = node["id"]
        expected_row = node_id // 10
        expected_col = node_id % 10
        assert node["row"] == expected_row
        assert node["col"] == expected_col
        assert node["x"] == expected_col * 100 + 50
        assert node["y"] == expected_row * 100 + 50

def test_edges_properties():
    net = RoadNetwork()
    edges = net.get_all_edges()
    assert len(edges) > 50
    for edge in edges:
        u, v = edge["from_node"], edge["to_node"]
        assert 0 <= u < 50
        assert 0 <= v < 50
        assert u < v
        assert 1.0 <= edge["distance"] <= 5.5
        assert 30.0 <= edge["speed"] <= 70.0
        assert 500 <= edge["capacity"] <= 2000
        assert edge["traffic_density"] == 0.20
        assert edge["effective_travel_time_min"] > 0

def test_graph_connectivity():
    net = RoadNetwork()
    visited = set()
    queue = [0]
    visited.add(0)

    while queue:
        curr = queue.pop(0)
        for neighbor, _ in net.adj[curr]:
            if neighbor not in visited:
                visited.add(neighbor)
                queue.append(neighbor)

    assert len(visited) == 50

def test_traffic_update_and_cost():
    net = RoadNetwork()
    edge = net.get_edge(0, 1)
    assert edge is not None
    initial_time = edge["effective_travel_time_min"]
    updated = net.update_traffic(0, 1, 0.90)
    assert updated["traffic_density"] == 0.90
    assert updated["effective_travel_time_min"] > initial_time
    expected_cost = calculate_edge_cost(updated["distance"], updated["speed"], 0.90)
    assert abs(updated["effective_travel_time_min"] - expected_cost) < 1e-4
    net.reset_traffic()
    assert net.get_edge(0, 1)["traffic_density"] == 0.20
    assert abs(net.get_edge(0, 1)["effective_travel_time_min"] - initial_time) < 1e-4
