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

<p align="center">
  <a href="#overview">Overview</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#features">Features</a> •
  <a href="#3d-car-positioning-system">3D System</a> •
  <a href="#team">Team</a>
</p>

---

## Overview

This is the official website for **Team Ekleipsis**, a competitive F1 in Schools team from Jersey, Channel Islands. The website showcases our EK3 race car through an immersive 3D experience, featuring interactive sections for engineering details, aerodynamics analysis, team information, sponsors, and project documentation.

### Highlights

- **Immersive 3D Experience**: Interactive car model rendered in real-time using WebGL
- **Wind Tunnel Simulation**: Live particle physics demonstrating aerodynamic flow
- **Zero Build Tools**: Pure ES Modules - no webpack, no bundling, just modern JavaScript
- **Scroll-Driven Animations**: Seamless transitions between sections as you scroll

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

### Why No Build Tools?

We chose to use **ES Modules with Import Maps** for several reasons:

1. **Simplicity**: No complex webpack/vite configuration to maintain
2. **Fast Development**: Changes reflect immediately without rebuild
3. **Transparency**: What you write is what runs in the browser
4. **Learning**: Better understanding of how modules actually work

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

| Element | Value | Usage |
|---------|-------|-------|
| **Primary Font** | Orbitron | Headings, titles, tech text |
| **Body Font** | Inter | Paragraphs, descriptions |
| **Primary Color** | `#3E0C70` | Purple - brand identity |
| **Accent Color** | `#F8BE19` | Gold - highlights, CTAs |
| **Background** | `#0a0a0a` | Dark theme base |
| **Surface** | `rgba(255,255,255,0.05)` | Glass morphism panels |

---

## Project Structure

```
teamEcleipsis/
├── index.html                 # Entry point with import maps & SEO meta tags
├── app.js                     # Main React application (8.5KB)
├── styles.css                 # Core styles (~60KB, 2000+ lines)
├── sponsors-new.css           # Component styles (~38KB, 1600+ lines)
├── effects.css                # Interactive effects (1.7KB)
│
├── components/
│   ├── useThreeStage.js       # 3D scene controller (~35KB, 1000+ lines)
│   ├── Hero.js                # Landing section
│   ├── Engineering.js         # Technical breakdown with hotspots
│   ├── Garage.js              # Car customization
│   ├── Aero.js                # Wind tunnel simulation
│   ├── Sponsors.js            # Sponsor showcase with modals
│   ├── Team.js                # Team member flip cards (~15KB)
│   ├── Budget.js              # Financial overview & SWOT
│   ├── LoadingIntro.js        # Premium loading screen
│   ├── Navbar.js              # Navigation bar
│   ├── ProgressBar.js         # Scroll progress indicator
│   ├── Footer.js              # Footer component
│   └── DecodedText.js         # Text decode animation effect
│
├── svgs/                      # Sponsor logo SVGs (7 files)
│   ├── Team Ekleipsis.svg     # Cortida
│   ├── Team Ekleipsis (1).svg # Jersey Energy
│   ├── Team Ekleipsis (2).svg # Switch Digital
│   └── ...
│
├── EK3 COMBINED.stl           # 3D car model (881KB)
├── logo.png                   # Team logo (87KB)
│
└── Documentation/
    ├── EM Port NEW.pdf        # Enterprise & Marketing Portfolio
    ├── EK3 Engineering Drawings.pdf
    ├── EK 1 ED2.pdf
    └── Team Ekleipsis Sponsorship Prospectus 2025.pdf
```

### File Size Breakdown

| Category | Size | Files |
|----------|------|-------|
| JavaScript | ~95KB | 15 files |
| CSS | ~100KB | 3 files |
| 3D Model | 881KB | 1 STL file |
| Images | ~87KB | Logo + assets |
| PDFs | ~4MB | 4 documents |
| **Total** | **~5.2MB** | |

---

## Website Sections

### 1. Loading Screen
Premium loading experience with:
- **EK3 Watermark**: Giant "EK3" text pulsing in background (200-500px font)
- **Eclipse Rings**: 3 concentric rings rotating at different speeds
- **Progress Bar**: 5-stage loading with status messages:
  1. `INITIALIZING SYSTEMS`
  2. `LOADING 3D ASSETS`
  3. `PREPARING CAR MODEL`
  4. `CALIBRATING CFD`
  5. `READY`
- **Duration**: 4.5 seconds (configurable in `app.js` line 77)

### 2. Hero Section (0-5% scroll)
- Full-screen landing with 3D car prominently displayed
- Team branding, logo, and tagline
- Scroll indicator animation

### 3. Engineering Section (5-12% scroll)
- **Interactive Hotspots**: 6 clickable points on the car
  - Nose Cone
  - Front Wing
  - Sidepod
  - Air Intake
  - Rear Wing
  - Diffuser
- **View Modes**: Toggle between Render, Mesh, Vertex, Blueprint
- **HUD Popups**: Technical specifications for each component

### 4. Garage Section (12-18% scroll)
- **Color Customization**: Real-time color pickers for:
  - Body color
  - Accent color
  - Wheel color
- Live 3D preview updates instantly

### 5. Aerodynamics Section (18-55% scroll)
The largest section - 37% of total scroll dedicated to CFD visualization:

- **Wind Tunnel Simulation**:
  - 2000+ animated particles
  - Particles flow right-to-left
  - Heat effect (color change) when hitting car body
  - Deflection around car geometry

- **CFD Presets**:
  | Preset | Wind Speed | Particle Size | Behavior |
  |--------|------------|---------------|----------|
  | Normal | 50 | 0.08 | Balanced flow |
  | Extreme | 95 | 0.12 | Intense red/orange |
  | Null | 5 | 0.04 | Minimal, faint blue |

- **360° Camera Orbit**: Drag to rotate view around the car
- **Real-time Metrics**: Downforce, drag coefficient, efficiency

### 6. Sponsors Section (55-75% scroll)
- **Tiered Display**: Gold → Technical → Returning
- **Interactive Cards**: Click to open modal with sponsor details
- **Sponsorship Tiers Panel**: Benefits breakdown for potential sponsors
- **Statistics**: Social reach numbers

### 7. Team Section (75-100% scroll)
- **Flip Cards**: Click to flip and reveal back
- **Profile Modals**: Second click opens detailed view with tabs:
  - **About**: Full bio, social links
  - **Skills**: Animated progress bars (e.g., "Fusion 360: 95%")
  - **Tasks**: RACI responsibility matrix with color-coded badges

### 8. Budget Section
- **Financial Table**: Estimated vs Actual costs
- **Variance Tracking**: Color-coded over/under budget
- **Risk Assessment**: 5 identified risks with mitigation strategies
- **SWOT Analysis**: 2x2 grid (Strengths, Weaknesses, Opportunities, Threats)
- **Downloadable Resources**: Links to PDF portfolios

---

## 3D Car Positioning System

### The Challenge

Positioning a 3D car model consistently across different scroll sections while maintaining smooth transitions required extensive debugging and fine-tuning. The car needed to:

1. Appear in different positions for each section
2. Scale appropriately for the content layout
3. Rotate to show optimal viewing angles
4. Completely disappear for text-focused sections
5. Transition smoothly between positions

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
    // Car completely hidden
    carOffset: { x: 0, y: -100, z: 0 },
    carScale: 0,
    carPos: { x: 0, y: -100, z: 0 },
    hideCar: true,
  },
  team: {
    // Car completely hidden
    carOffset: { x: 0, y: -100, z: 0 },
    carScale: 0,
    carPos: { x: 0, y: -100, z: 0 },
    hideCar: true,
  },
};
```

### Configuration Parameters Explained

| Parameter | Type | Description |
|-----------|------|-------------|
| `carOffset` | `{x, y, z}` | Fine-tune position relative to container |
| `carScale` | `number` | Size multiplier (1.0 = base size) |
| `carPos` | `{x, y, z}` | Container/group position in world space |
| `cameraPos` | `{x, y, z}` | Camera position for optimal viewing |
| `carRotation` | `radians` | Y-axis rotation (use `Math.PI`) |
| `showPodium` | `boolean` | Display podium platform under car |
| `hideCar` | `boolean` | Force hide (for text sections) |

### The Debugging Process

Getting the car positioned correctly was one of the most time-intensive parts of development. Here's how we approached it:

#### 1. Built-in Debug Panel

We created a collapsible debug panel (visible during development) that allows real-time adjustment:

```javascript
// Debug panel provides sliders for:
- X offset: -20 to +20
- Y offset: -20 to +20
- Z offset: -20 to +20
- Scale: 0.1 to 5.0
```

#### 2. Iterative Fine-Tuning Process

For each section, we followed this workflow:

```
1. Set initial rough values based on where content panels are
2. Load page, observe car position
3. Adjust X to move car left/right relative to UI
4. Adjust Y to raise/lower car
5. Adjust Z to move car forward/backward (depth)
6. Adjust scale to fit the available space
7. Set rotation for best viewing angle
8. Test scroll transitions
9. Repeat until perfect
```

#### 3. Key Insights Discovered

- **Global Scene Offset**: We applied `SCENE_X_OFFSET = -3` to shift the entire 3D scene left, making room for UI panels typically on the right side.

- **Two-Level Positioning**: The car uses both `carOffset` (mesh-level) and `carPos` (container-level) for flexibility. This allows:
  - `carPos`: Coarse positioning of the entire car group
  - `carOffset`: Fine-tuning the mesh within the group

- **Camera Coupling**: Camera position must be tuned alongside car position - they work together to create the final composition.

### Scroll Phase Detection

Scroll position determines which phase configuration to apply:

```javascript
useEffect(() => {
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = Math.min(1, Math.max(0, window.scrollY / (max || 1)));

    if (p < 0.05) setPhase("hero");           // 0-5%
    else if (p < 0.12) setPhase("engineering"); // 5-12%
    else if (p < 0.18) setPhase("garage");      // 12-18%
    else if (p < 0.55) setPhase("aero");        // 18-55% (37%!)
    else if (p < 0.75) setPhase("sponsors");    // 55-75%
    else setPhase("team");                      // 75-100%
  };
  window.addEventListener("scroll", onScroll);
}, []);
```

**Note**: The Aero section gets 37% of the scroll range because it's the most interactive section with the wind tunnel simulation.

### Car Visibility Control

For sections without the car (Sponsors, Team, Budget), we use **triple redundancy** to ensure it's completely hidden:

```javascript
// Method 1: Position off-screen (y = -100)
carOffset: { x: 0, y: -100, z: 0 }

// Method 2: Scale to zero
carScale: 0

// Method 3: Explicit visibility toggle
const carVisible = currentPhase !== "sponsors" && currentPhase !== "team";
sceneObjectsRef.current.carMesh.visible = carVisible;
sceneObjectsRef.current.wireframe.visible = carVisible;
sceneObjectsRef.current.vertexPoints.visible = carVisible;
```

This triple approach was necessary because we encountered edge cases where just one method wasn't sufficient (e.g., scale 0 still rendering a point, or visibility toggling having frame delays).

---

## Key Features

### Interactive 3D Car Model
- **Format**: STL (881KB)
- **Loader**: Three.js STLLoader
- **Materials**: MeshStandardMaterial with metalness/roughness
- **Views**: Render (solid), Mesh (wireframe), Vertex (points), Blueprint (transparent + wireframe)

### Wind Tunnel Simulation
```javascript
// Particle system configuration
const particleCount = 2000;
const particleSpeeds = []; // Random speeds per particle
const particlePhase = [];  // Random animation phase offsets

// Heat effect when particles hit car
if (inCarZone) {
  colors[i * 3] = 1.0;     // Red
  colors[i * 3 + 1] = 0.3; // Some green
  colors[i * 3 + 2] = 0.0; // No blue
}
```

### Component Hotspots
6 interactive points positioned relative to car center:
```javascript
window.pinOffsets = {
  "nose": { x: 180, y: -20 },
  "front-wing": { x: 200, y: 40 },
  "sidepod": { x: 50, y: 30 },
  "intake": { x: -20, y: -60 },
  "rear-wing": { x: -150, y: -50 },
  "diffuser": { x: -180, y: 50 }
};
```

### Mouse Glow Effect
```css
.mouse-glow {
  position: fixed;
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(62, 12, 112, 0.15) 0%, transparent 70%);
  pointer-events: none;
  z-index: 9999;
  mix-blend-mode: screen;
}
```

### Smooth Scrolling
We use the native scroll with custom easing rather than a library for better performance:
```javascript
// Camera position lerps smoothly
camera.position.lerp(targetCameraPos, 0.02);
```

---

## Challenges & Solutions

### Challenge 1: Car Appearing in Wrong Sections
**Problem**: The car would randomly appear in Sponsors/Team sections during scroll.

**Root Cause**: Visibility was only being set to `true`, never `false`:
```javascript
// Bug
if (carVisible) {
  carMesh.visible = true;  // Never set to false!
}
```

**Solution**: Always set visibility based on the boolean:
```javascript
// Fix
carMesh.visible = carVisible;  // Sets true OR false
```

### Challenge 2: HUD Close Button Not Working
**Problem**: Clicking the X button on component HUD popups did nothing.

**Root Cause**: Parent element had `pointer-events: none` which blocked all clicks.

**Solution**: Added `pointer-events: auto` to the content container:
```css
.hud-content {
  pointer-events: auto;
}
```

### Challenge 3: Loading Screen Too Fast
**Problem**: Loading screen was only ~1.2 seconds, not enough time to appreciate the animation.

**Solution**: Extended to 4.5 seconds with slower progress increments:
```javascript
// Slower progress: 1.5-4.5% per tick instead of 5-20%
setProgress(p => Math.min(100, p + Math.random() * 3 + 1.5));
```

### Challenge 4: Aero Section Scrolling Past Too Quickly
**Problem**: Small scroll movements would skip past the aerodynamics section.

**Solution**: Extended aero scroll range from 27% to 37% of total scroll:
```javascript
// Before: 0.26-0.45 (19%)
// After:  0.18-0.55 (37%)
```

### Challenge 5: CSS Linter Conflicts
**Problem**: Editing `styles.css` kept failing due to linter modifications between read and write operations.

**Solution**: Created separate `sponsors-new.css` file for new styles, avoiding conflicts entirely.

---

## Animation System

### CSS Keyframes Used

```css
/* Loading screen animations */
@keyframes watermarkPulse { /* EK3 text pulse */ }
@keyframes ringRotate { /* Eclipse rings */ }
@keyframes logoFloat { /* Logo bob */ }
@keyframes titleFadeIn { /* Letter spacing animation */ }

/* UI animations */
@keyframes fadeIn { /* Opacity 0 to 1 */ }
@keyframes slideUp { /* Transform + opacity */ }
@keyframes shimmer { /* Gradient sweep */ }
@keyframes borderGlow { /* Pulsing borders */ }

/* Card animations */
@keyframes flipCard { /* 3D card flip */ }
@keyframes skillBarFill { /* Progress bar fill */ }
```

### Easing Functions

We use a consistent easing curve throughout for cohesive feel:

```css
/* Primary easing - smooth deceleration */
cubic-bezier(0.16, 1, 0.3, 1)

/* Used for: */
- Panel transitions
- Card flips
- Modal appearances
- Hover effects
```

### Three.js Animation Loop

```javascript
function animate() {
  rafRef.current = requestAnimationFrame(animate);

  // 1. Update theme colors
  // 2. Update view mode (render/mesh/vertex/blueprint)
  // 3. Apply phase config (position, scale, rotation)
  // 4. Update car visibility
  // 5. Animate particles (aero section)
  // 6. Update spotlight
  // 7. Animate fan blades
  // 8. Update hotspot positions
  // 9. Render scene

  renderer.render(scene, camera);
}
```

---

## Performance Considerations

### Optimizations Implemented

1. **Conditional Rendering**: Particles only animate in aero phase
2. **Visibility Culling**: Hidden objects have `visible = false`
3. **Lerped Transitions**: Camera uses lerp (0.02) for smooth 60fps movement
4. **Event Throttling**: Scroll events use native browser optimization
5. **CDN Assets**: Libraries loaded from fast CDNs (esm.sh, jsdelivr)

### Recommended Hardware

- **Minimum**: Integrated graphics, 4GB RAM
- **Recommended**: Dedicated GPU, 8GB RAM
- **Target FPS**: 60fps on modern devices

---

## Development Notes

### React Pattern (No JSX)

All components use `React.createElement` directly:

```javascript
const h = React.createElement;

// Instead of JSX:
// <div className="card"><span>Hello</span></div>

// We write:
h("div", { className: "card" },
  h("span", null, "Hello")
)
```

**Why?** No build step required. The code runs directly in the browser.

### CSS Architecture

| File | Purpose | Lines |
|------|---------|-------|
| `styles.css` | Core layout, sections, navigation | ~2000 |
| `sponsors-new.css` | Components, modals, loading | ~1600 |
| `effects.css` | Mouse glow, tilt cards | ~50 |

### Adding a New Section

1. Create component in `components/NewSection.js`
2. Import in `app.js`
3. Add to render order in scroll container
4. Add phase config in `useThreeStage.js` (if 3D needed)
5. Adjust scroll thresholds in `app.js`
6. Add styles to `sponsors-new.css`

---

## Team

| Name | Role | Key Responsibilities |
|------|------|---------------------|
| **Eve Carruthers** | Technical Lead & Team Principal | CAD design (Fusion 360), CFD testing, sponsor communications, team management |
| **Florence** | Scrutineering Lead | Compliance checks, safety protocols, physical testing, risk assessment |
| **Abigail** | Creative Lead | Branding, portfolio design, presentation slides, livery design |

### RACI Matrix

- **R** = Responsible (does the work)
- **A** = Accountable (approves/owns)
- **C** = Consulted
- **I** = Informed

---

## Sponsors

### Gold Tier (£600+)
- **Cortida** - Primary sponsor
- **Jersey Energy** - Energy partner

### Technical Partners
- **Switch Digital** - Digital services
- **Collins** - Engineering support
- **Digital Jersey** - Tech ecosystem
- **The Weekly Spaceman** - Media partner
- **Beaulieu** - School partner

### Returning Partners
- **Romerils** - Continued support

---

## Social Media

| Platform | Handle | Link |
|----------|--------|------|
| Instagram | @Ekleipsisracing | [instagram.com/Ekleipsisracing](https://instagram.com/Ekleipsisracing) |
| LinkedIn | Team Ekleipsis | [linkedin.com/company/team-ekleipsis](https://linkedin.com/company/team-ekleipsis) |
| X (Twitter) | @TeamEkleipsis | [x.com/TeamEkleipsis](https://x.com/TeamEkleipsis) |

**Engagement Stats**: 8,360 views • 196 profile views • 45 interactions

---

## Running Locally

### Prerequisites
- Modern web browser with ES Module support
- Local HTTP server (Python, Node.js, or PHP)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/Eve-Carruthers/Team-Ekleipsis-website.git
cd Team-Ekleipsis-website

# Option 1: Python
python -m http.server 8000

# Option 2: Node.js
npx serve

# Option 3: PHP
php -S localhost:8000

# Option 4: VS Code Live Server extension
# Just right-click index.html → "Open with Live Server"
```

Then open `http://localhost:8000` in your browser.

> **Important**: Opening `index.html` directly (file://) won't work due to ES Module CORS restrictions. You must use a local server.

---

## Browser Support

| Browser | Minimum Version | Status |
|---------|-----------------|--------|
| Chrome | 89+ | ✅ Full support |
| Firefox | 89+ | ✅ Full support |
| Safari | 15+ | ✅ Full support |
| Edge | 89+ | ✅ Full support |
| IE | - | ❌ Not supported |

### Requirements
- **WebGL 2.0**: Required for Three.js rendering
- **ES Modules**: Import maps support
- **CSS Grid/Flexbox**: Modern layout

---

## Future Improvements

- [ ] Mobile gesture controls for 3D rotation
- [ ] Sound effects for interactions
- [ ] Race day countdown timer
- [ ] Live competition results integration
- [ ] Multilingual support
- [ ] PWA offline capability

---

## Acknowledgments

- **Three.js Community** - 3D rendering framework
- **React Team** - UI library
- **GSAP/GreenSock** - Animation library
- **Google Fonts** - Orbitron & Inter typefaces
- **F1 in Schools** - Competition platform
- **Beaulieu School** - Educational support

---

## License

Copyright © 2025 Team Ekleipsis. All rights reserved.

This project and its contents are proprietary to Team Ekleipsis. Unauthorized copying, modification, or distribution is prohibited.

---

<p align="center">
  <img src="logo.png" alt="Team Ekleipsis" width="80"/>
</p>

<p align="center">
  <strong>Built with passion by Team Ekleipsis</strong>
  <br/>
  F1 in Schools Jersey 2025
  <br/><br/>
  <em>"Ignite Innovation, Accelerate Success"</em>
</p>
