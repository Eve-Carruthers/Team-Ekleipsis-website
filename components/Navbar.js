import React from "react";
const h = React.createElement;

export default function Navbar({ theme, toggleTheme }) {
  return h(
    "nav",
    { id: "navbar", className: "visible" },
    h(
      "div",
      { className: "nav-brand" },
      h("img", { src: "logo.png", alt: "Team Ekleipsis" }),
      h(
        "div",
        { className: "brand-info" },
        h("span", null, "TEAM"),
        h("strong", null, "EKLEIPSIS")
      )
    ),
    h(
      "div",
      { className: "nav-links" },
      h("a", { href: "#engineering", className: "nav-link" }, "ENGINEERING"),
      h("a", { href: "#aero", className: "nav-link" }, "AERODYNAMICS"),
      h("a", { href: "#team", className: "nav-link" }, "TEAM")
    ),
    h(
      "div",
      { className: "nav-actions" },
      h(
        "button",
        { id: "theme-toggle", onClick: toggleTheme },
        h("span", { className: "theme-dot" }),
        h("span", { className: "theme-label" }, theme === "dark" ? "Dark" : "Light")
      )
    )
  );
}
