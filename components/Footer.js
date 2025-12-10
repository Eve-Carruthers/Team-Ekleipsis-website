import React from "react";
const h = React.createElement;

export default function Footer() {
  return h(
    "footer",
    { id: "footer" },
    h(
      "div",
      { className: "socials" },
      h("a", { href: "#", className: "social-link" }, "Instagram"),
      h("a", { href: "#", className: "social-link" }, "YouTube"),
      h("a", { href: "#", className: "social-link" }, "LinkedIn")
    )
  );
}
