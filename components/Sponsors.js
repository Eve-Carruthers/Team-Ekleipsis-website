import React, { useEffect, useRef } from "react";
const h = React.createElement;

// Sponsor data organized by tier
const SPONSORS = {
  gold: [
    { name: "Cortida", logo: "svgs/Team Ekleipsis.svg", desc: "Major funding partner & cybersecurity expertise" },
    { name: "Jersey Energy", logo: "svgs/Team Ekleipsis (1).svg", desc: "Sustainable energy partner & major funding" },
  ],
  technical: [
    { name: "Switch Digital", logo: "svgs/Team Ekleipsis (6).svg", desc: "Portfolio & presentation coaching" },
    { name: "Collins", logo: "svgs/Team Ekleipsis (5).svg", desc: "High-quality print services" },
    { name: "Digital Jersey", logo: "svgs/Team Ekleipsis (3).svg", desc: "CNC facility access & tech community" },
    { name: "F1 Bearings", logo: "svgs/Team Ekleipsis (2).svg", desc: "Precision ceramic bearings & carbon fibre axles" },
    { name: "Ansys", logo: "svgs/Team Ekleipsis.svg", desc: "Professional CFD simulation software" },
    { name: "Synopsys", logo: "svgs/Team Ekleipsis (1).svg", desc: "Engineering software sponsorship" },
    { name: "LeGallais & Luce", logo: "svgs/Team Ekleipsis (3).svg", desc: "Technology sponsorship" },
    { name: "Carey Olsen", logo: "svgs/Team Ekleipsis (4).svg", desc: "Domain names & digital infrastructure" },
    { name: "EVie", logo: "svgs/Team Ekleipsis (5).svg", desc: "E-mobility partner" },
  ],
  returning: [
    { name: "Romerils", logo: "svgs/Team Ekleipsis (4).svg", desc: "Hardware supplier & continued support" },
    { name: "Beaulieu Convent School", logo: "svgs/Team Ekleipsis (6).svg", desc: "Educational partner & host institution" },
  ],
  supporting: [
    { name: "The Weekly Spaceman", logo: "logo.png", desc: "Media partner & press coverage" },
  ],
};

// Tier display config
const TIER_CONFIG = {
  gold: { label: "GOLD PARTNERS", accent: "#F8BE19" },
  technical: { label: "TECHNICAL PARTNERS", accent: "#8B5CF6" },
  returning: { label: "RETURNING PARTNERS", accent: "#22C55E" },
  supporting: { label: "SUPPORTING PARTNERS", accent: "#9CA3AF" },
};

// Single sponsor card
function SponsorCard({ sponsor, tier, index }) {
  const isGold = tier === "gold";
  const isReturning = tier === "returning";
  const logoMaxHeight = isGold ? "60px" : "50px";

  return h("div", {
    className: `sp-card sp-card--${tier}`,
    style: { "--sp-stagger": `${index * 100}ms` },
  },
    // Returning badge
    isReturning && h("span", { className: "sp-returning-badge" }, "RETURNING"),

    // Logo or name-as-visual
    h("div", { className: "sp-card__logo" },
      sponsor.logo
        ? h("img", {
            src: sponsor.logo,
            alt: sponsor.name,
            style: { maxHeight: logoMaxHeight },
            loading: "lazy",
          })
        : h("span", { className: "sp-card__name-visual" }, sponsor.name)
    ),

    // Name (only shown when logo exists; otherwise the name-visual replaces it)
    sponsor.logo && h("span", { className: "sp-card__name" }, sponsor.name),

    // Description
    h("span", { className: "sp-card__desc" }, sponsor.desc)
  );
}

// Tier section with its own observer ref
function TierSection({ tierKey, sponsors }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("sp-tier--visible");
          observer.unobserve(el);
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const cfg = TIER_CONFIG[tierKey];

  return h("div", {
    ref,
    className: `sp-tier sp-tier--${tierKey}`,
  },
    // Tier label
    h("span", { className: "sp-tier__label" }, cfg.label),

    // Card grid
    h("div", { className: `sp-tier__grid sp-tier__grid--${tierKey}` },
      ...sponsors.map((s, i) =>
        h(SponsorCard, { key: s.name, sponsor: s, tier: tierKey, index: i })
      )
    )
  );
}

export default function Sponsors() {
  return h("section", { id: "sponsors", className: "section sponsors-section" },
    h("div", { className: "sp-container" },
      // Header
      h("div", { className: "sp-header" },
        h("span", { className: "sp-header__num" }, "05"),
        h("h2", { className: "sp-header__title" }, "OUR PARTNERS")
      ),

      // Tier sections in order
      h(TierSection, { tierKey: "gold", sponsors: SPONSORS.gold }),
      h(TierSection, { tierKey: "technical", sponsors: SPONSORS.technical }),
      h(TierSection, { tierKey: "returning", sponsors: SPONSORS.returning }),
      h(TierSection, { tierKey: "supporting", sponsors: SPONSORS.supporting })
    )
  );
}
