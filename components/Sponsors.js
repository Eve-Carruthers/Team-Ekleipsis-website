import React, { useState } from "react";
const h = React.createElement;

// Sponsor data from the portfolio
const sponsors = {
  gold: [
    {
      name: "Cortida",
      logo: "svgs/Team Ekleipsis.svg",
      description: "Information & Cyber Security specialists providing essential tech support and funding for our engineering equipment.",
      website: "https://cortida.com",
      contribution: "Lead sponsor - funding key engineering equipment and professional resources"
    },
    {
      name: "Jersey Energy",
      logo: "svgs/Team Ekleipsis (1).svg",
      description: "Sustainable Engineering leaders powering Jersey's green future and supporting STEM education.",
      website: "https://jerseyenergy.je",
      contribution: "Major funding partner supporting our sustainable engineering approach"
    }
  ],
  technical: [
    {
      name: "Switch Digital",
      logo: "svgs/Team Ekleipsis (2).svg",
      description: "Digital agency helping us refine our portfolios, presentations, and online presence to professional standards.",
      website: "https://switchdigital.je",
      contribution: "Portfolio development, presentation coaching, and content creation workshops"
    },
    {
      name: "Collins",
      logo: "svgs/Team Ekleipsis (3).svg",
      description: "Professional printing services ensuring our pit display and materials are competition-ready.",
      website: "#",
      contribution: "High-quality printing for pit display, portfolios, and marketing materials"
    },
    {
      name: "Digital Jersey",
      logo: "svgs/Team Ekleipsis (4).svg",
      description: "Supporting Jersey's digital economy and nurturing the next generation of tech talent.",
      website: "https://digital.je",
      contribution: "Industry connections and digital skills development support"
    },
    {
      name: "The Weekly Spaceman",
      logo: "svgs/Team Ekleipsis (5).svg",
      description: "Media partner amplifying our story and inspiring young engineers across Jersey.",
      website: "#",
      contribution: "Media coverage and storytelling support"
    }
  ],
  returning: [
    {
      name: "Romerils",
      logo: "svgs/Team Ekleipsis (6).svg",
      description: "Jersey's trusted hardware supplier and proud returning sponsor who supported our Tech Award winning campaign last year.",
      website: "https://romerils.com",
      contribution: "Returning champion - materials, tools, and continued partnership"
    }
  ]
};

// Sponsorship tiers info
const sponsorshipTiers = [
  {
    tier: "Gold Partner",
    amount: "£600+",
    color: "#F8BE19",
    benefits: [
      "Lead sponsor status",
      "Large, prominent logo on car, uniforms, and pit display",
      "Featured in all media and promotional campaigns",
      "Social media spotlight posts",
      "Mentioned in verbal presentations"
    ]
  },
  {
    tier: "Silver Partner",
    amount: "£300-£599",
    color: "#9CA3AF",
    benefits: [
      "Medium logo placement on car and uniforms",
      "Logo on pit display booth",
      "Regular mentions on social media",
      "Included in marketing materials"
    ]
  },
  {
    tier: "Bronze Partner",
    amount: "£100-£299",
    color: "#CD7F32",
    benefits: [
      "Small logo on promotional materials",
      "Logo on pit display booth",
      "Mentions in social media updates"
    ]
  },
  {
    tier: "Technical Partner",
    amount: "Services",
    color: "#8B5CF6",
    benefits: [
      "Gold-tier logo treatment regardless of value",
      "Featured in all media campaigns",
      "Showcase of expertise and services",
      "Direct engagement with team"
    ]
  }
];

// Modal component for viewing sponsor details
function SponsorModal({ sponsor, onClose }) {
  if (!sponsor) return null;

  return h("div", { className: "sponsor-modal-overlay", onClick: onClose },
    h("div", { className: "sponsor-modal", onClick: e => e.stopPropagation() },
      h("button", { className: "sponsor-modal-close", onClick: onClose }, "\u00D7"),
      h("div", { className: "sponsor-modal-logo" },
        h("img", { src: sponsor.logo, alt: sponsor.name })
      ),
      h("div", { className: "sponsor-modal-content" },
        h("h3", null, sponsor.name),
        h("p", { className: "sponsor-modal-desc" }, sponsor.description),
        h("div", { className: "sponsor-modal-contribution" },
          h("span", { className: "contribution-label" }, "Their Contribution"),
          h("p", null, sponsor.contribution)
        ),
        sponsor.website && sponsor.website !== "#" && h("a", {
          href: sponsor.website,
          target: "_blank",
          rel: "noopener noreferrer",
          className: "sponsor-website-btn"
        }, "VISIT WEBSITE", h("span", null, " \u2192"))
      )
    )
  );
}

// Sponsor card component
function SponsorCard({ sponsor, tier, onClick }) {
  const tierColors = {
    gold: "#F8BE19",
    technical: "#8B5CF6",
    returning: "#22C55E"
  };

  return h("div", {
    className: `sponsor-card-new ${tier}`,
    onClick: () => onClick(sponsor),
    style: { "--tier-color": tierColors[tier] || "#8B5CF6" }
  },
    h("div", { className: "sponsor-card-inner" },
      h("div", { className: "sponsor-logo-wrap" },
        h("img", { src: sponsor.logo, alt: sponsor.name })
      ),
      h("div", { className: "sponsor-card-info" },
        h("span", { className: "sponsor-name" }, sponsor.name),
        h("span", { className: "sponsor-tier-badge" }, tier === "returning" ? "Returning" : tier.charAt(0).toUpperCase() + tier.slice(1))
      ),
      h("span", { className: "sponsor-view-hint" }, "Click to view details")
    )
  );
}

export default function Sponsors() {
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [showTiers, setShowTiers] = useState(false);

  return h("section", { id: "sponsors", className: "section sponsors-section-new" },
    h("div", { className: "sponsors-container-new" },
      // Header
      h("div", { className: "sponsors-header-new" },
        h("span", { className: "section-num" }, "03"),
        h("h2", null, "OUR PARTNERS"),
        h("p", null, "The companies powering our journey from Jersey to the World")
      ),

      // Gold Partners
      h("div", { className: "sponsor-tier-section" },
        h("div", { className: "tier-header gold" },
          h("span", { className: "tier-icon" }, "\u2605"),
          h("h3", null, "GOLD PARTNERS"),
          h("span", { className: "tier-amount" }, "£600+")
        ),
        h("div", { className: "sponsor-tier-grid" },
          ...sponsors.gold.map((s, i) =>
            h(SponsorCard, { key: i, sponsor: s, tier: "gold", onClick: setSelectedSponsor })
          )
        )
      ),

      // Technical Partners
      h("div", { className: "sponsor-tier-section" },
        h("div", { className: "tier-header technical" },
          h("span", { className: "tier-icon" }, "\u2699"),
          h("h3", null, "TECHNICAL PARTNERS"),
          h("span", { className: "tier-amount" }, "Services & Expertise")
        ),
        h("div", { className: "sponsor-tier-grid" },
          ...sponsors.technical.map((s, i) =>
            h(SponsorCard, { key: i, sponsor: s, tier: "technical", onClick: setSelectedSponsor })
          )
        )
      ),

      // Returning Sponsor
      h("div", { className: "sponsor-tier-section" },
        h("div", { className: "tier-header returning" },
          h("span", { className: "tier-icon" }, "\u21BB"),
          h("h3", null, "RETURNING CHAMPION"),
          h("span", { className: "tier-amount" }, "2nd Year Partner")
        ),
        h("div", { className: "sponsor-tier-grid" },
          ...sponsors.returning.map((s, i) =>
            h(SponsorCard, { key: i, sponsor: s, tier: "returning", onClick: setSelectedSponsor })
          )
        )
      ),

      // Sponsorship Tiers Info Toggle
      h("div", { className: "sponsorship-tiers-section" },
        h("button", {
          className: `tiers-toggle-btn ${showTiers ? "active" : ""}`,
          onClick: () => setShowTiers(!showTiers)
        },
          h("span", null, "SPONSORSHIP TIERS"),
          h("span", { className: "toggle-arrow" }, showTiers ? "\u25B2" : "\u25BC")
        ),
        showTiers && h("div", { className: "tiers-grid" },
          ...sponsorshipTiers.map((t, i) =>
            h("div", {
              key: i,
              className: "tier-card",
              style: { "--tier-accent": t.color }
            },
              h("div", { className: "tier-card-header" },
                h("span", { className: "tier-name" }, t.tier),
                h("span", { className: "tier-price" }, t.amount)
              ),
              h("ul", { className: "tier-benefits" },
                ...t.benefits.map((b, j) =>
                  h("li", { key: j }, h("span", { className: "benefit-check" }, "\u2713"), b)
                )
              )
            )
          )
        )
      ),

      // Become a Sponsor CTA
      h("div", { className: "sponsor-cta-section" },
        h("div", { className: "cta-content" },
          h("h3", null, "Partner With Us"),
          h("p", null, "Join our mission to inspire the next generation of engineers. Your support helps us represent Jersey on the global STEM racing stage."),
          h("div", { className: "cta-stats" },
            h("div", { className: "cta-stat" },
              h("span", { className: "cta-stat-value" }, "8,360+"),
              h("span", { className: "cta-stat-label" }, "Social Reach")
            ),
            h("div", { className: "cta-stat" },
              h("span", { className: "cta-stat-value" }, "30+"),
              h("span", { className: "cta-stat-label" }, "Students Inspired")
            ),
            h("div", { className: "cta-stat" },
              h("span", { className: "cta-stat-value" }, "3"),
              h("span", { className: "cta-stat-label" }, "Platforms")
            )
          )
        ),
        h("a", {
          href: "mailto:14carrutherse@beaulieu.jersey.sch.uk",
          className: "sponsor-cta-btn"
        }, "BECOME A SPONSOR")
      )
    ),

    // Modal
    selectedSponsor && h(SponsorModal, {
      sponsor: selectedSponsor,
      onClose: () => setSelectedSponsor(null)
    })
  );
}
