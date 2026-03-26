import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import Navbar from "./components/Navbar.js";
import Hero from "./components/Hero.js?v=20260326b";
import Integration from "./components/Integration.js?v=20260326b";
import Engineering from "./components/Engineering.js?v=20260326b";
import Aero from "./components/Aero.js";
import Achievements from "./components/Achievements.js";
import Sponsors from "./components/Sponsors.js";
import Team from "./components/Team.js";
import LoadingIntro from "./components/LoadingIntro.js";
import ProgressBar from "./components/ProgressBar.js";
import Footer from "./components/Footer.js";
import useThreeStage from "./components/useThreeStage.js?v=20260326b";

const h = React.createElement;
const F = React.Fragment;

function App() {
  const canvasRef = useRef(null);
  const pinOverlayRef = useRef(null);
  const glowRef = useRef(null);

  const [hud, setHud] = useState({ visible: false, title: "", specs: [], desc: "", x: 0, y: 0 });
  const [theme, setTheme] = useState("dark");
  const [showIntro, setShowIntro] = useState(true);
  const [phase, setPhase] = useState("hero");
  const [viewMode, setViewMode] = useState("render");
  const [isolatedPart, setIsolatedPart] = useState(null);

  useThreeStage({
    canvasRef, pinOverlayRef, setHud, phase, theme,
    viewMode, isolatedPart, setIsolatedPart
  });

  useEffect(() => {
    document.body.setAttribute("data-theme", theme);
  }, [theme]);

  // Mouse Glow Effect
  useEffect(() => {
    const handleMouseMove = (e) => {
        if (glowRef.current) {
            glowRef.current.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%, -50%)`;
        }
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 4500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const marker = window.scrollY + window.innerHeight * 0.42;
      const orderedSections = [
        { id: "hero", phase: "hero" },
        { id: "integration", phase: "integration" },
        { id: "engineering", phase: "engineering" },
        { id: "aero", phase: "aero" },
        { id: "achievements", phase: "achievements" },
        { id: "sponsors", phase: "sponsors" },
        { id: "team", phase: "team" },
      ];

      let nextPhase = "hero";
      orderedSections.forEach(({ id, phase: phaseName }) => {
        const sectionEl = document.getElementById(id);
        if (!sectionEl) return;
        if (marker >= sectionEl.offsetTop) nextPhase = phaseName;
      });

      const footerEl = document.getElementById("footer");
      if (footerEl && marker >= footerEl.offsetTop) {
        nextPhase = "footer";
      }

      setPhase(nextPhase);
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  return h(
    F,
    null,
    showIntro ? h(LoadingIntro) : null,
    h("div", { className: "mouse-glow", ref: glowRef }),
    h("canvas", { id: "canvas", ref: canvasRef }),
    h("div", { id: "pin-overlay", ref: pinOverlayRef }),
    h(Navbar, { theme, toggleTheme }),
    h(
      "div",
      { id: "scroll-container" },
      h(Hero),
      h(Integration),
      h(Engineering, { hud, setHud, viewMode, setViewMode, isolatedPart, setIsolatedPart }),
      h(Aero),
      h(Achievements),
      h(Sponsors),
      h(Team)
    ),
    h(ProgressBar),
    h(Footer)
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(h(App));
}
