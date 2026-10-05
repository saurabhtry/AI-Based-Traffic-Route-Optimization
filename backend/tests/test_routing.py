import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.algorithms.astar import astar_search
from app.algorithms.dijkstra import dijkstra_search
from app.traffic.network import RoadNetwork


def test_identical_start_and_end():
    net = RoadNetwork()
    res_d = dijkstra_search(net, 10, 10)
    res_a = astar_search(net, 10, 10)
    assert res_d["route"] == [10]
    assert res_a["route"] == [10]
    assert res_d["travel_time"] == 0.0
    assert res_a["travel_time"] == 0.0

def test_optimal_cost_agreement():
    net = RoadNetwork()
    test_pairs = [(0, 49), (5, 42), (9, 40), (12, 38), (4, 45)]
    for start, end in test_pairs:
        res_d = dijkstra_search(net, start, end)
        res_a = astar_search(net, start, end)
        assert len(res_d["route"]) >= 2
        assert len(res_a["route"]) >= 2
        assert res_d["route"][0] == start and res_d["route"][-1] == end
        assert res_a["route"][0] == start and res_a["route"][-1] == end
        assert abs(res_d["travel_time"] - res_a["travel_time"]) < 1e-2

def test_astar_efficiency():
    net = RoadNetwork()
    res_d = dijkstra_search(net, 0, 49)
    res_a = astar_search(net, 0, 49)
    assert res_a["nodes_explored"] <= res_d["nodes_explored"]

def test_dynamic_rerouting_behavior():
    net = RoadNetwork()
    initial_res = dijkstra_search(net, 0, 49)
    initial_route = list(initial_res["route"])
    initial_time = initial_res["travel_time"]
    
    u, v = initial_route[0], initial_route[1]
    net.update_traffic(u, v, 1.0)
    
    new_res = dijkstra_search(net, 0, 49)
    new_route = new_res["route"]
    assert new_res["travel_time"] >= initial_time
    assert len(new_route) > 0
