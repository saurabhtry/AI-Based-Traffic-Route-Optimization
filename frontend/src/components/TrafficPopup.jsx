import React, { useState } from "react";
import { X, Sliders, Navigation } from "lucide-react";

export default function TrafficPopup({ road, onClose, onApply }) {
  const [density, setDensity] = useState(Math.round((road?.traffic_density ?? 0.2) * 100));

  if (!road) return null;

  const handleApply = () => {
    onApply(road.from_node, road.to_node, density / 100);
  };

  const getDensityColor = (val) => {
    if (val <= 30) return "#10b981";
    if (val <= 70) return "#f59e0b";
    return "#ef4444";
  };

  const currentColor = getDensityColor(density);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="popup-card" onClick={(e) => e.stopPropagation()}>
        <div className="popup-header">
          <div className="popup-title">
            <Navigation className="popup-icon" size={20} />
            <span>Road {road.from_node} ➔ {road.to_node}</span>
          </div>
          <button className="btn-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="popup-body">
          <div className="road-metrics-grid">
            <div className="metric-box">
              <span className="metric-lbl">Distance</span>
              <span className="metric-val">{road.distance} km</span>
            </div>
            <div className="metric-box">
              <span className="metric-lbl">Speed Limit</span>
              <span className="metric-val">{road.speed} km/h</span>
            </div>
            <div className="metric-box">
              <span className="metric-lbl">Capacity</span>
              <span className="metric-val">{road.capacity} veh/h</span>
            </div>
            <div className="metric-box">
              <span className="metric-lbl">Base Travel Time</span>
              <span className="metric-val">
                {((road.distance / road.speed) * 60).toFixed(1)} min
              </span>
            </div>
          </div>

          <div className="density-control-section">
            <div className="density-header">
              <span className="density-title">
                <Sliders size={16} /> Traffic Density
              </span>
              <span className="density-badge" style={{ backgroundColor: `${currentColor}25`, color: currentColor, borderColor: currentColor }}>
                {density}% ({density <= 30 ? "Low" : density <= 70 ? "Moderate" : "Severe Congestion"})
              </span>
            </div>

            <div className="slider-wrapper">
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={density}
                onChange={(e) => setDensity(Number(e.target.value))}
                className="traffic-slider"
                style={{
                  background: `linear-gradient(to right, ${currentColor} 0%, ${currentColor} ${density}%, #334155 ${density}%, #334155 100%)`
                }}
              />
              <div className="slider-ticks">
                <span>0% Free</span>
                <span>25% Low</span>
                <span>50% Mid</span>
                <span>75% High</span>
                <span>100% Jam</span>
              </div>
            </div>

            <div className="quick-presets">
              <button type="button" className="preset-btn" onClick={() => setDensity(10)}>10% Free</button>
              <button type="button" className="preset-btn" onClick={() => setDensity(25)}>25% Normal</button>
              <button type="button" className="preset-btn" onClick={() => setDensity(60)}>60% Busy</button>
              <button type="button" className="preset-btn jam" onClick={() => setDensity(90)}>90% Heavy Jam</button>
            </div>
          </div>
        </div>

        <div className="popup-footer">
          <button type="button" className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-primary" onClick={handleApply}>
            Apply Traffic Update
          </button>
        </div>
      </div>
    </div>
  );
}
