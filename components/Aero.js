import React, { useEffect, useRef, useState } from "react";
const h = React.createElement;

const CFD_DATA = [
  { label: "Drag Coefficient", value: 0.19, unit: "Cd", decimals: 2 },
  { label: "Lift Coefficient", value: 0.02, unit: "Cl", decimals: 2 },
  { label: "Downforce", value: 1.8, unit: "N", decimals: 1 },
  { label: "Frontal Area", value: 0.00151, unit: "m\u00B2", decimals: 5 },
  { label: "Flow Velocity", value: 28.5, unit: "m/s", decimals: 1 },
];

function AnimatedValue({ target, decimals, duration = 1800 }) {
  const [current, setCurrent] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef(null);

  // Intersection Observer to trigger count-up when visible
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  // Animate from 0 to target
  useEffect(() => {
    if (!started) return;
    let startTime = null;
    let raf;
    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCurrent(eased * target);
      if (progress < 1) {
        raf = requestAnimationFrame(animate);
      }
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [started, target, duration]);

  return h("span", { ref }, current.toFixed(decimals));
}

export default function Aero() {
  return h(
    "section",
    { id: "aero", className: "section aero-section" },

    // Content overlay
    h(
      "div",
      { className: "aero-overlay" },

      // Section header
      h(
        "div",
        { className: "aero-header" },
        h("span", { className: "section-num" }, "02"),
        h("h2", { className: "aero-title" }, "AERODYNAMICS"),
        h(
          "p",
          { className: "aero-quote" },
          "\u201CIf you analyse the function of an object, its form often becomes obvious.\u201D",
          h("span", { className: "aero-quote-author" }, " \u2014 Ferdinand Porsche")
        )
      ),

      // CFD Data HUD
      h(
        "div",
        { className: "cfd-hud" },
        CFD_DATA.map((item, i) =>
          h(
            "div",
            { className: "cfd-item", key: i },
            h(
              "div",
              { className: "cfd-value-row" },
              h(
                "span",
                { className: "cfd-value" },
                h(AnimatedValue, {
                  target: item.value,
                  decimals: item.decimals,
                  duration: 1800 + i * 200,
                })
              ),
              h("span", { className: "cfd-unit" }, item.unit)
            ),
            h("span", { className: "cfd-label" }, item.label)
          )
        )
      )
    )
  );
}
