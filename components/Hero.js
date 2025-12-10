import React, { useEffect, useRef } from "react";
import DecodedText from "./DecodedText.js";

const h = React.createElement;

export default function Hero() {
  const parallaxRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
        if (!parallaxRef.current) return;
        const x = (e.clientX / window.innerWidth - 0.5) * 30; // 30px movement
        const y = (e.clientY / window.innerHeight - 0.5) * 30;
        parallaxRef.current.style.transform = `translate(${x}px, ${y}px)`;
        parallaxRef.current.style.transition = 'transform 0.1s ease-out';
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return h(
    "section",
    { id: "hero", className: "section" },
    h(
      "div",
      { className: "hero-content visible" },
      h("div", { ref: parallaxRef },
        h("div", { className: "hero-badge" }, "JERSEY REGIONAL FINALS 2025"),
        h(
            "h1",
            { className: "hero-title" },
            h("span", { className: "line1" }, "TEAM"),
            h("span", { className: "line2" }, 
                h(DecodedText, { text: "EKLEIPSIS", revealSpeed: 80, scrambleSpeed: 40 })
            )
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
