def calculate_edge_cost(distance_km: float, speed_kmh: float, traffic_density: float) -> float:
    speed = max(1.0, speed_kmh)
    density = max(0.0, min(1.0, traffic_density))
    base_time_min = (distance_km / speed) * 60.0
    traffic_factor = 1.0 + density
    return round(base_time_min * traffic_factor, 4)

