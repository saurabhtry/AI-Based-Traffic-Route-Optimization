import json
import os

from app.models.schemas import (
    CompareRequest,
    CompareResult,
    EdgeModel,
    NetworkResponse,
    NodeModel,
    RouteRequest,
    RouteResult,
    TrafficUpdateRequest,
)
from app.services.routing import compute_comparison, compute_single_route
from app.traffic.network import RoadNetwork
from fastapi import APIRouter, HTTPException, status

router = APIRouter(prefix="/api", tags=["Traffic Network"])
network = RoadNetwork(seed=42)

@router.get("/network", response_model=NetworkResponse)
def get_network():
    nodes = [NodeModel(**n) for n in network.get_all_nodes()]
    edges = [EdgeModel(**e) for e in network.get_all_edges()]
    return NetworkResponse(
        total_nodes=len(nodes),
        total_edges=len(edges),
        nodes=nodes,
        edges=edges
    )

@router.post("/route", response_model=RouteResult)
def get_route(req: RouteRequest):
    if not (0 <= req.start < network.TOTAL_NODES and 0 <= req.end < network.TOTAL_NODES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Node IDs must be between 0 and {network.TOTAL_NODES - 1}."
        )
    try:
        result = compute_single_route(network, req.start, req.end, req.algorithm)
        return RouteResult(**result)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.post("/compare", response_model=CompareResult)
def compare_algorithms(req: CompareRequest):
    if not (0 <= req.start < network.TOTAL_NODES and 0 <= req.end < network.TOTAL_NODES):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Node IDs must be between 0 and {network.TOTAL_NODES - 1}."
        )
    result = compute_comparison(network, req.start, req.end)
    return CompareResult(**result)

@router.post("/update-traffic", response_model=EdgeModel)
def update_traffic(req: TrafficUpdateRequest):
    if req.from_node == req.to_node:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Start and end nodes of an edge cannot be identical."
        )
    edge = network.update_traffic(req.from_node, req.to_node, req.traffic_density)
    if not edge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Road between Node {req.from_node} and Node {req.to_node} does not exist."
        )
    return EdgeModel(**edge)

@router.post("/randomize-traffic", response_model=NetworkResponse)
def randomize_network_traffic():
    network.randomize_traffic()
    nodes = [NodeModel(**n) for n in network.get_all_nodes()]
    edges = [EdgeModel(**e) for e in network.get_all_edges()]
    return NetworkResponse(
        total_nodes=len(nodes),
        total_edges=len(edges),
        nodes=nodes,
        edges=edges
    )

@router.post("/reset", response_model=NetworkResponse)
def reset_network():
    network.reset_traffic()
    nodes = [NodeModel(**n) for n in network.get_all_nodes()]
    edges = [EdgeModel(**e) for e in network.get_all_edges()]
    return NetworkResponse(
        total_nodes=len(nodes),
        total_edges=len(edges),
        nodes=nodes,
        edges=edges
    )

@router.get("/experiments")
def get_experiments_summary():
    results_path = os.path.abspath(
        os.path.join(os.path.dirname(__file__), "..", "..", "..", "experiments", "results", "summary.json")
    )
    if os.path.exists(results_path):
        with open(results_path, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "status": "pending",
        "message": "Run experiments/run_experiments.py to populate quantitative benchmark data."
    }

