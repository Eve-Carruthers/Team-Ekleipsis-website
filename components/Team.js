import React, { useState, useEffect, useRef } from "react";
import DecodedText from "./DecodedText.js";

const h = React.createElement;

// Team member data from the portfolio
const teamMembers = [
  {
    id: 1,
    name: "Eve Carruthers",
    initials: "EC",
    role: "Technical Lead & Team Principal",
    tagline: "Engineering Excellence",
    shortBio: "Led EK5 development from concept through nationals. ANSYS CFD simulation expertise and Python race simulation.",
    fullBio: `As Technical Lead and Team Principal, Eve led the EK5 from initial concept through to nationals competition. She drove the full CAD modelling process in Fusion 360, iterating the design across multiple revisions to meet both performance targets and 2025 technical regulations.

Eve developed the team's ANSYS CFD simulation pipeline, running over 40 simulations to optimise downforce, reduce drag, and validate airflow behaviour across the full car assembly. She also built Python-based race simulations to model energy deployment and predict lap performance under varying track conditions.

As Team Principal, she coordinated all engineering milestones, managed sponsor relationships, and ensured the team delivered on every deadline from regional heats to the national finals.`,
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6, #6366F1)",
    responsibilities: [
      { task: "Research - aerodynamics/streamlining", level: "R + A" },
      { task: "CAD design - Fusion 360", level: "R + A" },
      { task: "CFD testing of designs (ANSYS)", level: "R + A" },
      { task: "Python race simulation development", level: "R + A" },
      { task: "Development of sponsorship pitches", level: "R + A" },
      { task: "Contact and securing sponsors", level: "R" },
      { task: "Social media setup & management", level: "R + A" },
      { task: "Verbal presentation speech", level: "R + A" },
      { task: "Pit display design & development", level: "R + A" },
      { task: "Merchandise development", level: "R + A" }
    ],
    skills: [
      { name: "Fusion 360", level: 97 },
      { name: "ANSYS CFD", level: 92 },
      { name: "Python Simulation", level: 90 },
      { name: "Aerodynamics", level: 88 },
      { name: "Project Management", level: 85 }
    ],
    achievements: ["CAD Lead", "CFD Expert", "Team Principal"],
    email: "14carrutherse@beaulieu.jersey.sch.uk"
  },
  {
    id: 2,
    name: "Florence Taylor",
    initials: "FL",
    role: "Scrutineering Lead",
    tagline: "Compliance & Safety",
    shortBio: "Nationals-level compliance documentation and 3-stage inspection protocol. Leading scrutineering and risk assessment.",
    fullBio: `As Scrutineering Lead, Florence developed and executed the team's nationals-level compliance documentation, ensuring the EK5 passed every technical, safety, and competition regulation check from regional heats through to the national finals.

She designed a rigorous 3-stage inspection protocol covering pre-build design review, mid-build dimensional checks, and final pre-race compliance verification. This systematic approach eliminated last-minute issues and gave the team confidence at scrutineering.

Florence also owns the team's risk assessment framework, identifying hazards across design, manufacturing, and race-day operations, with evidence-based mitigation strategies for each.`,
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B, #EAB308)",
    responsibilities: [
      { task: "Nationals scrutineering checks", level: "A" },
      { task: "3-stage inspection protocol", level: "R + A" },
      { task: "Data analysis - air tunnel testing", level: "R + A" },
      { task: "Data analysis - track testing", level: "R + A" },
      { task: "Production of D+E Portfolio", level: "R" },
      { task: "Risk assessment management", level: "R + A" },
      { task: "Quality control verification", level: "R + A" }
    ],
    skills: [
      { name: "Nationals Scrutineering", level: 95 },
      { name: "Quality Control", level: 92 },
      { name: "Risk Assessment", level: 92 },
      { name: "Data Analysis", level: 88 },
      { name: "Technical Docs", level: 85 }
    ],
    achievements: ["Safety Lead", "Compliance Expert", "Data Analyst"],
    email: null
  },
  {
    id: 3,
    name: "Abigail Taylor",
    initials: "AB",
    role: "Creative Lead",
    tagline: "Visual Identity",
    shortBio: "Designed nationals portfolios and pit display. Expanded brand identity across all team touchpoints.",
    fullBio: `As Creative Lead, Abigail designed and produced both the Enterprise & Marketing and Engineering portfolios that the team presented at nationals. Her layout work balanced technical depth with visual clarity, earning strong marks from judges.

She also designed the team's pit display, creating a cohesive visual environment that communicated Team Ekleipsis' brand story, technical achievements, and sponsor partnerships in a single compelling space.

Beyond competition materials, Abigail expanded the brand identity across every touchpoint — from livery and merchandise to social media templates and the team website — ensuring Team Ekleipsis is instantly recognisable wherever it appears.`,
    color: "#EC4899",
    gradient: "linear-gradient(135deg, #EC4899, #F472B6)",
    responsibilities: [
      { task: "Design and development of team branding", level: "A" },
      { task: "Nationals portfolio design (E&M + Engineering)", level: "R + A" },
      { task: "Pit display design & production", level: "R + A" },
      { task: "Verbal presentation slides", level: "R + A" },
      { task: "Car livery and rendering", level: "R + A" },
      { task: "Brand identity & style guide", level: "R + A" },
      { task: "Contact and securing sponsors", level: "A" }
    ],
    skills: [
      { name: "Portfolio Design", level: 96 },
      { name: "Pit Display Design", level: 93 },
      { name: "Brand Design", level: 95 },
      { name: "Visual Identity", level: 92 },
      { name: "Presentation Design", level: 90 }
    ],
    achievements: ["Brand Designer", "Creative Director", "Visual Artist"],
    email: null
  }
];

// Social media links
const socialLinks = [
  { platform: "Instagram", handle: "@Ekleipsisracing", url: "https://instagram.com/Ekleipsisracing", icon: "IG" },
  { platform: "LinkedIn", handle: "Team Ekleipsis", url: "https://linkedin.com/company/team-ekleipsis", icon: "in" },
  { platform: "X", handle: "@TeamEkleipsis", url: "https://x.com/TeamEkleipsis", icon: "X" }
];

// Skill bar component
function SkillBar({ skill, delay }) {
  return h("div", { className: "skill-bar-item", style: { animationDelay: `${delay}ms` } },
    h("div", { className: "skill-bar-header" },
      h("span", { className: "skill-bar-name" }, skill.name),
      h("span", { className: "skill-bar-percent" }, `${skill.level}%`)
    ),
    h("div", { className: "skill-bar-track" },
      h("div", {
        className: "skill-bar-fill",
        style: { width: `${skill.level}%`, animationDelay: `${delay + 200}ms` }
      })
    )
  );
}

// Achievement badge component
function AchievementBadge({ text, color }) {
  return h("span", { className: "achievement-badge", style: { "--badge-color": color } }, text);
}

// RACI Legend component
function RACILegend() {
  return h("div", { className: "raci-legend-new" },
    h("div", { className: "raci-item-new" },
      h("span", { className: "raci-code", "data-code": "R" }, "R"),
      h("span", null, "Responsible")
    ),
    h("div", { className: "raci-item-new" },
      h("span", { className: "raci-code", "data-code": "A" }, "A"),
      h("span", null, "Accountable")
    ),
    h("div", { className: "raci-item-new" },
      h("span", { className: "raci-code", "data-code": "C" }, "C"),
      h("span", null, "Consulted")
    ),
    h("div", { className: "raci-item-new" },
      h("span", { className: "raci-code", "data-code": "I" }, "I"),
      h("span", null, "Informed")
    )
  );
}

// Expanded profile modal - completely redesigned
function ExpandedProfile({ member, onClose }) {
  const [activeTab, setActiveTab] = useState("about");

  return h("div", { className: "profile-overlay", onClick: onClose },
    h("div", {
      className: "profile-modal",
      onClick: (e) => e.stopPropagation(),
      style: { "--member-color": member.color, "--member-gradient": member.gradient }
    },
      // Close button
      h("button", { className: "profile-close", onClick: onClose },
        h("span", null, "\u00D7")
      ),

      // Hero section with gradient header
      h("div", { className: "profile-hero" },
        h("div", { className: "profile-hero-bg" }),
        h("div", { className: "profile-hero-content" },
          h("div", { className: "profile-avatar-large" },
            h("span", null, member.initials)
          ),
          h("div", { className: "profile-hero-info" },
            h("span", { className: "profile-member-number" }, `#0${member.id}`),
            h("h2", { className: "profile-name" }, 
              h(DecodedText, { text: member.name, revealSpeed: 40 })
            ),
            h("span", { className: "profile-role" }, member.role),
            h("span", { className: "profile-tagline" }, member.tagline)
          )
        ),
        // Achievements
        h("div", { className: "profile-achievements" },
          ...member.achievements.map((a, i) =>
            h(AchievementBadge, { key: i, text: a, color: member.color })
          )
        )
      ),

      // Tab navigation
      h("div", { className: "profile-tabs" },
        h("button", {
          className: `profile-tab ${activeTab === "about" ? "active" : ""}`,
          onClick: () => setActiveTab("about")
        }, "About"),
        h("button", {
          className: `profile-tab ${activeTab === "skills" ? "active" : ""}`,
          onClick: () => setActiveTab("skills")
        }, "Skills"),
        h("button", {
          className: `profile-tab ${activeTab === "responsibilities" ? "active" : ""}`,
          onClick: () => setActiveTab("responsibilities")
        }, "Tasks")
      ),

      // Tab content
      h("div", { className: "profile-content" },
        // About tab
        activeTab === "about" && h("div", { className: "profile-tab-content about-content" },
          h("div", { className: "about-bio" },
            h("h4", null, "Biography"),
            h("p", null, member.fullBio)
          ),
          member.email && h("div", { className: "about-contact" },
            h("h4", null, "Get In Touch"),
            h("a", {
              href: `mailto:${member.email}`,
              className: "profile-email-btn"
            },
              h("span", { className: "email-icon" }, "\u2709"),
              h("span", null, member.email)
            )
          )
        ),

        // Skills tab
        activeTab === "skills" && h("div", { className: "profile-tab-content skills-content" },
          h("h4", null, "Core Competencies"),
          h("div", { className: "skills-bars" },
            ...member.skills.map((skill, i) =>
              h(SkillBar, { key: i, skill, delay: i * 100 })
            )
          )
        ),

        // Responsibilities tab
        activeTab === "responsibilities" && h("div", { className: "profile-tab-content tasks-content" },
          h("h4", null, "RACI Responsibilities"),
          h(RACILegend),
          h("div", { className: "tasks-list" },
            ...member.responsibilities.map((resp, i) =>
              h("div", { key: i, className: "task-item" },
                h("span", { className: "task-name" }, resp.task),
                h("span", { className: "task-level", "data-level": resp.level.replace(/\s/g, "") }, resp.level)
              )
            )
          )
        )
      )
    )
  );
}

// Individual card component with 3D Tilt
function TeamCard({ member, index, isFlipped, onFlip, onExpand }) {
  const cardRef = useRef(null);
  
  const cardStyle = {
    "--card-accent": member.color,
    "--card-gradient": member.gradient,
    "--card-index": index
  };

  // 3D Tilt Logic
  const handleMouseMove = (e) => {
    if (isFlipped || !cardRef.current) return;
    
    const card = cardRef.current;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg rotation
    const rotateY = ((x - centerX) / centerX) * 10;
    
    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    card.querySelector('.card-front-content').style.transform = `translateZ(30px)`;
    card.querySelector('.card-glow').style.background = `radial-gradient(circle at ${x}px ${y}px, ${member.color}40, transparent 80%)`;
  };

  const handleMouseLeave = () => {
    if (isFlipped || !cardRef.current) return;
    const card = cardRef.current;
    
    card.style.transform = `perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)`;
    card.querySelector('.card-front-content').style.transform = `translateZ(0px)`;
    card.classList.add('resetting');
    setTimeout(() => card.classList.remove('resetting'), 500);
  };

  // Handle card click
  const handleClick = (e) => {
    e.stopPropagation();
    if (!isFlipped) {
      onFlip(member.id);
    } else {
      onExpand(member.id);
    }
  };

  // Regular card view
  return h("div", {
    className: `team-card tilt-card-container ${isFlipped ? "flipped" : ""}`,
    style: cardStyle,
    onClick: handleClick,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave
  },
    // Inner wrapper for tilt
    h("div", { className: "tilt-card-inner", ref: cardRef },
      // Front of card
      h("div", { className: "team-card-front" },
        h("div", { className: "card-glow", style: { background: `radial-gradient(circle at 50% 50%, ${member.color}30, transparent 60%)` } }),
        h("div", { className: "card-front-content", style: { transition: "transform 0.1s" } },
          h("span", { className: "card-number" }, `#0${member.id}`),
          h("div", { className: "card-logo-wrap" },
            h("img", { src: "logo.png", alt: "Team Ekleipsis" })
          ),
          h("span", { className: "card-hint" }, "TAP TO REVEAL")
        )
      ),
      // Back of card
      h("div", { className: "team-card-back" },
        h("div", { className: "card-back-content" },
          h("div", { className: "member-photo-placeholder", style: { borderColor: member.color } },
            h("div", { className: "member-avatar-circle", style: { background: member.gradient } },
              member.initials
            )
          ),
          h("h3", { className: "member-name" }, member.name),
          h("span", { className: "member-role-tag", style: { borderColor: member.color, color: member.color } }, member.role),
          h("p", { className: "member-short-bio" }, member.shortBio),
          h("span", { className: "card-expand-hint" }, "TAP FOR FULL PROFILE \u2192")
        )
      )
    )
  );
}

export default function Team() {
  const [flippedCard, setFlippedCard] = useState(null);
  const [expandedCard, setExpandedCard] = useState(null);

  // Handle escape key to close expanded view
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && expandedCard) {
        setExpandedCard(null);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [expandedCard]);

  // Prevent body scroll when expanded
  useEffect(() => {
    if (expandedCard) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [expandedCard]);

  const handleFlip = (id) => {
    setFlippedCard(flippedCard === id ? null : id);
  };

  const handleExpand = (id) => {
    setExpandedCard(id);
  };

  const handleClose = () => {
    setExpandedCard(null);
  };

  const expandedMember = teamMembers.find(m => m.id === expandedCard);

  return h("section", { id: "team", className: "section team-section" },
    h("div", { className: "team-container" },
      // Header
      h("div", { className: "team-header" },
        h("span", { className: "section-num" }, "04"),
        h("h2", { className: "team-title" }, "WHO WE ARE"),
        h("p", { className: "team-subtitle" }, "The engineers behind the eclipse"),
        h("p", { className: "team-motto" }, '"Ignite Innovation, Accelerate Success"')
      ),

      // Cards grid
      h("div", { className: "team-cards-grid" },
        ...teamMembers.map((member, index) =>
          h(TeamCard, {
            key: member.id,
            member,
            index,
            isFlipped: flippedCard === member.id,
            onFlip: handleFlip,
            onExpand: handleExpand
          })
        )
      ),

      // Hint text
      h("p", { className: "team-hint" }, "Tap a card to flip. Tap again for full profile."),

      // Brand Identity Section
      h("div", { className: "brand-identity-section" },
        h("h3", { className: "brand-section-title" }, "OUR BRAND"),
        h("div", { className: "brand-colors" },
          h("div", { className: "color-swatch purple" },
            h("span", { className: "color-name" }, "Purple"),
            h("span", { className: "color-hex" }, "#3E0C70"),
            h("span", { className: "color-meaning" }, "Innovation & Ambition")
          ),
          h("div", { className: "color-swatch gold" },
            h("span", { className: "color-name" }, "Gold"),
            h("span", { className: "color-hex" }, "#F8BE19"),
            h("span", { className: "color-meaning" }, "Success & Excellence")
          ),
          h("div", { className: "color-swatch blue" },
            h("span", { className: "color-name" }, "Blue"),
            h("span", { className: "color-hex" }, "#3B82F6"),
            h("span", { className: "color-meaning" }, "Trust & Precision")
          )
        )
      ),

      // Social Media Section
      h("div", { className: "team-social-section" },
        h("h3", { className: "social-title" }, "FOLLOW OUR JOURNEY"),
        h("div", { className: "social-links-grid" },
          ...socialLinks.map((link, i) =>
            h("a", {
              key: i,
              href: link.url,
              target: "_blank",
              rel: "noopener noreferrer",
              className: "social-link-card"
            },
              h("span", { className: "social-icon" }, link.icon),
              h("span", { className: "social-platform" }, link.platform),
              h("span", { className: "social-handle" }, link.handle)
            )
          )
        )
      ),

      // Contact
      h("div", { className: "team-contact" },
        h("p", null, "Get in touch: ",
          h("a", { href: "mailto:14carrutherse@beaulieu.jersey.sch.uk" }, "14carrutherse@beaulieu.jersey.sch.uk")
        )
      )
    ),

    // Expanded profile modal
    expandedMember && h(ExpandedProfile, {
      member: expandedMember,
      onClose: handleClose
    })
  );
}
