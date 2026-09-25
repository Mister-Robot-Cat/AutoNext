# 🚗 AutoNext — Next-Gen Smart Automotive Marketplace

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/Mister-Robot-Cat/AutoNext)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)

> **AutoNext** is an intelligent, transparent automotive marketplace and car valuation platform built specifically to solve the long-standing UX, transparency, and pricing issues of traditional classifieds like **Turbo.az** in Azerbaijan.

---

## ⚡ Why AutoNext? (AutoNext vs. Turbo.az)

| Feature | 🔴 Traditional Classifieds (Turbo.az) | 🟢 AutoNext Pro |
| :--- | :--- | :--- |
| **Pricing Intelligence** | ❌ Arbitrary seller pricing, no fair-value guidance | ✅ **AI Fair-Price Valuation Engine** (indicates % below/above Baku market average) |
| **Car Comparison** | ❌ None. Users must open 15 separate tabs | ✅ **Live Side-by-Side Comparison Matrix** (compares specs, highlights winners in green) |
| **Damage & Paint Inspection** | ❌ Vague text descriptions ("vuruğu yoxdur") | ✅ **Digital Damage & Inspection Map** (interactive body parts showing paint/repairs) |
| **Loan & Financing** | ❌ Rough external links or outdated estimates | ✅ **Built-in Bank Financing Calculator** (real Kapital Bank, ABB, Unibank rates in AZN) |
| **AI Advisor** | ❌ None | ✅ **GPT-Powered Car Matchmaker** (finds cars by lifestyle, fuel economy & budget) |
| **Currency Support** | ⚠️ Mostly single-currency with manual conversions | ✅ **Instant Multi-Currency Switcher** (AZN ₼, USD $, EUR €) |
| **Modern UX/UI** | ❌ Cluttered 2010-era design with banner ads | ✅ **Sleek, dark glassmorphic interface**, zero clutter, mobile-first responsive |
| **Languages** | ⚠️ Limited multi-lingual navigation | ✅ Full **Azərbaycan (AZ)**, **English (EN)**, **Русский (RU)** localization |

---

## 🌟 Key Features

### 1. 🤖 AI Market Price Valuation
Every vehicle is automatically evaluated against real-time Baku historical sales data. Buyers immediately see badges such as:
- **Great Deal** (e.g. *7.5% below market*)
- **Good Deal**
- **Fair Market Price**
- **Overpriced** with confidence rating.

### 2. 📊 Side-by-Side Vehicle Comparison Matrix
Select up to 4 vehicles simultaneously. The comparison engine automatically identifies and highlights:
- Lowest price per year
- Highest horsepower (hp)
- Lowest fuel consumption (L / 100km)
- Lowest verified mileage
- Detailed paint and damage comparison

### 3. 🔍 Interactive Digital Damage Map
Inspect vehicles with complete peace of mind. Every listing contains an interactive breakdown of critical vehicle panels (hood, bumpers, doors, roof, fenders) with condition classifications:
- `Zavod rəngi` (Original factory paint)
- `Kosmetik rəng` (Cosmetic paint / minor scratches)
- `Dəyişilib` (Replaced part)
- `Zədəlidir` (Needs repair)

### 4. 🏦 Real-time Bank Auto-Loan Calculator
Calculate actual monthly payments in AZN directly inside vehicle details:
- Integrated rates from **Kapital Bank**, **ABB**, and **Unibank**.
- Adjustable down payment (15% to 80%) and loan terms (12 to 60 months).
- Accurate breakdown of principal, bank interest, commission, and required minimum income.

### 5. 💡 AI Car Matchmaker & Advisor
Users can ask natural questions like *"Find me an economical hybrid SUV under 40,000 AZN"* and receive curated vehicle recommendations with full technical justification.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript
- **Bundler & Tooling:** Vite 8
- **Styling:** Tailwind CSS + Custom Glassmorphism Theme
- **Icons:** Lucide React
- **CI/CD:** GitHub Actions (Automated build, lint verification & scheduled maintenance workflows)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18 or higher, v22 recommended)
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Mister-Robot-Cat/AutoNext.git

# Navigate to project folder
cd AutoNext

# Install dependencies
npm install

# Start local development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

### Production Build

```bash
npm run build
```

---

## 🗺️ Roadmap

- [x] Scaffolding with React 19, Vite, Tailwind CSS & TypeScript
- [x] Domain models for vehicles, inspection reports, price valuations & loans
- [x] Azerbaijan localized vehicle dataset (Baku, Ganja, Sumgait dealerships)
- [x] Multi-currency converter (AZN, USD, EUR) & i18n localization (AZ, EN, RU)
- [x] AI Fair-Price evaluation badge system
- [x] Side-by-side vehicle comparison tool
- [x] Local bank financing & leasing calculator
- [x] Digital damage & paint inspection map
- [x] AI automotive matchmaker advisor
- [x] Automated CI/CD and scheduled market health workflow
- [ ] Backend API integration with real-time Azerbaijan VIN databases
- [ ] 360-degree interactive vehicle exterior viewer

---

## 📄 License

This project is licensed under the MIT License — feel free to use and expand!
Developed with passion by [@Mister-Robot-Cat](https://github.com/Mister-Robot-Cat).
