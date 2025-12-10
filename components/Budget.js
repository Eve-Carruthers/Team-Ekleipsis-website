import React from "react";
const h = React.createElement;

// Budget data from portfolio page 10
const budgetData = [
  { category: "Competition Entry", estimated: 200, actual: 200, variance: 0 },
  { category: "Manufacturing & Materials", estimated: 100, actual: 110, variance: 10 },
  { category: "Branding & Merchandise", estimated: 700, actual: 680, variance: -20 },
  { category: "Pit Display", estimated: 300, actual: 320, variance: 20 },
  { category: "Research & Development", estimated: 100, actual: 90, variance: -10 },
  { category: "Outreach", estimated: 100, actual: 80, variance: -20 }
];

const totals = {
  estimated: 1500,
  actual: 1480,
  variance: -20
};

// Risk data from portfolio
const riskData = [
  {
    risk: "Car failure during race",
    likelihood: "Medium",
    impact: "High",
    mitigation: "Thorough testing, backup parts, quick repair protocols"
  },
  {
    risk: "Sponsor withdrawal",
    likelihood: "Low",
    impact: "High",
    mitigation: "Diverse sponsor portfolio, maintain relationships, contingency fund"
  },
  {
    risk: "Team member absence",
    likelihood: "Medium",
    impact: "Medium",
    mitigation: "Cross-training, documented procedures, flexible roles"
  },
  {
    risk: "Budget overrun",
    likelihood: "Medium",
    impact: "Medium",
    mitigation: "Regular budget reviews, 10% contingency, prioritised spending"
  },
  {
    risk: "Technical regulation changes",
    likelihood: "Low",
    impact: "Medium",
    mitigation: "Monitor updates, flexible design approach, early compliance checks"
  }
];

// SWOT data
const swotData = {
  strengths: [
    "Strong technical expertise in CAD and CFD",
    "Previous Tech Award winners",
    "Established sponsor relationships",
    "Cohesive brand identity",
    "Multi-platform social media presence"
  ],
  weaknesses: [
    "Small team size",
    "Limited manufacturing resources",
    "First year at regional competition",
    "Time constraints with school commitments"
  ],
  opportunities: [
    "Growing STEM interest in Jersey",
    "Potential for new sponsor partnerships",
    "Media coverage and publicity",
    "Skills development and career connections"
  ],
  threats: [
    "Experienced competitor teams",
    "Changing regulations",
    "Supply chain delays",
    "External economic factors"
  ]
};

// Downloadable resources
const resources = [
  {
    name: "Enterprise & Marketing Portfolio",
    desc: "Full portfolio document",
    icon: "\uD83D\uDCC4",
    file: "EM Port NEW.pdf"
  },
  {
    name: "Design & Engineering Portfolio",
    desc: "Technical documentation",
    icon: "\u2699\uFE0F",
    file: "DE Portfolio.pdf"
  },
  {
    name: "Brand Guidelines",
    desc: "Logo, colors & typography",
    icon: "\uD83C\uDFA8",
    file: "Brand Guidelines.pdf"
  },
  {
    name: "Sponsorship Prospectus",
    desc: "Partnership opportunities",
    icon: "\uD83E\uDD1D",
    file: "Sponsorship.pdf"
  }
];

function formatCurrency(amount) {
  return `\u00A3${amount.toLocaleString()}`;
}

function BudgetTable() {
  return h("div", { className: "budget-table-wrap" },
    h("table", { className: "budget-table" },
      h("thead", null,
        h("tr", null,
          h("th", null, "Category"),
          h("th", null, "Estimated"),
          h("th", null, "Actual"),
          h("th", null, "Variance")
        )
      ),
      h("tbody", null,
        ...budgetData.map((row, i) =>
          h("tr", { key: i },
            h("td", { className: "category" }, row.category),
            h("td", null, formatCurrency(row.estimated)),
            h("td", null, formatCurrency(row.actual)),
            h("td", null,
              h("span", {
                className: `variance ${row.variance > 0 ? "positive" : row.variance < 0 ? "negative" : "neutral"}`
              }, row.variance > 0 ? `+\u00A3${row.variance}` : row.variance < 0 ? `-\u00A3${Math.abs(row.variance)}` : "\u00A30")
            )
          )
        )
      ),
      h("tfoot", null,
        h("tr", null,
          h("td", null, "TOTAL"),
          h("td", null, formatCurrency(totals.estimated)),
          h("td", null, formatCurrency(totals.actual)),
          h("td", null,
            h("span", { className: "variance" }, `-\u00A3${Math.abs(totals.variance)}`)
          )
        )
      )
    )
  );
}

function BudgetSummary() {
  return h("div", { className: "budget-summary" },
    h("div", { className: "budget-card" },
      h("span", { className: "budget-card-value" }, formatCurrency(totals.estimated)),
      h("span", { className: "budget-card-label" }, "Total Budget")
    ),
    h("div", { className: "budget-card" },
      h("span", { className: "budget-card-value" }, formatCurrency(totals.actual)),
      h("span", { className: "budget-card-label" }, "Actual Spent")
    ),
    h("div", { className: "budget-card highlight" },
      h("span", { className: "budget-card-value savings" }, formatCurrency(Math.abs(totals.variance))),
      h("span", { className: "budget-card-label" }, "Under Budget")
    ),
    h("div", { className: "budget-card" },
      h("span", { className: "budget-card-value" }, "98.7%"),
      h("span", { className: "budget-card-label" }, "Budget Utilization")
    )
  );
}

function RiskTable() {
  return h("div", { className: "risk-section" },
    h("h3", { className: "subsection-title" }, "RISK ASSESSMENT"),
    h("div", { className: "risk-cards" },
      ...riskData.map((risk, i) =>
        h("div", { key: i, className: "risk-card" },
          h("div", { className: "risk-header" },
            h("span", { className: "risk-name" }, risk.risk),
            h("div", { className: "risk-badges" },
              h("span", { className: `risk-badge likelihood ${risk.likelihood.toLowerCase()}` }, risk.likelihood),
              h("span", { className: `risk-badge impact ${risk.impact.toLowerCase()}` }, risk.impact)
            )
          ),
          h("p", { className: "risk-mitigation" },
            h("strong", null, "Mitigation: "),
            risk.mitigation
          )
        )
      )
    )
  );
}

function SWOTGrid() {
  return h("div", { className: "swot-section" },
    h("h3", { className: "subsection-title" }, "SWOT ANALYSIS"),
    h("div", { className: "swot-grid" },
      h("div", { className: "swot-card strengths" },
        h("div", { className: "swot-header" },
          h("span", { className: "swot-icon" }, "S"),
          h("span", null, "Strengths")
        ),
        h("ul", null,
          ...swotData.strengths.map((item, i) => h("li", { key: i }, item))
        )
      ),
      h("div", { className: "swot-card weaknesses" },
        h("div", { className: "swot-header" },
          h("span", { className: "swot-icon" }, "W"),
          h("span", null, "Weaknesses")
        ),
        h("ul", null,
          ...swotData.weaknesses.map((item, i) => h("li", { key: i }, item))
        )
      ),
      h("div", { className: "swot-card opportunities" },
        h("div", { className: "swot-header" },
          h("span", { className: "swot-icon" }, "O"),
          h("span", null, "Opportunities")
        ),
        h("ul", null,
          ...swotData.opportunities.map((item, i) => h("li", { key: i }, item))
        )
      ),
      h("div", { className: "swot-card threats" },
        h("div", { className: "swot-header" },
          h("span", { className: "swot-icon" }, "T"),
          h("span", null, "Threats")
        ),
        h("ul", null,
          ...swotData.threats.map((item, i) => h("li", { key: i }, item))
        )
      )
    )
  );
}

function ResourcesGrid() {
  return h("div", { className: "resources-section" },
    h("div", { className: "resources-header" },
      h("h3", null, "DOWNLOADABLE RESOURCES"),
      h("p", null, "Access our documentation and materials")
    ),
    h("div", { className: "resources-grid" },
      ...resources.map((res, i) =>
        h("a", {
          key: i,
          href: res.file,
          download: true,
          className: "resource-card"
        },
          h("span", { className: "resource-icon" }, res.icon),
          h("div", { className: "resource-info" },
            h("span", { className: "resource-name" }, res.name),
            h("span", { className: "resource-desc" }, res.desc)
          ),
          h("span", { className: "resource-download" }, "DOWNLOAD")
        )
      )
    )
  );
}

export default function Budget() {
  return h("section", { id: "budget", className: "section budget-section" },
    h("div", { className: "budget-container" },
      // Header
      h("div", { className: "budget-header" },
        h("span", { className: "section-num" }, "05"),
        h("h2", null, "FINANCIALS & STRATEGY"),
        h("p", null, "Transparent budgeting and strategic planning")
      ),

      // Budget Summary Cards
      h(BudgetSummary),

      // Budget Table
      h(BudgetTable),

      // Risk Assessment
      h(RiskTable),

      // SWOT Analysis
      h(SWOTGrid),

      // Downloadable Resources
      h(ResourcesGrid)
    )
  );
}
