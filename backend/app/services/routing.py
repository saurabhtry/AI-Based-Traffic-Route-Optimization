from typing import Any

from app.algorithms.astar import astar_search
from app.algorithms.dijkstra import dijkstra_search


def compute_single_route(network, start: int, end: int, algorithm: str) -> dict[str, Any]:
    algo = algorithm.lower().strip()
    if algo == "dijkstra":
        return dijkstra_search(network, start, end)
    elif algo in ("astar", "a*", "a_star"):
        return astar_search(network, start, end)
    else:
        raise ValueError(f"Unknown algorithm: {algorithm}. Choose 'dijkstra' or 'astar'.")

def compute_comparison(network, start: int, end: int) -> dict[str, Any]:
    res_dijkstra = dijkstra_search(network, start, end)
    res_astar = astar_search(network, start, end)
    return {
        "start": start,
        "end": end,
        "dijkstra": res_dijkstra,
        "astar": res_astar
    }
