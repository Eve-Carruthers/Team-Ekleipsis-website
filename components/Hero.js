import React from "react";
const h = React.createElement;

export default function Hero() {
  return h(
    "section",
    { id: "hero", className: "section" },
    h(
      "div",
      { className: "hero-content visible" },
      h("div", { className: "hero-badge" }, "JERSEY REGIONAL FINALS 2025"),
      h(
        "h1",
        { className: "hero-title" },
        h("span", { className: "line1" }, "TEAM"),
        h("span", { className: "line2" }, "EKLEIPSIS")
      ),
      h("p", { className: "hero-subtitle" }, "Professional Class | EK3 Reveal"),
      h(
        "div",
        { className: "hero-stats" },
        h(
          "div",
          { className: "stat" },
          h("span", { className: "stat-value" }, "EK3"),
          h("span", { className: "stat-label" }, "Model")
        ),
        h(
          "div",
          { className: "stat" },
          h("span", { className: "stat-value" }, "52g"),
          h("span", { className: "stat-label" }, "Weight")
        ),
        h(
          "div",
          { className: "stat" },
          h("span", { className: "stat-value" }, "134mm"),
          h("span", { className: "stat-label" }, "Length")
        )
      )
    ),
    h(
      "div",
      { className: "scroll-indicator visible" },
      h("span", null, "SCROLL TO EXPLORE"),
      h("div", { className: "scroll-arrow" })
    )
  );
}
