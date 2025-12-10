import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import Navbar from "./components/Navbar.js";
import Hero from "./components/Hero.js";
import Engineering from "./components/Engineering.js";
import Garage from "./components/Garage.js";
import Aero from "./components/Aero.js";
import Sponsors from "./components/Sponsors.js";
import Team from "./components/Team.js";
import Budget from "./components/Budget.js";
import LoadingIntro from "./components/LoadingIntro.js";
import SpeedIndicator from "./components/SpeedIndicator.js";
import ProgressBar from "./components/ProgressBar.js";
import Footer from "./components/Footer.js";
import useThreeStage from "./components/useThreeStage.js";

const h = React.createElement;
const F = React.Fragment;

const PRESETS = {
  normal: { wind: 50, drag: 0.12, eff: 82, laminar: 80, df: 2.6, label: "NORMAL" },
  extreme: { wind: 95, drag: 0.18, eff: 88, laminar: 72, df: 3.2, label: "EXTREME" },
  null: { wind: 5, drag: 0.05, eff: 60, laminar: 92, df: 0.5, label: "NULL" },
};

function App() {
  const canvasRef = useRef(null);
  const pinOverlayRef = useRef(null);
  const glowRef = useRef(null);

  const [hud, setHud] = useState({ visible: false, title: "", specs: [], desc: "", x: 0, y: 0 });
  const [preset, setPreset] = useState("normal");
  const [downforce, setDownforce] = useState(0);
  const [drag, setDrag] = useState(0);
  const [eff, setEff] = useState(0);
  const [lam, setLam] = useState(0);
  const [theme, setTheme] = useState("dark");
  const [showIntro, setShowIntro] = useState(true);
  const [phase, setPhase] = useState("hero");
  const [carColor, setCarColor] = useState("#555555");
  const [bodyColor, setBodyColor] = useState("#555555");
  const [accentColor, setAccentColor] = useState("#222222");
  const [wheelColor, setWheelColor] = useState("#111111");
  const [viewMode, setViewMode] = useState("render");
  const [carPos, setCarPos] = useState({ x: 0, y: 0, z: 0 });
  const [carOffset, setCarOffset] = useState({ x: 0, y: 0, z: 0 });
  const [carScale, setCarScale] = useState(1.0);
  const [showDebug, setShowDebug] = useState(true);
  const [debugMinimized, setDebugMinimized] = useState(true);
  const [showBox, setShowBox] = useState(false);
  const [aeroRotation, setAeroRotation] = useState(0);

  useThreeStage({
    canvasRef, pinOverlayRef, setHud, phase, theme,
    carColor, carPos, carOffset, carScale,
    bodyColor, accentColor, wheelColor, viewMode, showBox,
    aeroRotation, aeroPreset: preset
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
    applyPreset("normal");
    const timer = setTimeout(() => setShowIntro(false), 4500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = Math.min(1, Math.max(0, window.scrollY / (max || 1)));
      // Extended aero section - stays visible much longer
      if (p < 0.05) setPhase("hero");
      else if (p < 0.12) setPhase("engineering");
      else if (p < 0.18) setPhase("garage");
      else if (p < 0.55) setPhase("aero");
      else if (p < 0.75) setPhase("sponsors");
      else setPhase("team");
    };
    window.addEventListener("scroll", onScroll);
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const applyPreset = (name) => {
    const p = PRESETS[name];
    if (!p) return;
    setPreset(name);
    setDownforce(Math.round(p.wind * p.df));
    setDrag(p.drag);
    setEff(p.eff);
    setLam(p.laminar);
  };

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
      h(Engineering, { hud, setHud, viewMode, setViewMode }),
      h(Garage, { bodyColor, setBodyColor, accentColor, setAccentColor, wheelColor, setWheelColor }),
      h(Aero, { preset, applyPreset, downforce, drag, eff, lam, presets: PRESETS, aeroRotation, setAeroRotation }),
      h(Sponsors),
      h(Team),
      h(Budget)
    ),
    // Speed indicator removed per user request
    h(ProgressBar),
    showDebug && h(
      "div",
      { id: "debug-panel", className: debugMinimized ? "minimized" : "" },
      h("div", { className: "debug-header" },
        h("span", null, "CAR ALIGNMENT"),
        h("div", { className: "debug-header-btns" },
          h("button", { onClick: () => setDebugMinimized(!debugMinimized) }, debugMinimized ? "+" : "−"),
          h("button", { onClick: () => setShowDebug(false) }, "×")
        )
      ),
      !debugMinimized && h(
        "div",
        { className: "debug-body" },
        h("div", { className: "debug-section" }, `SECTION: ${phase.toUpperCase()}`),
        h("div", { className: "debug-section" }, "FINE-TUNE"),
        h("div", { className: "debug-control" },
          h("label", null, `X: ${carOffset.x.toFixed(2)}`),
          h("input", {
            type: "range", min: -20, max: 20, step: 0.1, value: carOffset.x,
            onChange: (e) => setCarOffset(p => ({ ...p, x: parseFloat(e.target.value) }))
          })
        ),
        h("div", { className: "debug-control" },
          h("label", null, `Y: ${carOffset.y.toFixed(2)}`),
          h("input", {
            type: "range", min: -20, max: 20, step: 0.1, value: carOffset.y,
            onChange: (e) => setCarOffset(p => ({ ...p, y: parseFloat(e.target.value) }))
          })
        ),
        h("div", { className: "debug-control" },
          h("label", null, `Z: ${carOffset.z.toFixed(2)}`),
          h("input", {
            type: "range", min: -20, max: 20, step: 0.1, value: carOffset.z,
            onChange: (e) => setCarOffset(p => ({ ...p, z: parseFloat(e.target.value) }))
          })
        ),
        h("div", { className: "debug-control" },
          h("label", null, `Scale: ${carScale.toFixed(2)}`),
          h("input", {
            type: "range", min: 0.1, max: 5, step: 0.05, value: carScale,
            onChange: (e) => setCarScale(parseFloat(e.target.value))
          })
        ),
        h("div", { className: "debug-actions" },
          h("button", {
            className: "debug-btn",
            onClick: () => { setCarPos({ x: 0, y: 0, z: 0 }); setCarOffset({ x: 0, y: 0, z: 0 }); setCarScale(1.0); }
          }, "RESET"),
          h("button", {
            className: "debug-btn primary",
            onClick: () => {
              const config = { carOffset, carScale, carPos, phase };
              console.log("CAR CONFIG:", JSON.stringify(config, null, 2));
              navigator.clipboard?.writeText(JSON.stringify(config, null, 2));
            }
          }, "COPY")
        ),
        // Pin position controls
        phase === "engineering" && h("div", { className: "debug-section", style: { marginTop: "15px", borderTop: "1px solid #333", paddingTop: "10px" } },
          h("div", { style: { marginBottom: "8px", fontWeight: "bold" } }, "PIN POSITIONS"),
          h("div", { style: { fontSize: "9px", color: "#888", marginBottom: "8px" } }, "Hold SHIFT + drag pins to move"),
          h("button", {
            className: "debug-btn",
            style: { width: "100%", marginBottom: "5px" },
            onClick: () => {
              if (window.pinOffsets) {
                console.log("PIN OFFSETS:", JSON.stringify(window.pinOffsets, null, 2));
                navigator.clipboard?.writeText(JSON.stringify(window.pinOffsets, null, 2));
                alert("Pin offsets copied to clipboard!");
              }
            }
          }, "COPY PIN POSITIONS")
        )
      )
    ),
    h(Footer)
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(h(App));
}
