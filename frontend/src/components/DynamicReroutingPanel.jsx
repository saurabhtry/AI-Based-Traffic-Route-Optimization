import React from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function DynamicReroutingPanel({ rerouteData, onDismiss }) {
  if (!rerouteData) return null;

  const {
    previousRoute,
    newRoute,
    previousTime,
    newTime,
    changedRoad,
    newDensity,
  } = rerouteData;

  const isRouteChanged = JSON.stringify(previousRoute) !== JSON.stringify(newRoute);
  const timeDiff = (newTime - previousTime).toFixed(2);

  return (
    <div className="reroute-card">
      <div className="reroute-badge">
        <AlertTriangle size={16} />
        <span>Student Improvement: Dynamic Traffic Rerouting</span>
      </div>

      <div className="reroute-content">
        <div className="reroute-event-info">
          Traffic on Road <strong>{changedRoad[0]} ➔ {changedRoad[1]}</strong> was updated to{" "}
          <span className="density-highlight">{Math.round(newDensity * 100)}%</span>.
          System triggered automatic cost recalculation and dynamic rerouting.
        </div>

        <div className="reroute-comparison-grid">
          <div className="reroute-col">
            <span className="reroute-col-title">Previous Route</span>
            <div className="route-tags-small">
              {previousRoute.map((n, i) => (
                <React.Fragment key={`prev-${n}-${i}`}>
                  <span className="chip-muted">{n}</span>
                  {i < previousRoute.length - 1 && <span className="arrow-small">➔</span>}
                </React.Fragment>
              ))}
            </div>
            <div className="reroute-time">Original Time: <strong>{previousTime} min</strong></div>
          </div>

          <div className="reroute-middle">
            <ArrowRight size={24} className="reroute-arrow-icon" />
            <div className={`status-pill ${isRouteChanged ? "changed" : "unchanged"}`}>
              Route Changed: {isRouteChanged ? "YES" : "NO (Still Optimal)"}
            </div>
          </div>

          <div className="reroute-col">
            <span className="reroute-col-title">New Recalculated Route</span>
            <div className="route-tags-small">
              {newRoute.map((n, i) => (
                <React.Fragment key={`new-${n}-${i}`}>
                  <span className="chip-active">{n}</span>
                  {i < newRoute.length - 1 && <span className="arrow-small">➔</span>}
                </React.Fragment>
              ))}
            </div>
            <div className="reroute-time">
              New Travel Time: <strong>{newTime} min</strong>{" "}
              <span className={Number(timeDiff) > 0 ? "text-danger" : "text-success"}>
                ({Number(timeDiff) > 0 ? `+${timeDiff}` : timeDiff} min)
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="reroute-footer">
        <button type="button" className="btn-dismiss" onClick={onDismiss}>
          Dismiss
        </button>
      </div>
    </div>
  );
}
