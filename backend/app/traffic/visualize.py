import os
import sys

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

import matplotlib.patches as mpatches
import matplotlib.pyplot as plt
from app.traffic.network import RoadNetwork


def get_traffic_color(density: float) -> str:
    if density <= 0.30:
        return "#10b981"
    elif density <= 0.70:
        return "#f59e0b"
    else:
        return "#ef4444"

def generate_network_plot(output_path: str = "network_preview.png"):
    net = RoadNetwork(seed=42)
    nodes = net.get_all_nodes()
    edges = net.get_all_edges()

    fig, ax = plt.subplots(figsize=(14, 7), dpi=150)
    fig.patch.set_facecolor("#0f172a")
    ax.set_facecolor("#1e293b")

    for edge in edges:
        u_node = net.get_node(edge["from_node"])
        v_node = net.get_node(edge["to_node"])
        color = get_traffic_color(edge["traffic_density"])
        lw = 2.0 if not edge.get("is_express") else 2.8
        linestyle = "-" if not edge.get("is_express") else "--"
        ax.plot([u_node["col"], v_node["col"]], 
                [4 - u_node["row"], 4 - v_node["row"]], 
                color=color, linewidth=lw, linestyle=linestyle, alpha=0.85, zorder=1)

    for node in nodes:
        col = node["col"]
        row_inverted = 4 - node["row"]
        ax.scatter(col, row_inverted, s=320, color="#38bdf8", edgecolors="#ffffff", linewidths=1.8, zorder=3)
        ax.text(col, row_inverted, str(node["id"]), color="#0f172a", fontsize=8.5, 
                fontweight="bold", ha="center", va="center", zorder=4)

    ax.set_title("50-Node Custom Road Network (10 x 5 Grid)", color="#f8fafc", fontsize=15, fontweight="bold", pad=15)
    ax.set_xlim(-0.8, 9.8)
    ax.set_ylim(-0.8, 4.8)
    ax.set_xticks(range(10))
    ax.set_yticks(range(5))
    ax.set_xticklabels([f"Col {c}" for c in range(10)], color="#94a3b8")
    ax.set_yticklabels([f"Row {4-r}" for r in range(5)], color="#94a3b8")
    ax.grid(True, linestyle=":", alpha=0.2, color="#94a3b8")

    green_patch = mpatches.Patch(color="#10b981", label="Low Traffic (0-30%)")
    amber_patch = mpatches.Patch(color="#f59e0b", label="Medium Traffic (31-70%)")
    red_patch = mpatches.Patch(color="#ef4444", label="High Traffic (71-100%)")
    node_marker = plt.Line2D([0], [0], marker='o', color='w', markerfacecolor='#38bdf8', markersize=9, label='Grid Node (0-49)')
    ax.legend(handles=[green_patch, amber_patch, red_patch, node_marker], 
              loc="upper right", facecolor="#0f172a", edgecolor="#334155", labelcolor="#e2e8f0")

    plt.tight_layout()
    os.makedirs(os.path.dirname(os.path.abspath(output_path)), exist_ok=True)
    plt.savefig(output_path, facecolor=fig.get_facecolor(), edgecolor="none")
    plt.close()

if __name__ == "__main__":
    generate_network_plot("network_preview.png")
