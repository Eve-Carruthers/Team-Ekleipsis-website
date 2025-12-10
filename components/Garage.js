import React from "react";
const h = React.createElement;

const PRESETS = [
  { name: "Eclipse", body: "#1a1a2e", accent: "#4a0080", wheel: "#0d0d0d" },
  { name: "Stealth", body: "#0a0a0a", accent: "#1a1a1a", wheel: "#050505" },
  { name: "Silver", body: "#8c8c8c", accent: "#555555", wheel: "#333333" },
  { name: "Racing", body: "#cc0000", accent: "#000000", wheel: "#1a1a1a" },
];

// Wheel rim design options with Ecleipsis branding
const WHEEL_DESIGNS = [
  { id: "standard", name: "Standard", desc: "Classic 5-spoke design" },
  { id: "ecleipsis", name: "Ecleipsis", desc: "Team branded center caps" },
  { id: "aero", name: "Aero", desc: "Closed disc for aerodynamics" },
  { id: "mesh", name: "Mesh", desc: "Lightweight mesh pattern" },
];

export default function Garage({
  bodyColor,
  setBodyColor,
  accentColor,
  setAccentColor,
  wheelColor,
  setWheelColor,
  wheelDesign,
  setWheelDesign,
}) {
  const applyPreset = (preset) => {
    setBodyColor(preset.body);
    setAccentColor(preset.accent);
    setWheelColor(preset.wheel);
  };

  return h(
    "section",
    { id: "garage", className: "section" },
    // Left panel - Color customization
    h(
      "div",
      { className: "garage-colors-panel garage-left-panel" },
      h(
        "div",
        { className: "panel-header" },
        h("span", { className: "section-num" }, "01B"),
        h("h2", null, "LIVERY"),
        h("p", null, "Customize your EK3 colors")
      ),
      h(
        "div",
        { className: "garage-color-controls" },
        // Body Color
        h(
          "div",
          { className: "color-control-row" },
          h("label", null, "BODY"),
          h("div", { className: "color-input-wrap" },
            h("input", {
              type: "color",
              value: bodyColor || "#555555",
              onChange: (e) => setBodyColor(e.target.value),
            }),
            h("span", { className: "color-hex" }, bodyColor)
          )
        ),
        // Accent Color
        h(
          "div",
          { className: "color-control-row" },
          h("label", null, "ACCENT"),
          h("div", { className: "color-input-wrap" },
            h("input", {
              type: "color",
              value: accentColor || "#222222",
              onChange: (e) => setAccentColor(e.target.value),
            }),
            h("span", { className: "color-hex" }, accentColor)
          )
        ),
        // Wheel Color
        h(
          "div",
          { className: "color-control-row" },
          h("label", null, "WHEELS"),
          h("div", { className: "color-input-wrap" },
            h("input", {
              type: "color",
              value: wheelColor || "#111111",
              onChange: (e) => setWheelColor(e.target.value),
            }),
            h("span", { className: "color-hex" }, wheelColor)
          )
        )
      ),
      h(
        "div",
        { className: "garage-footer" },
        h("span", null, "Changes apply in real-time")
      )
    ),
    // Right panel - Presets & Wheel designs
    h(
      "div",
      { className: "garage-presets-panel garage-right-panel" },
      h(
        "div",
        { className: "panel-header center" },
        h("h3", null, "QUICK PRESETS")
      ),
      h(
        "div",
        { className: "presets-grid-lg" },
        PRESETS.map((preset, i) =>
          h(
            "button",
            {
              key: i,
              className: "preset-card",
              onClick: () => applyPreset(preset),
              title: preset.name,
            },
            h("div", {
              className: "preset-preview",
              style: {
                background: `linear-gradient(135deg, ${preset.body} 50%, ${preset.accent} 50%)`,
              },
            }),
            h("span", { className: "preset-card-name" }, preset.name)
          )
        )
      ),
      h("div", { className: "panel-divider" }),
      h(
        "div",
        { className: "panel-header center" },
        h("h3", null, "WHEEL DESIGN")
      ),
      h(
        "div",
        { className: "wheel-designs-grid" },
        WHEEL_DESIGNS.map((design) =>
          h(
            "button",
            {
              key: design.id,
              className: `wheel-design-btn ${(wheelDesign || "ecleipsis") === design.id ? "active" : ""}`,
              onClick: () => setWheelDesign && setWheelDesign(design.id),
            },
            h("div", { className: "wheel-design-icon" },
              design.id === "ecleipsis"
                ? h("img", { src: "logo.png", alt: "Ecleipsis", className: "wheel-logo" })
                : h("span", { className: `wheel-icon wheel-icon-${design.id}` })
            ),
            h("span", { className: "wheel-design-name" }, design.name)
          )
        )
      )
    )
  );
}
