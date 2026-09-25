# 🚗 AutoNext Pro — Autonomous Automotive Marketplace & Intelligence Platform

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/Mister-Robot-Cat/AutoNext)
[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)

**AutoNext Pro** is a high-performance, next-generation automotive marketplace and valuation ecosystem designed and developed by [@Mister-Robot-Cat](https://github.com/Mister-Robot-Cat). It combines machine learning price intelligence, an interactive digital damage inspection framework, multi-criteria comparison engine, and localized real-time auto-financing.

---

## ✨ Core Innovations & Engineering Highlights

```
┌────────────────────────────────────────────────────────────────────────┐
│                          AutoNext Pro Platform                         │
├──────────────────┬──────────────────┬──────────────────┬───────────────┤
│   AI Valuation   │ Comparison Matrix│  Inspection Map  │ Auto-Finance  │
│    (AutoValue)   │  (Multi-Vehicle) │  (Paint/Damage)  │ (Bank Rates)  │
└──────────────────┴──────────────────┴──────────────────┴───────────────┘
```

### 1. 🤖 AutoValue™ AI Pricing Engine
- **Fair-Price Classification:** Analyzes real-time historical market datasets, vehicle specifications, mileage, and condition scores.
- **Dynamic Valuation Badges:** 
  - `Great Deal` (Below market median by 5-15%)
  - `Good Deal` (Below market median by 2-5%)
  - `Fair Market Price` (Within standard deviation)
  - `Overpriced` (Above historical averages)
- **Confidence Scoring:** Real-time AI confidence index based on listing sample density and feature verification.

### 2. 📊 Multi-Vehicle Comparison Matrix
- **Side-by-Side Analysis:** Live side-by-side comparison of up to 4 vehicles simultaneously.
- **Automated Advantage Highlighting:** Intelligently tags top performers for:
  - Optimal price per model year
  - Maximum horsepower & powertrain output
  - Lowest fuel consumption (L/100km or EV equivalents)
  - Lowest verified odometer mileage
  - Verified bodywork status

### 3. 🛡️ InspectScan™ Digital Damage & Paint Map
- **Granular Panel Checklist:** Interactive visual breakdown of 11 critical exterior structural zones (hood, bumpers, doors, fenders, roof, trunk).
- **Condition Tiers:**
  - `Factory Paint` (Zavod / Bezkraska)
  - `Cosmetic Paint` (Minor surface scratch touch-ups)
  - `Replaced Part` (OEM / aftermarket panel replacement)
  - `Damage Flagged` (Requires body shop inspection)

### 4. 🏦 Integrated Auto-Loan & Leasing Engine
- **Real Bank Programs:** Integrated loan formulas with real terms from Kapital Bank, ABB, and Unibank.
- **Instant Financial Projections:** Dynamic monthly payment calculations, total interest paid, bank commissions, and minimum income thresholds.

### 5. 🌐 Multi-Currency & Full Trilingual Localization
- **Currencies:** Seamless instant toggle between **AZN (₼)**, **USD ($)**, and **EUR (€)** with automatic rate conversion.
- **Languages:** Comprehensive native support for **Azərbaycan dili (AZ)**, **English (EN)**, and **Русский (RU)**.

---

## 🛠️ Architecture & Tech Stack

- **Client Runtime:** React 19 + TypeScript (Strict typing enabled)
- **Styling Architecture:** Tailwind CSS with modern glassmorphism design system
- **Build System:** Vite 8 (Ultra-fast HMR and optimized production bundling)
- **Icons & Visuals:** Lucide React
- **Code Quality:** Oxlint + TypeScript Compiler

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/Mister-Robot-Cat/AutoNext.git
cd AutoNext
npm install
```

### 2. Development Mode

```bash
npm run dev
```

Open `http://localhost:5173` to explore the application.

### 3. Production Build

```bash
npm run build
```

Generates optimized, production-ready static assets in `dist/`.

---

## 📁 Project Structure

```text
autonext/
├── public/                 # Static assets and icons
├── src/
│   ├── assets/             # Brand logos & imagery
│   ├── components/
│   │   ├── CarCard.tsx           # Interactive car card with gallery preview
│   │   ├── CarComparator.tsx     # Side-by-side comparison matrix
│   │   ├── CarDetailModal.tsx    # Detailed inspection & seller view
│   │   ├── FairPriceBadge.tsx    # AI price status badge
│   │   ├── FilterBar.tsx         # Multi-criteria search & quick toggles
│   │   ├── LoanCalculatorModal.tsx # Bank financing calculator
│   │   └── Navbar.tsx            # Navigation, currency & language switchers
│   ├── data/
│   │   └── mockVehicles.ts       # Comprehensive automotive dataset
│   ├── types/
│   │   └── vehicle.ts            # Domain TypeScript models
│   ├── utils/
│   │   └── i18n.ts               # Multi-language & currency utilities
│   ├── App.tsx                   # Master platform layout & state orchestration
│   ├── index.css                 # Base theme & Tailwind imports
│   └── main.tsx                  # Application entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 👤 Author

Developed by **[@Mister-Robot-Cat](https://github.com/Mister-Robot-Cat)**.

All rights reserved © 2026 AutoNext Pro.
