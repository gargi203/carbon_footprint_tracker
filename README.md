# EcoTrack AI - Environmental Sustainability Copilot

EcoTrack AI is an intelligent sustainability web application designed to help individuals calculate, understand, and reduce their carbon footprint through practical actions and personalized AI-driven insights.

## Chosen Vertical
Environmental Sustainability

## Problem Statement
Climate change is accelerated by greenhouse gas emissions, yet many individuals find it challenging to connect their daily lifestyle choices (commutes, dietary habits, home heating, and online shopping) with concrete environmental impacts. Existing footprint tools are often static, offering one-off scores rather than continuous tracking, active habit-building, and personalized action plans.

## Solution Overview
EcoTrack AI addresses this by functioning as an intelligent sustainability copilot:
1. **Interactive Lifestyle Questionnaire**: Assesses Transportation, Home Energy, Food Habits, and Consumption habits.
2. **Dynamic Carbon Score Engine**: Computes annual CO₂ emissions (in kg and metric tons), outputs category breakdowns, and assigns a relative Sustainability Rating.
3. **AI Sustainability Assistant**: Synthesizes the carbon breakdown and suggests direct, high-impact suggestions, prioritized dynamically by the user's highest emission sectors.
4. **Smart Goal System**: Connects recommendation alerts directly to goal tracking where users set targets and track carbon reductions over time.
5. **Weekly Eco Challenges**: Promotes immediate, gamified actions (e.g. No-Car Day, Meat-Free Monday) that award Eco Points and unlock badges.

---

## Key Features

- **Personalized AI Advisor Panel**: Applies rule-based reasoning to analyze carbon breakdowns. If transport emissions represent $>40\%$ of the total, transport recommendations are boosted to the top of the feed and challenge priorities.
- **Interactive Recharts Visualizations**: 
  - **Donut Chart**: Real-time breakdown of emissions split by category.
  - **Historical Area Chart**: Shows weekly emissions trends, pre-populating a realistic 5-week history upon onboarding completion to give visual continuity.
- **Relatable Equivalencies**: Translates metric tons of CO₂ into number of trees needed to absorb it, equivalent smartphone charges, and driving distance in standard cars.
- **Gamified Achievements & Levels**: Earn points by checking off goals and challenges. Level up from "Eco Novice" to "Climate Champion", unlocking custom achievement badges like "Watt Saver" or "Consistent Champion".
- **Responsive Glassmorphism Styling**: Visually premium responsive layout with dark mode adaptations, smooth transitions, custom scrollbars, and accessible outline indicators.
- **Accessibility Standard Compliance**: Formulated with semantic landmarks (`<header>`, `<nav>`, `<main>`, `<footer>`), explicit label associations, ARIA attributes, keyboard-friendly page routing, and reduced-motion stylesheet fallbacks.

---

## Technology Stack

- **Framework**: React 19 + Vite 8 + TypeScript
- **State Management**: React Context (`EcoTrackContext` with local storage persistence)
- **Styling**: Tailwind CSS v4 (Zero-config CSS theme engine)
- **Data Visualization**: Recharts (Responsive charts library)
- **Icons**: Lucide Icons

---

## Assumptions & Calculation Factors
Emissions are measured in **kg CO₂ / year**, based on EPA, greenhouse gas protocol, and utility averaging standards:

### 1. Transportation
*   **Commute Distance**: Daily km $\times$ 365.
    *   *Petrol Car*: 0.18 kg CO₂ / km
    *   *Diesel Car*: 0.17 kg CO₂ / km
    *   *Hybrid Car*: 0.11 kg CO₂ / km
    *   *Electric Car*: 0.04 kg CO₂ / km (assuming grid charging)
    *   *Motorcycle*: 0.10 kg CO₂ / km
*   **Public Transit**: Constant annual offset based on usage frequency:
    *   *Daily*: 219 kg CO₂
    *   *Often*: 109 kg CO₂
    *   *Rarely*: 22 kg CO₂
*   **Aviation**:
    *   *Short-haul (< 3 hours)*: 450 kg CO₂ per flight
    *   *Long-haul (> 3 hours)*: 1400 kg CO₂ per flight

### 2. Home Energy
*   **Electricity**: Monthly usage (kWh) $\times$ 12 $\times$ average grid factor of 0.45 kg CO₂/kWh. Sourcing renewables reduces this base score proportionally.
*   **Air Conditioning**: Daily run hours $\times$ 365 $\times$ average AC compressor load (1.2 kW) $\times$ 0.45 kg CO₂/kWh. Offset by the user's renewable energy percentage.

### 3. Food Habits
*   **Diet Type**: Constant annual baseline:
    *   *Vegan*: 900 kg CO₂ / year
    *   *Vegetarian*: 1400 kg CO₂ / year
    *   *Mixed (Average)*: 2400 kg CO₂ / year
    *   *Meat-Heavy*: 3300 kg CO₂ / year

### 4. Shopping & Waste
*   **Online Shopping**:
    *   *Rare*: 150 kg CO₂ / year
    *   *Average*: 450 kg CO₂ / year
    *   *Frequent*: 900 kg CO₂ / year
*   **Waste & Recycling**: Base waste output of 350 kg CO₂ / year is reduced by:
    *   *Recycling All*: -280 kg CO₂
    *   *Recycling Some*: -140 kg CO₂
*   **Single-use Plastics**:
    *   *Low*: 40 kg CO₂ / year
    *   *Medium*: 120 kg CO₂ / year
    *   *High*: 250 kg CO₂ / year

---

## Setup Instructions

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation
1. Clone or download the repository files.
2. Navigate to the project root and install dependencies:
   ```bash
   npm install
   ```

### Running Locally
To launch the Vite hot-reloading development server:
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to view the application.

### Production Build
To generate the optimized production package:
```bash
npm run build
```

---

## Future Improvements
- **Real-time API integrations**: Fetch localized grid carbon intensities or flight transit footprints via carbon calculator APIs (e.g. Climatiq or Carbon Interface).
- **Machine Learning Recommendations**: Incorporate reinforcement learning models to adapt recommendations based on what challenges users actually check off.
- **Community Eco Challenges**: Social scoreboards and multiplayer eco-milestones to connect users with neighbors.
- **Smart Meter Integration**: Feed real-time utility smart meter telemetry directly into energy usage statistics.
