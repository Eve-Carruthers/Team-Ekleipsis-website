import React from "react";
const h = React.createElement;

export default function SpeedIndicator() {
  return h(
    "div",
    { id: "speed-indicator", className: "visible" },
    h("span", { id: "speed-value" }, "220"),
    h("span", { className: "speed-unit" }, "km/h")
  );
}
