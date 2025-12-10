# Team Ekleipsis - F1 in Schools Website

<p align="center">
  <img src="logo.png" alt="Team Ekleipsis Logo" width="200"/>
</p>

<p align="center">
  <strong>"Ignite Innovation, Accelerate Success"</strong>
</p>

<p align="center">
  Jersey's F1 in Schools Racing Team | EK3
</p>

---

## Overview

This is the official website for **Team Ekleipsis**, a competitive F1 in Schools team from Jersey, Channel Islands. The website showcases our EK3 race car through an immersive 3D experience, featuring interactive sections for engineering details, aerodynamics analysis, team information, sponsors, and project documentation.

## Live Demo

Visit: [teamekleipsis.com](https://teamekleipsis.com)

---

## Tech Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 18.3.1 | UI component library (via ESM imports) |
| **Three.js** | 0.160.0 | 3D graphics and WebGL rendering |
| **GSAP** | 3.12.2 | Animation library with ScrollTrigger |
| **Vanilla CSS** | - | Styling with CSS variables and animations |

### Loading Method

The project uses **ES Modules (ESM)** with import maps - no build tools required:

```html
<script type="importmap">
{
    "imports": {
        "react": "https://esm.sh/react@18.3.1",
        "react-dom/client": "https://esm.sh/react-dom@18.3.1/client",
        "three": "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js",
        "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/",
        "gsap": "https://cdn.jsdelivr.net/npm/gsap@3.12.2/index.js"
    }
}
</script>
```

### Design System

- **Fonts**: Orbitron (headings), Inter (body text)
- **Primary Color**: `#3E0C70` (Purple)
- **Accent Color**: `#F8BE19` (Gold)
- **Theme**: Dark mode default with light mode toggle

---

## Project Structure

```
teamEcleipsis/
├── index.html              # Entry point with import maps & meta tags
├── app.js                  # Main React application
├── styles.css              # Core styles (~2000 lines)
├── sponsors-new.css        # Component-specific styles (~1600 lines)
├── effects.css             # Interactive effects (mouse glow, tilt cards)
├── components/
│   ├── useThreeStage.js    # 3D scene controller (~1000 lines)
│   ├── Hero.js             # Landing section
│   ├── Engineering.js      # Technical breakdown with hotspots
│   ├── Garage.js           # Car customization
│   ├── Aero.js             # Wind tunnel simulation
│   ├── Sponsors.js         # Sponsor showcase with modals
│   ├── Team.js             # Team member flip cards
│   ├── Budget.js           # Financial overview & SWOT
│   ├── LoadingIntro.js     # Premium loading screen
│   ├── Navbar.js           # Navigation bar
│   ├── ProgressBar.js      # Scroll progress indicator
│   ├── Footer.js           # Footer component
│   └── DecodedText.js      # Text decode animation effect
├── svgs/                   # Sponsor logo SVGs
├── EK3 COMBINED.stl        # 3D car model (881KB)
├── logo.png                # Team logo
└── *.pdf                   # Documentation & portfolios
```

---

## Website Sections

### 1. Loading Screen
- Animated "EK3" watermark with pulse effect
- Eclipse ring animations (3 rotating rings)
- 5-stage progress bar with status messages
- Duration: 4.5 seconds

### 2. Hero Section (0-5% scroll)
- Full-screen landing with 3D car
- Team branding and tagline

### 3. Engineering Section (5-12% scroll)
- Interactive car component hotspots
- Click hotspots to reveal technical specs
- View modes: Render, Mesh, Vertex, Blueprint

### 4. Garage Section (12-18% scroll)
- Car colour customization
- Real-time 3D preview

### 5. Aerodynamics Section (18-55% scroll)
- Wind tunnel simulation
- Animated particle flow
- CFD presets: Normal, Extreme, Null
- 360° camera orbit controls
- Real-time metrics display

### 6. Sponsors Section (55-75% scroll)
- Tiered sponsor display (Gold, Technical, Returning)
- Clickable sponsor cards with modal details
- Sponsorship tier information

### 7. Team Section (75-100% scroll)
- Interactive flip cards for each team member
- Detailed profile modals with:
  - About tab (bio & social links)
  - Skills tab (animated progress bars)
  - Tasks tab (RACI responsibilities)

### 8. Budget Section
- Financial breakdown table
- Risk assessment cards
- SWOT analysis grid
- Downloadable resources

---

## 3D Car Positioning System

### The Challenge

Positioning a 3D car model consistently across different scroll sections while maintaining smooth transitions required extensive debugging and fine-tuning.

### Solution: Phase-Based Configuration

We implemented a `PHASE_CONFIGS` object in `useThreeStage.js` that defines exact positioning for each scroll phase:

```javascript
const PHASE_CONFIGS = {
  hero: {
    carOffset: { x: -8.6, y: 0.2, z: 16 },
    carScale: 2.65,
    carPos: { x: 1.1, y: 1.2, z: 30 },
    cameraPos: { x: 0, y: 3, z: 15 },
    carRotation: -Math.PI / 4,
    showPodium: false,
  },
  engineering: {
    carOffset: { x: 4.7, y: 1.4, z: 10 },
    carScale: 1.95,
    carPos: { x: -4.6, y: 0.9, z: -3.4 },
    cameraPos: { x: 10, y: 2, z: 13 },
    carRotation: -Math.PI / 4,
    showPodium: true,
  },
  garage: {
    carOffset: { x: 5.6, y: 0.6, z: 10 },
    carScale: 1.75,
    carPos: { x: -5.5, y: 1.4, z: -3.8 },
    cameraPos: { x: 10, y: 2, z: 14 },
    carRotation: -Math.PI / 5,
    showPodium: true,
  },
  aero: {
    carOffset: { x: 0, y: 1.2, z: 10 },
    carScale: 2.2,
    carPos: { x: -3, y: -0.5, z: -2 },
    cameraPos: { x: 0, y: 3, z: 20 },
    carRotation: -Math.PI / 2,
    showPodium: false,
  },
  sponsors: {
    // Car hidden - positioned off-screen
    carOffset: { x: 0, y: -100, z: 0 },
    carScale: 0,
    carPos: { x: 0, y: -100, z: 0 },
    hideCar: true,
  },
  team: {
    // Car hidden - positioned off-screen
    carOffset: { x: 0, y: -100, z: 0 },
    carScale: 0,
    carPos: { x: 0, y: -100, z: 0 },
    hideCar: true,
  },
};
```

### Configuration Parameters Explained

| Parameter | Description |
|-----------|-------------|
| `carOffset` | Fine-tune position relative to container (x, y, z) |
| `carScale` | Size multiplier for the car model |
| `carPos` | Container/group position in world space |
| `cameraPos` | Camera position for optimal viewing angle |
| `carRotation` | Y-axis rotation in radians |
| `showPodium` | Whether to display the podium platform |
| `hideCar` | Force hide car (used for text-focused sections) |

### Debugging Process

1. **Built-in Debug Panel**: A collapsible panel allows real-time adjustment of X, Y, Z offsets and scale during development.

2. **Iterative Fine-Tuning**: Each section required multiple iterations:
   - Adjust offset values
   - Check against UI panel positions
   - Verify on different screen sizes
   - Test scroll transitions

3. **Global Scene Offset**: Applied `SCENE_X_OFFSET = -3` to shift the entire scene left, making room for UI panels on the right side.

### Scroll Phase Detection

Scroll position determines which phase configuration to apply:

```javascript
useEffect(() => {
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = Math.min(1, Math.max(0, window.scrollY / (max || 1)));

    if (p < 0.05) setPhase("hero");
    else if (p < 0.12) setPhase("engineering");
    else if (p < 0.18) setPhase("garage");
    else if (p < 0.55) setPhase("aero");      // 37% of scroll!
    else if (p < 0.75) setPhase("sponsors");
    else setPhase("team");
  };
  window.addEventListener("scroll", onScroll);
}, []);
```

### Car Visibility Control

For sections without the car, we use triple redundancy:

```javascript
// 1. Position off-screen
carOffset: { x: 0, y: -100, z: 0 }

// 2. Scale to zero
carScale: 0

// 3. Explicit visibility toggle
const carVisible = currentPhase !== "sponsors" && currentPhase !== "team";
sceneObjectsRef.current.carMesh.visible = carVisible;
sceneObjectsRef.current.wireframe.visible = carVisible;
sceneObjectsRef.current.vertexPoints.visible = carVisible;
```

---

## Key Features

### Interactive 3D Car Model
- Loaded from STL file using Three.js STLLoader
- Multiple view modes (Render, Mesh, Vertex, Blueprint)
- Smooth camera transitions between sections

### Wind Tunnel Simulation
- Particle system with 2000+ particles
- Heat effect when particles hit car body
- Three wind presets with different behaviors
- Real-time downforce/drag calculations

### Component Hotspots
- 6 interactive hotspots on car model
- Screen-space positioning relative to 3D model
- HUD popups with technical specifications

### Mouse Glow Effect
- Follows cursor position
- Purple radial gradient
- Screen blend mode for visual effect

### Responsive Design
- Mobile-optimized layouts
- Touch-friendly interactions
- Adjusted 3D camera for smaller screens

---

## Development Notes

### React Pattern
All components use `React.createElement` instead of JSX:

```javascript
const h = React.createElement;

// Instead of: <div className="foo"><span>text</span></div>
// We write:
h("div", { className: "foo" }, h("span", null, "text"))
```

### CSS Architecture
- `styles.css`: Core layout, navigation, sections
- `sponsors-new.css`: New component styles (modular)
- `effects.css`: Interactive visual effects
- CSS variables for theming

### Animation Easing
Consistent easing curve used throughout:
```css
transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
```

---

## Team

| Name | Role | Responsibilities |
|------|------|------------------|
| **Eve Carruthers** | Technical Lead & Team Principal | CAD, CFD, Sponsor Relations |
| **Florence** | Scrutineering Lead | Compliance, Safety, Testing |
| **Abigail** | Creative Lead | Branding, Design, Portfolio |

---

## Sponsors

### Gold Tier
- Cortida
- Jersey Energy

### Technical Partners
- Switch Digital
- Collins
- Digital Jersey
- The Weekly Spaceman
- Beaulieu

### Returning Partners
- Romerils

---

## Social Media

- **Instagram**: [@Ekleipsisracing](https://instagram.com/Ekleipsisracing)
- **LinkedIn**: [Team Ekleipsis](https://linkedin.com/company/team-ekleipsis)
- **X (Twitter)**: [@TeamEkleipsis](https://x.com/TeamEkleipsis)

---

## Running Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/kayeacc/teamekleipsis.git
   ```

2. Serve with any static file server:
   ```bash
   # Using Python
   python -m http.server 8000

   # Using Node.js
   npx serve

   # Using PHP
   php -S localhost:8000
   ```

3. Open `http://localhost:8000` in your browser

> **Note**: The site requires a server due to ES Module imports. Opening `index.html` directly won't work.

---

## Browser Support

- Chrome 89+
- Firefox 89+
- Safari 15+
- Edge 89+

Requires WebGL 2.0 support for 3D rendering.

---

## License

Copyright 2025 Team Ekleipsis. All rights reserved.

---

<p align="center">
  Built with passion by Team Ekleipsis
  <br/>
  F1 in Schools Jersey 2025
</p>
