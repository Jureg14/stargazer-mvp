# Stargazer Agent Customization Directory (`.agents/`)

This directory contains workspace customizations for AI agents working on the **Stargazer** project within Google Antigravity.

---

## 📂 Structure Overview

```text
.agents/
├── README.md                              # This file
├── rules/                                 # Contextual & domain-specific workspace rules
│   ├── astronomy-domain.md                # Astronomical math, coordinates, twilight, celestial bodies
│   ├── weather-and-scoring.md             # Weather variables, scoring heuristics, window clustering
│   └── architecture-and-code-style.md     # Code style, Next.js App Router rules, typing, structure
└── skills/                                # On-demand specialized agent skills
    ├── astronomy-engine-guide/            # Guide for using astronomy-engine accurately
    │   ├── SKILL.md
    │   ├── references/api-reference.md
    │   └── examples/planet-visibility.ts
    ├── weather-forecast-integration/      # Open-Meteo & Meteoblue weather forecast integration
    │   ├── SKILL.md
    │   └── references/open-meteo-api.md
    └── satellite-and-events/              # ISS passes (satellite.js), meteor showers, and conjunctions
        ├── SKILL.md
        └── references/tle-and-iss.md
```

---

## 🧭 How Customizations Work

- **`rules/`**: Automatically loaded and applied to enforce mathematical domain constraints, scoring algorithms, and coding architecture.
- **`skills/`**: Modular on-demand workflows. Antigravity loads skill metadata (name and description) progressively, and activates the full skill when working on specialized features (e.g. astronomy ephemeris, satellite orbits, weather parsing).

---

## 🌟 Key Domain Objectives

1. **Precision**: Astronomical coordinates and rise/set times must use rigorous physics (J2000 epoch, atmospheric refraction, topocentric observer coordinates).
2. **Actionability**: Raw weather and orbital data must be distilled into human-friendly time windows and natural language summaries.
3. **Performance**: All computations should be lightweight, pure, and cacheable (via Redis/Vercel KV geohashes).
