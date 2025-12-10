import React, { useRef, useState } from "react";
const h = React.createElement;

function MagneticLink({ href, children, className }) {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const x = (clientX - (left + width / 2)) * 0.3; // Magnetic strength
    const y = (clientY - (top + height / 2)) * 0.3;
    setPosition({ x, y });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return h(
    "a",
    {
      href,
      className,
      ref,
      onMouseMove: handleMouseMove,
      onMouseLeave: handleMouseLeave,
      style: {
        transform: `translate(${position.x}px, ${position.y}px)`,
        transition: position.x === 0 ? "transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)" : "none", // Spring back vs instant follow
        display: "inline-block" // Required for transform
      }
    },
    children
  );
}

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
      h(MagneticLink, { href: "#engineering", className: "nav-link" }, "ENGINEERING"),
      h(MagneticLink, { href: "#aero", className: "nav-link" }, "AERODYNAMICS"),
      h(MagneticLink, { href: "#team", className: "nav-link" }, "TEAM")
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
