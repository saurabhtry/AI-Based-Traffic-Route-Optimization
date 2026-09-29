import os

from app.api.routes import router
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

app = FastAPI(
    title="AI-Based Traffic Route Optimization System",
    description="50-node custom road network route optimization comparing Dijkstra and A* search with dynamic traffic updates.",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/status")
def status():
    return {
        "project": "AI-Based Traffic Route Optimization Using Dijkstra and A* Search",
        "status": "online",
        "nodes": 50,
        "docs": "/docs"
    }

app.include_router(router)

dist_dir = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist")
)
if os.path.exists(dist_dir):
    app.mount("/", StaticFiles(directory=dist_dir, html=True), name="frontend")

