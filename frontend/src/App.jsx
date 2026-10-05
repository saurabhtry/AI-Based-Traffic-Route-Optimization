import React, { useState, useEffect } from "react";
import TrafficGraph from "./components/TrafficGraph";
import TrafficPopup from "./components/TrafficPopup";
import ControlPanel from "./components/ControlPanel";
import ResultsPanel from "./components/ResultsPanel";
import DynamicReroutingPanel from "./components/DynamicReroutingPanel";
import ExperimentsModal from "./components/ExperimentsModal";
import {
  fetchNetwork,
  calculateRoute,
  compareRoutes,
  updateTraffic,
  resetNetwork,
  randomizeTraffic,
} from "./services/api";
import { Compass, Info, AlertCircle } from "lucide-react";
import "./styles.css";

export default function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [startNode, setStartNode] = useState(null);
  const [endNode, setEndNode] = useState(null);
  const [algorithm, setAlgorithm] = useState("astar");
  const [activeRoute, setActiveRoute] = useState(null);
  const [singleResult, setSingleResult] = useState(null);
  const [compareResult, setCompareResult] = useState(null);
  const [exploredOverlay, setExploredOverlay] = useState("both");
  const [selectedRoad, setSelectedRoad] = useState(null);
  const [rerouteData, setRerouteData] = useState(null);
  const [showExperiments, setShowExperiments] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadNetworkData = async () => {
    try {
      const data = await fetchNetwork();
      setNodes(data.nodes);
      setEdges(data.edges);
    } catch {
      setErrorMsg("Failed to connect to backend at http://localhost:8000. Please ensure FastAPI server is running.");
    }
  };

  useEffect(() => {
    let ignore = false;
    fetchNetwork()
      .then((data) => {
        if (!ignore) {
          setNodes(data.nodes);
          setEdges(data.edges);
        }
      })
      .catch(() => {
        if (!ignore) {
          setErrorMsg("Failed to connect to backend at http://localhost:8000. Please ensure FastAPI server is running.");
        }
      });
    return () => {
      ignore = true;
    };
  }, []);

  const handleNodeClick = (nodeId) => {
    setErrorMsg("");
    if (startNode === null) {
      setStartNode(nodeId);
      setActiveRoute(null);
      setSingleResult(null);
      setCompareResult(null);
      setRerouteData(null);
    } else if (endNode === null) {
      if (nodeId === startNode) {
        setErrorMsg("Destination node cannot be the same as Start node.");
        return;
      }
      setEndNode(nodeId);
      executeRoute(startNode, nodeId, algorithm);
    } else {
      if (nodeId === startNode) {
        setStartNode(null);
        setEndNode(null);
        setActiveRoute(null);
        setSingleResult(null);
        setCompareResult(null);
        setRerouteData(null);
      } else {
        setEndNode(nodeId);
        executeRoute(startNode, nodeId, algorithm);
      }
    }
  };

  const handleRoadClick = (road) => {
    setSelectedRoad(road);
  };

  const executeRoute = async (start, end, algo) => {
    if (start === null || end === null) return;
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await calculateRoute(start, end, algo);
      setSingleResult(res);
      setActiveRoute(res.route);
      setCompareResult(null);
      setExploredOverlay("single");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCalculateRoute = () => {
    if (startNode === null || endNode === null) {
      setErrorMsg("Please select both a Start Node and a Destination Node.");
      return;
    }
    executeRoute(startNode, endNode, algorithm);
  };

  const handleCompare = async () => {
    if (startNode === null || endNode === null) {
      setErrorMsg("Please select both a Start Node and a Destination Node.");
      return;
    }
    setLoading(true);
    setErrorMsg("");
    try {
      const res = await compareRoutes(startNode, endNode);
      setCompareResult(res);
      setSingleResult(null);
      setActiveRoute(res.astar.route);
      setExploredOverlay("both");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTraffic = async (fromNode, toNode, density) => {
    try {
      await updateTraffic(fromNode, toNode, density);
      setSelectedRoad(null);
      await loadNetworkData();

      if (startNode !== null && endNode !== null && activeRoute && activeRoute.length > 0) {
        const prevRoute = [...activeRoute];
        const prevTime = singleResult ? singleResult.travel_time : compareResult?.astar?.travel_time || 0;

        const newRes = await calculateRoute(startNode, endNode, algorithm);
        setSingleResult(newRes);
        setActiveRoute(newRes.route);
        if (compareResult) {
          const compRes = await compareRoutes(startNode, endNode);
          setCompareResult(compRes);
        }

        setRerouteData({
          previousRoute: prevRoute,
          newRoute: newRes.route,
          previousTime: prevTime,
          newTime: newRes.travel_time,
          changedRoad: [fromNode, toNode],
          newDensity: density,
        });
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleClearSelection = () => {
    setStartNode(null);
    setEndNode(null);
    setActiveRoute(null);
    setSingleResult(null);
    setCompareResult(null);
    setRerouteData(null);
    setErrorMsg("");
  };

  const handleResetTraffic = async () => {
    try {
      await resetNetwork();
      await loadNetworkData();
      setRerouteData(null);
      if (startNode !== null && endNode !== null) {
        if (compareResult) {
          handleCompare();
        } else {
          executeRoute(startNode, endNode, algorithm);
        }
      }
    } catch (err) {
      setErrorMsg(err.message);
    }
  };

  const handleRandomizeTraffic = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await randomizeTraffic();
      setNodes(data.nodes);
      setEdges(data.edges);
      setRerouteData(null);
      if (startNode !== null && endNode !== null) {
        if (compareResult) {
          const compRes = await compareRoutes(startNode, endNode);
          setCompareResult(compRes);
          setActiveRoute(compRes.astar.route);
        } else {
          const res = await calculateRoute(startNode, endNode, algorithm);
          setSingleResult(res);
          setActiveRoute(res.route);
        }
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-brand">
          <Compass className="app-logo" size={28} />
          <div>
            <h1 className="app-title">AI-Based Traffic Route Optimization</h1>
            <p className="app-subtitle">
              Comparing Dijkstra & A* Search with Dynamic Congestion Rerouting on a 50-Node Road Network
            </p>
          </div>
        </div>

        <div className="header-meta">
          <div className="network-stat">
            <span className="stat-label">Network:</span>
            <span className="stat-val">10 × 5 Grid (50 Nodes)</span>
          </div>
          <div className="legend-items">
            <span className="legend-pill green">0–30% Low</span>
            <span className="legend-pill orange">31–70% Mid</span>
            <span className="legend-pill red">71–100% Jam</span>
            <span className="legend-pill blue">Optimal Path</span>
          </div>
        </div>
      </header>

      <div className="instruction-banner">
        <Info size={18} className="banner-icon" />
        <span>
          Click a node to select <strong>Start (S)</strong> ➔ click another node to select{" "}
          <strong>Destination (D)</strong> ➔ click any road edge to adjust its <strong>traffic density slider</strong>.
        </span>
      </div>

      {errorMsg && (
        <div className="error-banner">
          <AlertCircle size={18} />
          <span>{errorMsg}</span>
        </div>
      )}

      <main className="app-main">
        <div className="grid-visualization-card">
          <TrafficGraph
            nodes={nodes}
            edges={edges}
            startNode={startNode}
            endNode={endNode}
            activeRoute={activeRoute}
            onNodeClick={handleNodeClick}
            onRoadClick={handleRoadClick}
            singleResult={singleResult}
            compareResult={compareResult}
            exploredOverlay={exploredOverlay}
            setExploredOverlay={setExploredOverlay}
          />
        </div>

        <ControlPanel
          startNode={startNode}
          endNode={endNode}
          algorithm={algorithm}
          setAlgorithm={setAlgorithm}
          onCalculateRoute={handleCalculateRoute}
          onCompare={handleCompare}
          onClearSelection={handleClearSelection}
          onResetTraffic={handleResetTraffic}
          onRandomizeTraffic={handleRandomizeTraffic}
          onOpenExperiments={() => setShowExperiments(true)}
          loading={loading}
        />

        {rerouteData && (
          <DynamicReroutingPanel
            rerouteData={rerouteData}
            onDismiss={() => setRerouteData(null)}
          />
        )}

        <ResultsPanel
          singleResult={singleResult}
          compareResult={compareResult}
        />
      </main>

      {selectedRoad && (
        <TrafficPopup
          road={selectedRoad}
          onClose={() => setSelectedRoad(null)}
          onApply={handleApplyTraffic}
        />
      )}

      <ExperimentsModal
        isOpen={showExperiments}
        onClose={() => setShowExperiments(false)}
      />
    </div>
  );
}
