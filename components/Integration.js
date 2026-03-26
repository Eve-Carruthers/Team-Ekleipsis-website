import React, { useEffect, useMemo, useRef, useState } from "react";

const h = React.createElement;

const MODE_BUILD = "build";
const MODE_AUTO = "auto";

const BUILD_PARTS = [
  { id: "main_body", label: "Main Body", hint: "Core chassis block" },
  { id: "nose_cone", label: "Nose Cone", hint: "Front impact structure" },
  { id: "front_wing", label: "Front Wing", hint: "Flow conditioning" },
  { id: "rear_wing", label: "Rear Wing", hint: "Rear downforce surface" },
  { id: "halo", label: "Halo", hint: "Driver safety arc" },
  { id: "front_suspension", label: "Front Suspension", hint: "Front axle mount" },
  { id: "rear_suspension", label: "Rear Suspension", hint: "Rear axle mount" },
  { id: "wheel_FL", label: "Wheel FL", hint: "Front-left wheel" },
  { id: "wheel_FR", label: "Wheel FR", hint: "Front-right wheel" },
  { id: "wheel_RL", label: "Wheel RL", hint: "Rear-left wheel" },
  { id: "wheel_RR", label: "Wheel RR", hint: "Rear-right wheel" },
];

function emit(eventName, detail) {
  window.dispatchEvent(new CustomEvent(eventName, { detail }));
}

export default function Integration() {
  const sectionRef = useRef(null);
  const [mode, setMode] = useState(MODE_BUILD);
  const [placedParts, setPlacedParts] = useState({});
  const [autoRunning, setAutoRunning] = useState(false);
  const [sectionActive, setSectionActive] = useState(false);

  const placedCount = useMemo(
    () => Object.values(placedParts).filter(Boolean).length,
    [placedParts]
  );

  const allPlaced = placedCount === BUILD_PARTS.length;

  useEffect(() => {
    emit("integration-mode-change", { mode });
    emit("integration-reset", {});
    setPlacedParts({});
    setAutoRunning(false);
  }, [mode]);

  useEffect(() => {
    const onAutoComplete = () => setAutoRunning(false);
    window.addEventListener("integration-auto-complete", onAutoComplete);
    return () => window.removeEventListener("integration-auto-complete", onAutoComplete);
  }, []);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => setSectionActive(entry.isIntersecting && entry.intersectionRatio > 0.28),
      { threshold: [0, 0.15, 0.28, 0.45, 0.7] }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const placePart = (partId) => {
    if (!partId || placedParts[partId]) return;
    setPlacedParts((prev) => ({ ...prev, [partId]: true }));
    emit("integration-select-part", { partId });
    emit("integration-place-part", { partId });
  };

  const startAutoAssemble = () => {
    setAutoRunning(true);
    emit("integration-start-auto", {});
  };

  const buildModePanel = h(
    "div",
    { className: "integration-build-stage" },
    h(
      "div",
      {
        className:
          "integration-parts-bar" +
          (sectionActive && mode === MODE_BUILD ? " visible" : ""),
      },
      h(
        "div",
        { className: "integration-parts-bar__header" },
        h("span", { className: "integration-parts-bar__title" }, "PARTS"),
        h(
          "span",
          { className: "integration-parts-bar__count" },
          allPlaced ? "COMPLETE" : `${placedCount}/${BUILD_PARTS.length}`
        ),
        h(
          "button",
          {
            className: "integration-parts-bar__reset",
            onClick: () => {
              setPlacedParts({});
              emit("integration-reset", {});
            },
          },
          "RESET"
        )
      ),
      h(
        "div",
        { className: "integration-parts-bar__list" },
        ...BUILD_PARTS.map((part) =>
          h(
            "button",
            {
              key: part.id,
              className:
                "integration-part-chip" +
                (placedParts[part.id] ? " integration-part-chip--placed" : ""),
              onClick: () => placePart(part.id),
              disabled: !!placedParts[part.id],
              title: part.hint,
            },
            h(
              "span",
              { className: "integration-part-chip__icon" },
              placedParts[part.id] ? "\u2713" : "\u25CB"
            ),
            h("span", { className: "integration-part-chip__name" }, part.label)
          )
        )
      )
    )
  );

  const autoModePanel = h(
    "div",
    { className: "integration-auto-layout" },
    h(
      "div",
      { className: "integration-auto-note" },
      h("span", { className: "integration-auto-note__label" }, "AUTO SEQUENCE READY"),
      h("p", null, "Parts are staged in space. Trigger assembly to snap them into EK5."),
      h(
        "button",
        {
          className: "integration-auto-btn",
          onClick: startAutoAssemble,
          disabled: autoRunning,
        },
        autoRunning ? "ASSEMBLING..." : "AUTO-ASSEMBLE"
      )
    )
  );

  return h(
    "section",
    { id: "integration", className: "section integration-section", ref: sectionRef },
    h(
      "div",
      { className: "integration-shell integration-shell--" + mode },
      h(
        "div",
        { className: "integration-header" },
        h("span", { className: "section-num" }, "00"),
        h("h2", { className: "integration-title" }, "ASSEMBLY SEQUENCE"),
        h(
          "p",
          { className: "integration-subtitle" },
          mode === MODE_BUILD
            ? "Click parts to assemble. Drag to rotate the car."
            : "Build manually in 360\u00B0 or trigger a one-click cinematic auto sequence."
        ),
        h(
          "div",
          { className: "integration-mode-toggle" },
          h(
            "button",
            {
              className: "integration-mode-btn" + (mode === MODE_BUILD ? " active" : ""),
              onClick: () => setMode(MODE_BUILD),
            },
            "BUILD YOUR OWN"
          ),
          h(
            "button",
            {
              className: "integration-mode-btn" + (mode === MODE_AUTO ? " active" : ""),
              onClick: () => setMode(MODE_AUTO),
            },
            "AUTO-ASSEMBLE"
          )
        )
      ),
      mode === MODE_BUILD ? buildModePanel : autoModePanel
    )
  );
}
