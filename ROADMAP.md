# 🗺️ AutoNext Engineering Roadmap & Evolution Backlog

This backlog is actively maintained and executed by the **GitHub Growth Agent** to drive continuous, high-quality development.

---

### ✅ Milestone 1: Platform Foundation & Core Modules (Completed)
- [x] Scaffolding with React 19, TypeScript, Vite & Tailwind CSS
- [x] AutoValue™ AI Fair-Price evaluation engine
- [x] Multi-Vehicle live comparison matrix
- [x] Local bank financing calculator (Kapital Bank, ABB, Unibank)
- [x] Digital damage & paint inspection map
- [x] Persistent favorites/watchlist with LocalStorage
- [x] Multi-currency engine (AZN, USD, EUR) & trilingual localization (AZ, EN, RU)
- [x] Vitest unit test suite for financial formulas & valuation logic

---

### 🚀 Milestone 2: Architecture Modularization & Custom Hooks (In Progress)
- [x] Extract `useVehicleFilter` hook to decouple search/filter logic from `App.tsx`
- [x] Extract `useWatchlist` hook with sync across browser tabs
- [x] Extract `useCarComparison` hook with limit checks and persistent draft
- [x] Extract `useLoanCalculator` hook to clean up Modal logic
- [x] Extract `useLocalStorage` hook to standardize persistent state & cross-tab syncing
- [x] Extract `usePreferences` hook to persist language & currency preferences across sessions
- [x] Extract `useShare` hook to enable native Web Share API with clipboard fallback
- [x] Create `useRecentlyViewed` hook to track recently viewed cars with limit
- [x] Extract `useSavedSearches` hook to allow users to save and quickly load filter configurations
- [x] Extract `useMediaQuery` hook to enable responsive conditional rendering
- [x] Extract `useClickOutside` hook to manage dropdown and modal closures
- [x] Extract `useScrollLock` hook to prevent body scrolling when modals are open
- [x] Extract `useKeyPress` hook for global keyboard shortcuts (e.g. Escape to close modals)

---

### 🎨 Milestone 3: Interactive Visual Experiences
- [x] 360° exterior vehicle rotation simulator (interactive dragging or slider)
- [x] High-resolution fullscreen lightbox image viewer with zoom
- [x] Real-time price depreciation curve chart (SVG/Canvas based)
- [x] Add `ScrollToTop` component for quick navigation and micro-interaction polish
- [x] Add `Tooltip` component for rich UI micro-interactions

---

### 🔍 Milestone 4: Trust & Transparency Verification
- [x] VIN Vehicle History Timeline (CARFAX / AutoCheck equivalent with odometer graph)
- [x] Verified Dealership Profile pages (Toyota Abşeron, Baku Prestige, Autolux)
- [x] Seller contact response time badges & verification checks

---

### 🧪 Milestone 5: Testing & Performance Optimization
- [x] Comprehensive Vitest unit tests for `FilterBar` logic & search ranking
- [x] Vitest unit tests for `LightboxViewer` component
- [x] Vitest unit tests for `useWatchlist` hook
- [x] Vitest unit tests for `CarCard` component
- [x] Vitest unit tests for `PriceDepreciationChart` component
- [x] Vitest unit tests for `Navbar` component
- [x] Vitest unit tests for `LoanCalculatorModal` component
- [x] Vitest unit tests for `VinHistoryModal` component
- [x] Vitest unit tests for `CarRotationViewer` component
- [x] Skeleton loaders for image gallery and car card loading states
- [x] Lighthouse 95+ score optimization (image preloading, dynamic bundle chunking)
- [x] Scroll fade-in animations via `useIntersectionObserver` for micro-interaction polish
- [x] Vitest unit tests for `DealershipProfileModal` component
- [x] Vitest unit tests for `CarDetailModal` component
- [x] Vitest unit tests for `useSavedSearches` hook
- [x] Vitest unit tests for `CarCardSkeleton` component
- [x] Add `usePagination` hook and `Pagination` component to limit vehicle grid rendering
- [x] Vitest unit tests for `useClickOutside` hook
