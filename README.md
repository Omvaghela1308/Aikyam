# MineGuard — AI-Based Multi-Hazard Underground Mining Safety System

> **Tagline:** *Sense. Connect. Protect.*  
> **Initiative:** Smart India Hackathon (SIH) — SIH 206  
> **Tech Stack:** Next.js (App Router), TypeScript, Tailwind CSS, Lucide React, Recharts  

---

## Overview

**MineGuard** is an advanced AI-powered underground mine safety and telemetry monitoring platform. Integrating smart safety jackets, multi-gas optical sensor arrays (NDIR H2S, CH4, CO), sub-surface environmental telemetry, and sub-meter UWB mesh positioning, MineGuard safeguards miners in real time.

The dashboard UI is inspired by modern light-mode web designs (such as Unstop.com), providing an intuitive, distraction-free interface for mine controllers, ground supervisors, and rapid rescue squads.

---

## Design System & Aesthetic Principles

- **Color Palette:**
  - **Canvas Background:** `#EEF3FA` (Soft cool-grey page background)
  - **Floating Content Panel:** Pure white (`#FFFFFF`) with `rounded-[24px]` radius, subtle border (`#E3EAF5`), and delicate elevation
  - **Primary Blue:** `#0284C7` (Sky 600)
  - **Accent Blue:** `#0EA5E9` (Sky 500)
  - **Soft Blue Tint:** `#E0F2FE` (Sky 100)
  - **Border Gray:** `#E3EAF5`
  - **Heading Text:** `#0F172A` (Slate 900)
  - **Muted Text:** `#475569` (Slate 600)
  - **Status Fix:** Safe (`#22C55E`), Warning (`#F59E0B`), Danger (`#EF4444`)
- **Typography:**
  - **Primary Sans:** `Inter` (Google Fonts) for clean, readable headings & body text
  - **Monospace:** `JetBrains Mono` for sensor model IDs, jacket codes, telemetry figures, and timestamps
- **Component Primitives:**
  - **Headings:** Large and bold, highlighting a key action word in primary blue (`#0284C7`)
  - **Section Headers:** Vertical thin blue indicator line (`w-1.5 h-6 bg-[#0284C7] rounded-full`) on the left, with an outline pill "View All" button on the right
  - **Pastel Category Tiles:** `rounded-[20px]` soft pastel cards (Light Blue, Peach, Yellow, Green, Lavender) displaying core metrics
  - **Pill Buttons:** `rounded-full` primary sky blue and secondary outline variants
  - **Initials Avatars:** Pure initials avatar without photos (e.g., "RK", "VS"), `#E0F2FE` background, `#0284C7` bold text, with optional status ring (green/amber/red)

---

## Navigation & Page Structure

| Route | Page | Description |
|---|---|---|
| `/` | **Home Dashboard** | Hero banner, pastel telemetry tiles, active workers summary, and multi-gas cards |
| `/workers` | **Live Workers** | Filterable grid of underground crew jackets, biometrics, and gas exposure |
| `/sensors/gas` | **Gas & H2S Sensors** | NDIR H2S, CH4, CO, and O2 levels across mine shafts with critical thresholds |
| `/sensors/vitals` | **Worker Vitals** | Heart rate, blood SpO2, core body temperature, and fatigue scores |
| `/sensors/environment` | **Mine Environment** | Ambient temperature, relative humidity, ventilation CFM, and micro-seismic sensors |
| `/sensors/radiation` | **Radiation & Radon** | Deep borehole Gamma flux and Radon ingress detection |
| `/sensors/location` | **UWB Location Grid** | Sub-meter 3D RF anchor network status and positioning beacons |
| `/map` | **Worker Map** | 2.5D schematic sub-surface gallery map showing worker positions and refuge bays |
| `/alerts` | **Safety Hazard Alerts** | Prioritized incident log with acoustic buzzer & evacuation triggers |
| `/rescue` | **Rescue Command** | Emergency response squad dispatch, refuge chamber comms, and mine-wide evac |

---

## Role Switcher

Using the **"You're viewing as"** selector in the sidebar, users can toggle between three operational roles:
1. **Supervisor** — Central Command, safety oversight, sensor calibrations
2. **Worker** — Smart jacket telemetry HUD, self biometrics, and personal hazard alerts
3. **Rescue Team** — Emergency dispatch, sub-surface extraction, and rapid response units

---

## Getting Started

### Prerequisites
- Node.js 18.18+ or 20+
- npm 10+

### Installation
```bash
# Clone the repository and enter directory
cd "sih 206"

# Install dependencies
npm install

# Run the development server
npm run dev
```

Open (https://aikyam1.vercel.app/) with your browser to explore the MineGuard dashboard.

### Building for Production
```bash
npm run build
npm run start
```

---

## 📄 License
Developed for Smart India Hackathon (SIH 206). All rights reserved.
