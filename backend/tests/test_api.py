import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app)

def test_api_status():
    response = client.get("/api/status")
    assert response.status_code == 200
    data = response.json()
    assert data["nodes"] == 50
    assert data["status"] == "online"

def test_api_network():
    response = client.get("/api/network")
    assert response.status_code == 200
    data = response.json()
    assert data["total_nodes"] == 50
    assert len(data["nodes"]) == 50
    assert len(data["edges"]) > 50
    assert data["nodes"][0]["id"] == 0
    assert data["nodes"][49]["id"] == 49

def test_api_route():
    response = client.post("/api/route", json={
        "start": 0,
        "end": 49,
        "algorithm": "astar"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["algorithm"] == "astar"
    assert len(data["route"]) >= 2
    assert data["travel_time"] > 0
    assert data["nodes_explored"] > 0

def test_api_compare():
    response = client.post("/api/compare", json={
        "start": 5,
        "end": 42
    })
    assert response.status_code == 200
    data = response.json()
    assert "dijkstra" in data
    assert "astar" in data
    assert abs(data["dijkstra"]["travel_time"] - data["astar"]["travel_time"]) < 1e-2

def test_api_update_traffic():
    response = client.post("/api/update-traffic", json={
        "from_node": 0,
        "to_node": 1,
        "traffic_density": 0.85
    })
    assert response.status_code == 200
    edge = response.json()
    assert edge["traffic_density"] == 0.85

    reset_res = client.post("/api/reset")
    assert reset_res.status_code == 200
    net_res = client.get("/api/network")
    edges = net_res.json()["edges"]
    e01 = next(e for e in edges if (e["from_node"] == 0 and e["to_node"] == 1) or (e["from_node"] == 1 and e["to_node"] == 0))
    assert e01["traffic_density"] == 0.20

def test_api_randomize_traffic():
    response = client.post("/api/randomize-traffic")
    assert response.status_code == 200
    data = response.json()
    assert data["total_nodes"] == 50
    assert len(data["edges"]) > 50
    densities = [e["traffic_density"] for e in data["edges"]]
    assert any(d != 0.20 for d in densities)
