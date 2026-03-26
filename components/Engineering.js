import React from "react";

const h = React.createElement;

const VIEW_MODES = [
  { id: "render", label: "RENDER" },
  { id: "mesh", label: "MESH" },
  { id: "blueprint", label: "BLUEPRINT" },
  { id: "vertex", label: "VERTEX" },
];

const CAR_SPECS = [
  { label: "MASS", value: "~50g" },
  { label: "LENGTH", value: "207mm" },
  { label: "Cd", value: "0.05" },
  { label: "TRACK", value: "30m" },
  { label: "REACTION", value: "<20ms" },
];

export default function Engineering({
  hud, setHud, viewMode, setViewMode, isolatedPart, setIsolatedPart,
}) {
  const showIsolation = !!(isolatedPart && hud && hud.visible);
  const isTouch = window.matchMedia("(pointer: coarse)").matches;

  const closeIsolation = () => {
    if (setIsolatedPart) setIsolatedPart(null);
    if (setHud) setHud({ visible: false, title: "", specs: [], desc: "", x: 0, y: 0 });
  };

  return h(
    "section",
    { id: "engineering", className: "section" },
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
        h("span", null, "Click hotspots on car to isolate & inspect parts")
      )
    ),

    showIsolation
      ? h(
          "div",
          {
            className: "eng-right-panel isolation-hud",
            onClick: closeIsolation,
          },
          h("div", { className: "scan-line" }),
          h("h3", { className: "isolation-title" }, hud.title || isolatedPart.replace(/_/g, " ").toUpperCase()),
          h(
            "div",
            { className: "isolation-divider" },
            h("span", { className: "divider-diamond" }),
            h("span", { className: "divider-line" }),
            h("span", { className: "divider-diamond" })
          ),
          h(
            "div",
            { className: "isolation-status" },
            h("span", { className: "status-dot" }),
            h("span", null, "DIAGNOSTIC ACTIVE")
          ),
          h(
            "div",
            { className: "isolation-specs" },
            (hud.specs || []).map((s, i) =>
              h(
                "div",
                {
                  key: i,
                  className: "isolation-spec-item",
                  style: { animationDelay: `${0.15 + i * 0.12}s` },
                },
                h("span", { className: "iso-spec-index" }, `0${i + 1}`),
                h("span", { className: "iso-spec-text" }, s)
              )
            )
          ),
          hud.desc
            ? h(
                "p",
                {
                  className: "isolation-desc",
                  style: { animationDelay: `${0.15 + (hud.specs || []).length * 0.12 + 0.1}s` },
                },
                hud.desc
              )
            : null,
          h(
            "div",
            { className: "isolation-close-hint" },
            h("span", null, isTouch ? "TAP TO CLOSE" : "CLICK TO CLOSE")
          )
        )
      : null,

    !showIsolation && hud && hud.visible
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
                  if (setIsolatedPart) setIsolatedPart(null);
                  if (setHud) setHud({ visible: false, title: "", specs: [], desc: "", x: 0, y: 0 });
                },
              },
              "\u00d7"
            ),
            h("h4", null, hud.title),
            h(
              "div",
              { className: "hud-specs" },
              (hud.specs || []).map((s, i) => h("span", { key: i, className: "spec-tag" }, s))
            ),
            h("p", null, hud.desc)
          )
        )
      : null,

    h(
      "div",
      { className: "specs-bar specs-bar--engineering-top" },
      CAR_SPECS.map((s, i) =>
        h(
          React.Fragment,
          { key: s.label },
          i > 0 ? h("span", { className: "specs-bar-sep" }, "|") : null,
          h(
            "span",
            { className: "specs-bar-item" },
            h("span", { className: "specs-bar-label" }, `${s.label}: `),
            h("span", { className: "specs-bar-value" }, s.value)
          )
        )
      )
    )
  );
}
