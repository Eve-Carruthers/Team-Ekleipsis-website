import React, { useState, useEffect, useRef } from "react";
const h = React.createElement;

// ── Data ──────────────────────────────────────────────
const STATS_ROW1 = [
  { value: 5, label: "Car Iterations", suffix: "", detail: "EK1 through EK5" },
  { value: 14, label: "Sponsors Secured", suffix: "+", detail: "Corporate Partners" },
  { value: 43, label: "Social Media Reach", suffix: "k+", detail: "Across All Platforms" },
  { value: 8200, label: "Sponsorship Raised", suffix: "+", prefix: "£", detail: "Total Funding" },
];

const STATS_ROW2 = [
  { value: 50, label: "Car Mass", suffix: "g", detail: "Down from 58g" },
  { value: 0.05, label: "Drag Coefficient", suffix: "", detail: "Cd", decimals: 2 },
  { value: 20, label: "Reaction Time", suffix: "ms", prefix: "<", detail: "Down from 1.31s" },
  { value: 1.8, label: "Downforce", suffix: "N", detail: "ANSYS Validated", decimals: 1 },
];

// ── Counter hook ──────────────────────────────────────
function useCountUp(target, duration, delay, decimals = 0, shouldStart) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!shouldStart) {
      setValue(0);
      return;
    }

    const timeout = setTimeout(() => {
      const animate = (timestamp) => {
        if (!startTimeRef.current) startTimeRef.current = timestamp;
        const elapsed = timestamp - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // Cubic ease-out: 1 - (1 - t)^3
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = eased * target;

        setValue(Number(current.toFixed(decimals)));

        if (progress < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          setValue(Number(target.toFixed(decimals)));
        }
      };

      startTimeRef.current = null;
      rafRef.current = requestAnimationFrame(animate);
    }, delay);

    return () => {
      clearTimeout(timeout);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [shouldStart, target, duration, delay, decimals]);

  return value;
}

// ── StatCard component ────────────────────────────────
function StatCard({ stat, index, isSecondary, shouldStart }) {
  const delay = index * 200; // 200ms stagger per card
  const duration = 2000;
  const decimals = stat.decimals || 0;
  const counted = useCountUp(stat.value, duration, delay, decimals, shouldStart);

  // Format large numbers with commas
  const formatted = decimals > 0
    ? counted.toFixed(decimals)
    : counted.toLocaleString();

  return h(
    "div",
    { className: "ach-stat-card" },
    h(
      "div",
      { className: isSecondary ? "ach-stat-value ach-stat-value--sm" : "ach-stat-value" },
      stat.prefix ? h("span", { className: "ach-stat-prefix" }, stat.prefix) : null,
      formatted,
      stat.suffix ? h("span", { className: "ach-stat-suffix" }, stat.suffix) : null
    ),
    h("div", { className: "ach-stat-label" }, stat.label),
    h("div", { className: "ach-stat-detail" }, stat.detail),
    h("div", { className: "ach-stat-accent" })
  );
}

// ── Main component ────────────────────────────────────
export default function Achievements() {
  const sectionRef = useRef(null);
  const [started, setStarted] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  // IntersectionObserver to trigger counters
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
          // Footer appears after all counters finish:
          // 8 cards * 200ms stagger + 2000ms duration = 3600ms
          setTimeout(() => setFooterVisible(true), 3800);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  return h(
    "section",
    { className: "achievements-section", ref: sectionRef, id: "achievements" },

    // Header
    h(
      "div",
      { className: "achievements-header" },
      h("span", { className: "section-num" }, "04"),
      h("h2", { className: "achievements-title" }, "ACHIEVEMENTS")
    ),

    // Row 1 - Impact Numbers (large)
    h(
      "div",
      { className: "ach-stats-grid" },
      STATS_ROW1.map((stat, i) =>
        h(StatCard, {
          key: stat.label,
          stat: stat,
          index: i,
          isSecondary: false,
          shouldStart: started,
        })
      )
    ),

    // Row 2 - Performance Stats (slightly smaller)
    h(
      "div",
      { className: "ach-stats-grid ach-stats-grid--secondary" },
      STATS_ROW2.map((stat, i) =>
        h(StatCard, {
          key: stat.label,
          stat: stat,
          index: i + STATS_ROW1.length, // continue stagger from row 1
          isSecondary: true,
          shouldStart: started,
        })
      )
    ),

    // Footer tagline
    h(
      "p",
      {
        className: "achievements-footer" + (footerVisible ? " achievements-footer--visible" : ""),
      },
      "From Jersey Regionals to UK Nationals"
    )
  );
}
