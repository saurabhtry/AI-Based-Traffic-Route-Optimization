import csv
import json
import os
import random
import sys

import matplotlib.pyplot as plt
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

from app.algorithms.astar import astar_search
from app.algorithms.dijkstra import dijkstra_search
from app.traffic.network import RoadNetwork


def run_suite():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    results_dir = os.path.join(base_dir, "results")
    graphs_dir = os.path.join(base_dir, "graphs")
    os.makedirs(results_dir, exist_ok=True)
    os.makedirs(graphs_dir, exist_ok=True)

    rng = random.Random(1337)
    conditions = ["low", "medium", "high", "random"]
    cases_per_condition = 30
    total_cases = len(conditions) * cases_per_condition

    test_cases = []
    for cond in conditions:
        for _ in range(cases_per_condition):
            s = rng.randint(0, 49)
            d = rng.randint(0, 49)
            while d == s:
                d = rng.randint(0, 49)
            test_cases.append({
                "condition": cond,
                "start": s,
                "end": d
            })

    raw_records = []
    
    for case_idx, case in enumerate(test_cases, 1):
        net = RoadNetwork(seed=42 + case_idx)
        cond = case["condition"]
        
        for edge_key in net.edges:
            if cond == "low":
                dens = rng.uniform(0.05, 0.30)
            elif cond == "medium":
                dens = rng.uniform(0.31, 0.70)
            elif cond == "high":
                dens = rng.uniform(0.71, 0.98)
            else:
                dens = rng.uniform(0.0, 1.0)
            net.update_traffic(edge_key[0], edge_key[1], round(dens, 3))

        s = case["start"]
        d = case["end"]

        res_d = dijkstra_search(net, s, d)
        res_a = astar_search(net, s, d)

        for res in [res_d, res_a]:
            raw_records.append({
                "case_id": case_idx,
                "condition": cond,
                "algorithm": res["algorithm"],
                "start": s,
                "destination": d,
                "route_length": len(res["route"]),
                "route_str": "->".join(map(str, res["route"])),
                "distance": res["distance"],
                "travel_time": res["travel_time"],
                "average_traffic": res["average_traffic"],
                "nodes_explored": res["nodes_explored"],
                "execution_time_ms": res["execution_time_ms"],
                "success": 1 if len(res["route"]) > 0 else 0
            })

    csv_path = os.path.join(results_dir, "experiments_raw.csv")
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(raw_records[0].keys()))
        writer.writeheader()
        writer.writerows(raw_records)

    d_records = [r for r in raw_records if r["algorithm"] == "dijkstra"]
    a_records = [r for r in raw_records if r["algorithm"] == "astar"]

    def compute_summary(records):
        n = len(records)
        return {
            "count": n,
            "avg_travel_time": round(sum(r["travel_time"] for r in records) / n, 2),
            "avg_distance": round(sum(r["distance"] for r in records) / n, 2),
            "avg_traffic": round(sum(r["average_traffic"] for r in records) / n, 2),
            "avg_nodes_explored": round(sum(r["nodes_explored"] for r in records) / n, 2),
            "avg_execution_time_ms": round(sum(r["execution_time_ms"] for r in records) / n, 4),
            "success_rate": round((sum(r["success"] for r in records) / n) * 100.0, 1)
        }

    summary = {
        "total_test_cases": total_cases,
        "conditions_tested": conditions,
        "dijkstra": compute_summary(d_records),
        "astar": compute_summary(a_records),
        "by_condition": {}
    }

    for cond in conditions:
        d_c = [r for r in d_records if r["condition"] == cond]
        a_c = [r for r in a_records if r["condition"] == cond]
        summary["by_condition"][cond] = {
            "dijkstra": compute_summary(d_c),
            "astar": compute_summary(a_c)
        }

    json_path = os.path.join(results_dir, "summary.json")
    with open(json_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2)

    plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")

    _, ax = plt.subplots(figsize=(8, 5), dpi=150)
    cond_labels = [c.capitalize() for c in conditions]
    d_nodes = [summary["by_condition"][c]["dijkstra"]["avg_nodes_explored"] for c in conditions]
    a_nodes = [summary["by_condition"][c]["astar"]["avg_nodes_explored"] for c in conditions]
    x = np.arange(len(cond_labels))
    width = 0.35
    ax.bar(x - width/2, d_nodes, width, label="Dijkstra", color="#3b82f6")
    ax.bar(x + width/2, a_nodes, width, label="A* Search", color="#10b981")
    ax.set_ylabel("Average Nodes Explored")
    ax.set_title("Dijkstra vs A* — Average Nodes Explored by Traffic Level")
    ax.set_xticks(x)
    ax.set_xticklabels(cond_labels)
    ax.legend()
    for i in range(len(cond_labels)):
        ax.annotate(f"{d_nodes[i]:.1f}", (x[i] - width/2, d_nodes[i] + 0.5), ha="center", fontsize=8)
        ax.annotate(f"{a_nodes[i]:.1f}", (x[i] + width/2, a_nodes[i] + 0.5), ha="center", fontsize=8)
    plt.tight_layout()
    plt.savefig(os.path.join(graphs_dir, "1_nodes_explored.png"))
    plt.close()

    _, ax = plt.subplots(figsize=(8, 5), dpi=150)
    d_times = [summary["by_condition"][c]["dijkstra"]["avg_execution_time_ms"] for c in conditions]
    a_times = [summary["by_condition"][c]["astar"]["avg_execution_time_ms"] for c in conditions]
    ax.bar(x - width/2, d_times, width, label="Dijkstra", color="#6366f1")
    ax.bar(x + width/2, a_times, width, label="A* Search", color="#ec4899")
    ax.set_ylabel("Execution Time (ms)")
    ax.set_title("Dijkstra vs A* — Execution Time (ms)")
    ax.set_xticks(x)
    ax.set_xticklabels(cond_labels)
    ax.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(graphs_dir, "2_execution_time.png"))
    plt.close()

    _, ax = plt.subplots(figsize=(8, 5), dpi=150)
    d_travel = [summary["by_condition"][c]["dijkstra"]["avg_travel_time"] for c in conditions]
    a_travel = [summary["by_condition"][c]["astar"]["avg_travel_time"] for c in conditions]
    ax.bar(x - width/2, d_travel, width, label="Dijkstra", color="#0284c7")
    ax.bar(x + width/2, a_travel, width, label="A* Search", color="#0d9488")
    ax.set_ylabel("Travel Time (minutes)")
    ax.set_title("Dijkstra vs A* — Optimal Travel Time (Proving Path Quality Parity)")
    ax.set_xticks(x)
    ax.set_xticklabels(cond_labels)
    ax.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(graphs_dir, "3_travel_time.png"))
    plt.close()

    _, ax = plt.subplots(figsize=(8, 5), dpi=150)
    d_dist = [summary["by_condition"][c]["dijkstra"]["avg_distance"] for c in conditions]
    a_dist = [summary["by_condition"][c]["astar"]["avg_distance"] for c in conditions]
    ax.bar(x - width/2, d_dist, width, label="Dijkstra", color="#8b5cf6")
    ax.bar(x + width/2, a_dist, width, label="A* Search", color="#f59e0b")
    ax.set_ylabel("Distance (km)")
    ax.set_title("Dijkstra vs A* — Route Distance (km)")
    ax.set_xticks(x)
    ax.set_xticklabels(cond_labels)
    ax.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(graphs_dir, "4_distance.png"))
    plt.close()

    _, ax = plt.subplots(figsize=(9, 5), dpi=150)
    ax.plot(cond_labels, d_nodes, marker="o", linewidth=2.2, color="#ef4444", label="Dijkstra (Exploration)")
    ax.plot(cond_labels, a_nodes, marker="s", linewidth=2.2, color="#10b981", label="A* (Exploration)")
    ax.set_ylabel("Nodes Explored")
    ax.set_title("Search Exploration Scaling Across Congestion Levels")
    ax.legend()
    plt.tight_layout()
    plt.savefig(os.path.join(graphs_dir, "5_traffic_levels_performance.png"))
    plt.close()

    print(f"Generated {total_cases} test cases across 4 traffic conditions.")
    print("Results and 5 comparison graphs saved to experiments/results/ and experiments/graphs/")

if __name__ == "__main__":
    run_suite()
