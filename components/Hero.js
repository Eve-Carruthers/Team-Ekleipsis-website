import React, { useEffect, useRef, useState } from "react";
import DecodedText from "./DecodedText.js";

const h = React.createElement;

const HERO_DEFAULT_TUNE = {
  carPosX: 14.9,
  carPosY: 0.9,
  carPosZ: 4,
  carScale: 1.43,
  carRotationDeg: -78.0,
  lookBiasX: -4.4,
};

const TUNE_FIELDS = [
  { key: "carPosX", label: "X", min: -4, max: 18, step: 0.1 },
  { key: "carPosY", label: "Y", min: -3, max: 4, step: 0.05 },
  { key: "carPosZ", label: "Z", min: -8, max: 8, step: 0.1 },
  { key: "carScale", label: "Scale", min: 0.35, max: 2.2, step: 0.01 },
  { key: "carRotationDeg", label: "Rotation", min: -180, max: 180, step: 0.5 },
  { key: "lookBiasX", label: "Look Bias", min: -8, max: 8, step: 0.1 },
];

function toFixedLabel(value, digits = 2) {
  return Number(value).toFixed(digits);
}

export default function Hero() {
  const parallaxRef = useRef(null);
  const [overlayHidden, setOverlayHidden] = useState(false);
  const [tuneOpen, setTuneOpen] = useState(false);
  const [locked, setLocked] = useState(false);
  const [copied, setCopied] = useState(false);
  const [tune, setTune] = useState(HERO_DEFAULT_TUNE);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!parallaxRef.current) return;
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;
      parallaxRef.current.style.transform = `translate(${x}px, ${y}px)`;
      parallaxRef.current.style.transition = "transform 0.1s ease-out";
    };

    const handleScroll = () => {
      const heroEl = document.getElementById("hero");
      if (!heroEl) return;
      const rect = heroEl.getBoundingClientRect();
      const hideOverlay =
        rect.bottom < window.innerHeight * 0.72 ||
        rect.top < -window.innerHeight * 0.08;
      setOverlayHidden(hideOverlay);
    };

    const scrollContainer = document.getElementById("scroll-container");
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll, { passive: true });
    }
    handleScroll();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  useEffect(() => {
    const onSync = (evt) => {
      const detail = evt.detail || {};
      const next = {
        carPosX: Number.isFinite(detail.carPosX) ? detail.carPosX : HERO_DEFAULT_TUNE.carPosX,
        carPosY: Number.isFinite(detail.carPosY) ? detail.carPosY : HERO_DEFAULT_TUNE.carPosY,
        carPosZ: Number.isFinite(detail.carPosZ) ? detail.carPosZ : HERO_DEFAULT_TUNE.carPosZ,
        carScale: Number.isFinite(detail.carScale) ? detail.carScale : HERO_DEFAULT_TUNE.carScale,
        carRotationDeg: Number.isFinite(detail.carRotationDeg) ? detail.carRotationDeg : HERO_DEFAULT_TUNE.carRotationDeg,
        lookBiasX: Number.isFinite(detail.lookBiasX) ? detail.lookBiasX : HERO_DEFAULT_TUNE.lookBiasX,
      };
      setTune(next);
      setLocked(!!detail.locked);
    };
    window.addEventListener("hero-placement-sync", onSync);
    return () => window.removeEventListener("hero-placement-sync", onSync);
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent("hero-placement-set", {
        detail: {
          carPosX: tune.carPosX,
          carPosY: tune.carPosY,
          carPosZ: tune.carPosZ,
          carScale: tune.carScale,
          carRotation: (tune.carRotationDeg * Math.PI) / 180,
          carRotationDeg: tune.carRotationDeg,
          lookBiasX: tune.lookBiasX,
        },
      })
    );
  }, [tune]);

  const setField = (key, value) => {
    setTune((prev) => ({ ...prev, [key]: Number(value) }));
  };

  const toggleLocked = () => {
    const next = !locked;
    setLocked(next);
    window.dispatchEvent(
      new CustomEvent("hero-placement-lock", { detail: { locked: next } })
    );
  };

  const resetTune = () => {
    setLocked(false);
    setTune(HERO_DEFAULT_TUNE);
    window.dispatchEvent(new CustomEvent("hero-placement-reset"));
    window.dispatchEvent(
      new CustomEvent("hero-placement-lock", { detail: { locked: false } })
    );
  };

  const copyTune = async () => {
    const payload = {
      hero: {
        carPos: {
          x: Number(toFixedLabel(tune.carPosX, 3)),
          y: Number(toFixedLabel(tune.carPosY, 3)),
          z: Number(toFixedLabel(tune.carPosZ, 3)),
        },
        carScale: Number(toFixedLabel(tune.carScale, 3)),
        carRotation: Number(toFixedLabel((tune.carRotationDeg * Math.PI) / 180, 6)),
        lookBiasX: Number(toFixedLabel(tune.lookBiasX, 3)),
      },
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
        setCopied(true);
        setTimeout(() => setCopied(false), 1400);
      }
    } catch (err) {
      console.warn("Failed to copy hero placement payload", err);
    }
  };

  const tuneSliders = TUNE_FIELDS.map((field) =>
    h(
      "label",
      { key: field.key, className: "hero-tune-row" },
      h(
        "div",
        { className: "hero-tune-row__header" },
        h("span", { className: "hero-tune-row__label" }, field.label),
        h("span", { className: "hero-tune-row__value" }, toFixedLabel(tune[field.key], field.step < 0.1 ? 2 : 1))
      ),
      h("input", {
        className: "hero-tune-slider",
        type: "range",
        min: field.min,
        max: field.max,
        step: field.step,
        value: tune[field.key],
        onChange: (e) => setField(field.key, e.target.value),
      })
    )
  );

  return h(
    "section",
    {
      id: "hero",
      className: "section",
      "data-assembling": overlayHidden ? "true" : "false",
    },
    h(
      "div",
      { className: "hero-content visible" },
      h(
        "div",
        { ref: parallaxRef },
        h("div", { className: "hero-badge" }, "STEM RACING - PROFESSIONAL CLASS"),
        h(
          "h1",
          { className: "hero-title" },
          h("span", { className: "line1" }, "TEAM"),
          h(
            "span",
            { className: "line2" },
            h(DecodedText, { text: "EKLEIPSIS", revealSpeed: 80, scrambleSpeed: 40 })
          )
        ),
        h(
          "p",
          { className: "hero-subtitle hero-subtitle--finalists" },
          "2026 UK Regional Champions"
        ),
        h(
          "p",
          { className: "hero-tagline" },
          "Ignite Innovation, Accelerate Success"
        ),
        h(
          "div",
          { className: "hero-stats" },
          h(
            "div",
            { className: "stat" },
            h("span", { className: "stat-value" }, "EK5"),
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
      { className: "hero-tune-wrap" },
      h(
        "button",
        {
          className: "hero-tune-toggle",
          onClick: () => setTuneOpen((v) => !v),
        },
        tuneOpen ? "HIDE CAR CONTROLS" : "POSITION CAR"
      ),
      tuneOpen
        ? h(
            "div",
            { className: "hero-tune-panel" },
            h("div", { className: "hero-tune-title" }, "HERO CAR PLACEMENT"),
            ...tuneSliders,
            h(
              "div",
              { className: "hero-tune-actions" },
              h(
                "button",
                {
                  className: "hero-tune-btn" + (locked ? " active" : ""),
                  onClick: toggleLocked,
                },
                locked ? "UNLOCK" : "LOCK PREVIEW"
              ),
              h(
                "button",
                { className: "hero-tune-btn", onClick: resetTune },
                "RESET"
              ),
              h(
                "button",
                { className: "hero-tune-btn", onClick: copyTune },
                copied ? "COPIED" : "COPY JSON"
              )
            )
          )
        : null
    ),
    h(
      "div",
      { className: "champion-badge" + (overlayHidden ? " champion-badge--visible" : "") },
      h("span", { className: "champion-badge__icon" }, "*"),
      h("span", { className: "champion-badge__text" }, "REGIONAL CHAMPIONS")
    ),
    h(
      "div",
      { className: "scroll-indicator visible" },
      h("span", null, "SCROLL TO EXPLORE"),
      h("div", { className: "scroll-arrow" })
    )
  );
}
