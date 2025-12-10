import React, { useState, useEffect } from "react";
const h = React.createElement;

export default function LoadingIntro() {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("INITIALIZING");

  useEffect(() => {
    const texts = ["INITIALIZING", "LOADING ASSETS", "PREPARING CAR", "ALMOST READY"];
    let current = 0;

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 15 + 5;
        if (next >= 100) {
          clearInterval(interval);
          setLoadingText("READY");
          return 100;
        }
        // Update text at certain thresholds
        if (next > 25 && current === 0) { current = 1; setLoadingText(texts[1]); }
        if (next > 50 && current === 1) { current = 2; setLoadingText(texts[2]); }
        if (next > 75 && current === 2) { current = 3; setLoadingText(texts[3]); }
        return next;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  return h("div", { id: "loading-screen" },
    // EK3 Watermark Background
    h("div", { className: "loading-watermark" }, "EK3"),

    // Animated eclipse rings
    h("div", { className: "eclipse-rings" },
      h("div", { className: "eclipse-ring ring-1" }),
      h("div", { className: "eclipse-ring ring-2" }),
      h("div", { className: "eclipse-ring ring-3" })
    ),

    // Main content
    h("div", { className: "loading-content" },
      // Logo with glow effect
      h("div", { className: "loading-logo-wrap" },
        h("div", { className: "logo-glow" }),
        h("img", { src: "logo.png", alt: "Team Ekleipsis", className: "loading-logo" })
      ),

      // Team name
      h("h1", { className: "loading-title" }, "TEAM EKLEIPSIS"),

      // Tagline
      h("p", { className: "loading-tagline" }, "Ignite Innovation, Accelerate Success"),

      // Progress bar
      h("div", { className: "loading-progress-wrap" },
        h("div", { className: "loading-progress-track" },
          h("div", {
            className: "loading-progress-bar",
            style: { width: `${progress}%` }
          }),
          h("div", {
            className: "loading-progress-glow",
            style: { left: `${progress}%` }
          })
        ),
        h("div", { className: "loading-progress-info" },
          h("span", { className: "loading-text" }, loadingText),
          h("span", { className: "loading-percent" }, `${Math.round(progress)}%`)
        )
      )
    ),

    // Bottom accent line
    h("div", { className: "loading-accent-line" })
  );
}
