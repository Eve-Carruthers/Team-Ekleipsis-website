import React from "react";
const h = React.createElement;

const VIEW_MODES = [
  { id: "render", label: "RENDER" },
  { id: "mesh", label: "MESH" },
  { id: "blueprint", label: "BLUEPRINT" },
  { id: "vertex", label: "VERTEX" },
];

export default function Engineering({ hud, setHud, viewMode, setViewMode }) {
  return h(
    "section",
    { id: "engineering", className: "section" },
    // Left panel - View mode controls
    h(
      "div",
      { className: "eng-controls-panel eng-left-panel" },
      h(
        "div",
        { className: "panel-header" },
        h("span", { className: "section-num" }, "01"),
        h("h2", null, "ENGINEERING"),
        h("p", null, "Precision crafted. CFD optimized.")
      ),
      h(
        "div",
        { className: "view-toggle-vertical" },
        VIEW_MODES.map((mode) =>
          h(
            "button",
            {
              key: mode.id,
              className: `toggle-btn-lg ${viewMode === mode.id ? "active" : ""}`,
              onClick: () => setViewMode(mode.id),
            },
            mode.label
          )
        )
      ),
      h(
        "div",
        { className: "view-hint" },
        h("span", null, "Click hotspots on car to view component details")
      )
    ),
    // Right panel - Statistics only
    h(
      "div",
      { className: "eng-stats-panel eng-right-panel" },
      h(
        "div",
        { className: "panel-header center" },
        h("h3", null, "SPECIFICATIONS")
      ),
      h(
        "div",
        { className: "specs-grid" },
        h(
          "div",
          { className: "spec-item" },
          h("span", { className: "spec-label" }, "LENGTH"),
          h("span", { className: "spec-value" }, "2847", h("small", null, "mm"))
        ),
        h(
          "div",
          { className: "spec-item" },
          h("span", { className: "spec-label" }, "WIDTH"),
          h("span", { className: "spec-value" }, "1400", h("small", null, "mm"))
        ),
        h(
          "div",
          { className: "spec-item" },
          h("span", { className: "spec-label" }, "HEIGHT"),
          h("span", { className: "spec-value" }, "1150", h("small", null, "mm"))
        ),
        h(
          "div",
          { className: "spec-item" },
          h("span", { className: "spec-label" }, "WHEELBASE"),
          h("span", { className: "spec-value" }, "1600", h("small", null, "mm"))
        ),
        h(
          "div",
          { className: "spec-item" },
          h("span", { className: "spec-label" }, "WEIGHT"),
          h("span", { className: "spec-value" }, "178", h("small", null, "kg"))
        ),
        h(
          "div",
          { className: "spec-item" },
          h("span", { className: "spec-label" }, "POWER"),
          h("span", { className: "spec-value" }, "80", h("small", null, "kW"))
        )
      )
    ),
    hud.visible
      ? h(
          "div",
          {
            id: "component-hud",
            className: "component-hud",
            style: { left: hud.x, top: hud.y },
          },
          h("div", { className: "hud-connector" }),
          h(
            "div",
            { className: "hud-content" },
            h(
              "button",
              {
                className: "hud-close-btn",
                onClick: (e) => {
                  e.stopPropagation();
                  setHud && setHud({ visible: false, title: "", specs: [], desc: "", x: 0, y: 0 });
                },
              },
              "×"
            ),
            h("h4", null, hud.title),
            h(
              "div",
              { className: "hud-specs" },
              hud.specs.map((s, i) => h("span", { key: i, className: "spec-tag" }, s))
            ),
            h("p", null, hud.desc)
          )
        )
      : null
  );
}
