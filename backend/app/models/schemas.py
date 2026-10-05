from pydantic import BaseModel, Field


class NodeModel(BaseModel):
    id: int
    x: float
    y: float
    label: str

class EdgeModel(BaseModel):
    from_node: int
    to_node: int
    distance: float
    speed: float
    capacity: int
    traffic_density: float = 0.20
    effective_travel_time_min: float
    is_express: bool | None = False

class NetworkResponse(BaseModel):
    total_nodes: int
    total_edges: int
    nodes: list[NodeModel]
    edges: list[EdgeModel]

class TrafficUpdateRequest(BaseModel):
    from_node: int
    to_node: int
    traffic_density: float = Field(..., ge=0.0, le=1.0)

class RouteRequest(BaseModel):
    start: int
    end: int
    algorithm: str = "astar"

class CompareRequest(BaseModel):
    start: int
    end: int

class RouteResult(BaseModel):
    algorithm: str
    route: list[int]
    distance: float
    travel_time: float
    average_traffic: float
    nodes_explored: int
    execution_time_ms: float

class CompareResult(BaseModel):
    start: int
    end: int
    dijkstra: RouteResult
    astar: RouteResult

