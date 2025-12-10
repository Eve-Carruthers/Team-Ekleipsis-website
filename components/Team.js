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
    shortBio: "Leading engineering decisions and team coordination. Driving innovation through CAD, CFD, and data-driven design.",
    fullBio: `As Technical Lead and Team Principal, Eve is responsible for all engineering and performance aspects of the project. She leads the CAD modelling process using Fusion 360, creating and refining the car design to ensure it meets both performance goals and competition regulations.

She ensures full compliance with all regulations throughout the design process, oversees testing, iteration, and data interpretation, using results to inform performance improvements and optimise the final design.

As Team Principal, she manages the team and ensures all goals are met, as well as communicating with sponsors and partners.`,
    color: "#8B5CF6",
    gradient: "linear-gradient(135deg, #8B5CF6, #6366F1)",
    responsibilities: [
      { task: "Research - aerodynamics/streamlining", level: "R + A" },
      { task: "CAD design - Fusion 360", level: "R + A" },
      { task: "CFD testing of designs", level: "R + A" },
      { task: "Evaluation of CFD - improvements", level: "R + A" },
      { task: "Development of sponsorship pitches", level: "R + A" },
      { task: "Contact and securing sponsors", level: "R" },
      { task: "Social media setup & management", level: "R + A" },
      { task: "Verbal presentation speech", level: "R + A" },
      { task: "Pit display design & development", level: "R + A" },
      { task: "Merchandise development", level: "R + A" }
    ],
    skills: [
      { name: "Fusion 360", level: 95 },
      { name: "CFD Analysis", level: 90 },
      { name: "Aerodynamics", level: 88 },
      { name: "Project Management", level: 85 },
      { name: "Sponsor Relations", level: 80 }
    ],
    achievements: ["CAD Lead", "CFD Expert", "Team Principal"],
    email: "14carrutherse@beaulieu.jersey.sch.uk"
  },
  {
    id: 2,
    name: "Florence",
    initials: "FL",
    role: "Scrutineering Lead",
    tagline: "Compliance & Safety",
    shortBio: "Ensuring compliance, safety, and rules adherence. Leading physical testing and risk assessment.",
    fullBio: `As Scrutineering Lead, Florence is responsible for ensuring that the car fully complies with all technical, safety, and competition regulations. She leads the scrutineering process by carefully checking the design and final build against the official rules.

Florence ensures that all team decisions are evidence-based and rules compliant. She works closely with the Technical Lead to identify and resolve any potential regulation issues early in the design process.

She writes and maintains the team's risk assessment, ensuring that all hazards are identified and controlled.`,
    color: "#F59E0B",
    gradient: "linear-gradient(135deg, #F59E0B, #EAB308)",
    responsibilities: [
      { task: "Scrutineering checks", level: "A" },
      { task: "Data analysis - air tunnel testing", level: "R + A" },
      { task: "Data analysis - track testing", level: "R + A" },
      { task: "Production of D+E Portfolio", level: "R" },
      { task: "Risk assessment management", level: "R + A" },
      { task: "Compliance verification", level: "R + A" },
      { task: "Safety procedures enforcement", level: "R + A" }
    ],
    skills: [
      { name: "Risk Assessment", level: 92 },
      { name: "Compliance Testing", level: 95 },
      { name: "Data Analysis", level: 88 },
      { name: "Technical Docs", level: 85 },
      { name: "Safety Management", level: 90 }
    ],
    achievements: ["Safety Lead", "Compliance Expert", "Data Analyst"],
    email: null
  },
  {
    id: 3,
    name: "Abigail",
    initials: "AB",
    role: "Creative Lead",
    tagline: "Visual Identity",
    shortBio: "Crafting the visual identity and brand. Leading design, rendering, and presentation materials.",
    fullBio: `As Creative Lead, Abigail is responsible for all visual, branding, and presentation elements of the project. She develops the team's visual identity, including the logo, colour scheme, and overall brand style.

Abigail leads the layout, design, and production of both the enterprise and marketing portfolio, as well as the pit display. She is also responsible for rendering and livery, creating a chic and cohesive design that ensures Team Ekleipsis is instantly recognisable.

She provides realistic project deadlines from a creative perspective and identifies the resources and tools needed to produce high-quality visual and marketing materials.`,
    color: "#EC4899",
    gradient: "linear-gradient(135deg, #EC4899, #F472B6)",
    responsibilities: [
      { task: "Design and development of team branding", level: "A" },
      { task: "Production of M+E Portfolio", level: "R + A" },
      { task: "Verbal presentation slides", level: "R + A" },
      { task: "Car livery and rendering", level: "R + A" },
      { task: "Pit display layout & design", level: "C" },
      { task: "Brand identity & style guide", level: "R + A" },
      { task: "Contact and securing sponsors", level: "A" }
    ],
    skills: [
      { name: "Brand Design", level: 95 },
      { name: "Visual Identity", level: 92 },
      { name: "Presentation Design", level: 90 },
      { name: "3D Rendering", level: 85 },
      { name: "Portfolio Layout", level: 88 }
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
