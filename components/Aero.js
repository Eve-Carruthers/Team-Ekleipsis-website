import React from "react";
const h = React.createElement;

export default function Aero({ preset, applyPreset, downforce, drag, eff, lam, presets, aeroRotation, setAeroRotation }) {
  const rotationDeg = ((aeroRotation || 0) * 180 / Math.PI).toFixed(0);

  return h(
    "section",
    { id: "aero", className: "section aero-section" },
    // Left panel - Controls and presets
    h(
      "div",
      { className: "aero-controls-panel aero-left-panel" },
      h(
        "div",
        { className: "panel-header" },
        h("span", { className: "section-num" }, "02"),
        h("h2", null, "AERO"),
        h("p", null, "Wind tunnel test")
      ),
      h(
        "div",
        { className: "preset-section" },
        h("h4", { className: "preset-title" }, "WIND INTENSITY"),
        h(
          "div",
          { className: "preset-grid-aero" },
          ...Object.entries(presets).map(([k, v]) =>
            h(
              "button",
              {
                key: k,
                className: `preset-btn ${preset === k ? "active" : ""} ${k === "extreme" ? "extreme" : ""}`,
                onClick: () => applyPreset(k)
              },
              v.label
            )
          )
        )
      ),
      h(
        "div",
        { className: "rotation-control" },
        h("h4", { className: "preset-title" }, "ORBIT VIEW"),
        h("div", { className: "rotation-slider-wrap" },
          h("span", { className: "rotation-value" }, `${Math.round(((aeroRotation || 0) / (Math.PI * 2)) * 360)}°`),
          h("input", {
            type: "range",
            min: 0,
            max: Math.PI * 2,
            step: 0.02,
            value: aeroRotation || 0,
            onChange: (e) => setAeroRotation && setAeroRotation(parseFloat(e.target.value))
          })
        ),
        h("div", { className: "rotation-hint" }, "Orbit camera around the tunnel")
      ),
      h(
        "div",
        { className: "aero-legend" },
        h("div", { className: "legend-item" }, h("span", { className: "dot slow" }), "Cool"),
        h("div", { className: "legend-item" }, h("span", { className: "dot med" }), "Flow"),
        h("div", { className: "legend-item" }, h("span", { className: "dot fast" }), "Heat")
      )
    ),
    // Bottom panel - Statistics (below the car)
    h(
      "div",
      { className: "aero-stats-panel aero-bottom-panel" },
      h(
        "div",
        { className: "aero-data-horizontal" },
        h(
          "div",
          { className: "data-item-h" },
          h("span", { className: "data-label" }, "DOWNFORCE"),
          h("span", { className: "data-value" }, `${downforce}`, h("small", null, "N"))
        ),
        h(
          "div",
          { className: "data-item-h" },
          h("span", { className: "data-label" }, "DRAG"),
          h("span", { className: "data-value" }, drag.toFixed(2))
        ),
        h(
          "div",
          { className: "data-item-h" },
          h("span", { className: "data-label" }, "EFF"),
          h("span", { className: "data-value" }, `${eff}`, h("small", null, "%"))
        ),
        h(
          "div",
          { className: "data-item-h" },
          h("span", { className: "data-label" }, "LAMINAR"),
          h("span", { className: "data-value" }, `${lam}`, h("small", null, "%"))
        )
      )
    )
  );
}
