import React from "react";
const h = React.createElement;

export default function Footer() {
  return h(
    "footer",
    { id: "footer" },
    h(
      "div",
      { className: "socials" },
      h("a", { href: "https://instagram.com/Ekleipsisracing", target: "_blank", rel: "noopener noreferrer", className: "social-link" }, "Instagram"),
      h("a", { href: "https://linkedin.com/company/team-ekleipsis", target: "_blank", rel: "noopener noreferrer", className: "social-link" }, "LinkedIn"),
      h("a", { href: "https://x.com/TeamEkleipsis", target: "_blank", rel: "noopener noreferrer", className: "social-link" }, "X")
    )
  );
}
