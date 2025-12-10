import React from "react";
const h = React.createElement;

export default function LoadingIntro() {
  return h(
    "div",
    { id: "opening" },
    h(
      "div",
      { className: "opening-logo" },
      h("img", { src: "logo.png", alt: "Team Ekleipsis" }),
      h("span", null, "TEAM EKLEIPSIS")
    ),
    h("div", { className: "opening-progress" }, h("div", { className: "opening-bar" })),
    h(
      "div",
      { className: "ground-lights" },
      ...Array.from({ length: 5 }).map((_, i) => h("div", { key: i, className: "light-beam" }))
    ),
    h("div", { className: "opening-text" }, h("span", { className: "ready" }, "READY"))
  );
}
