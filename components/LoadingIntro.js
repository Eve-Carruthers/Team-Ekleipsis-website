import React, { useState, useEffect } from "react";
const h = React.createElement;

export default function LoadingIntro() {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("INITIALIZING");

  useEffect(() => {
    const texts = ["Initializing...", "Loading EK5 Components...", "Assembling Vehicle...", "Calibrating Systems...", "Ready for Nationals"];
    let current = 0;

    const interval = setInterval(() => {
      setProgress(prev => {
        const next = prev + Math.random() * 3 + 1.5;
        if (next >= 100) {
          clearInterval(interval);
          setLoadingText("READY");
          return 100;
        }
        // Update text at certain thresholds
        if (next > 20 && current === 0) { current = 1; setLoadingText(texts[1]); }
        if (next > 40 && current === 1) { current = 2; setLoadingText(texts[2]); }
        if (next > 60 && current === 2) { current = 3; setLoadingText(texts[3]); }
        if (next > 80 && current === 3) { current = 4; setLoadingText(texts[4]); }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return h("div", { id: "loading-screen" },
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
