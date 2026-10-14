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
- [x] Add `ImageWithFallback` component for broken images and smooth loading
- [x] Vitest unit tests for `useTheme` hook

### ?? Milestone 6: User Experience & Accessibility
- [x] Implement 'useTheme' hook for Dark/Light mode toggling with localStorage persistence
- [x] Add 'ToastNotification' component and 'useToast' hook for user feedback
- [x] Implement 'useGeolocation' hook to sort dealerships/cars by proximity
- [x] Add global Error Boundaries for graceful failure handling

### ✅ Milestone 7: Advanced Utilities & Enhancements
- [x] Add `useCopyToClipboard` hook to allow users to quickly copy VINs, share links, and seller contacts
- [x] Add `useThrottle` hook to limit update frequency for performance optimization
- [x] Add `useIdle` hook to detect user inactivity and optimize performance (e.g., pausing carousels or 360� viewers)
- [x] Add Vitest unit tests for ToastContainer component
- [x] Add useWindowSize hook to track window dimensions for responsive canvas/SVG elements
- [x] Add `Accordion` component and Vitest unit tests for interactive UI components
- [x] Add `Tabs` component and Vitest unit tests for better content organization

### ??? Milestone 8: Reusable UI Components
- [x] Extract generic Button component with variants, sizes, and loading state
- [x] Extract generic `Badge` component with variants and sizes
- [x] Extract generic `Alert` component with variants and closable state
- [x] Extract generic `Input` component with labels, error states, and icon support
- [x] Extract generic `Spinner` component with variants and sizes
- [x] Extract generic `Card` component for layout structure with Vitest unit tests
- [x] Extract generic `Switch` component for toggle inputs with Vitest unit tests
- [x] Extract generic `Checkbox` component with Vitest unit tests
- [x] Extract generic `Radio` component with Vitest unit tests
- [x] Extract generic `Select` component with Vitest unit tests
- [x] Extract generic `Textarea` component with Vitest unit tests
- [x] Extract generic `Avatar` component with Vitest unit tests
- [x] Extract generic `Progress` component with Vitest unit tests
- [x] Extract generic `ToggleGroup` component with Vitest unit tests
- [x] Extract generic `Skeleton` component for loading states with Vitest unit tests
- [x] Extract generic `Drawer` component (slide-out panel) with Vitest unit tests
- [x] Extract generic `Modal` component (dialog wrapper) with Vitest unit tests
- [x] Extract generic `Breadcrumbs` component for navigation with Vitest unit tests

### 🧩 Milestone 9: Advanced UI Components
- [x] Extract generic Table component with Vitest tests
- [x] Extract generic Slider component with Vitest tests
- [x] Extract generic `Dropdown` component with Vitest unit tests
- [x] Extract generic `Rating` component with Vitest unit tests

### 📈 Milestone 10: Advanced Image Galleries & Viewing
- [x] Extract generic `Carousel` component for vehicle image galleries with swipe support and Vitest tests
- [x] Extract generic `Tag` component with Vitest unit tests

### ?? Milestone 11: Complex Form Components
- [x] Extract generic Stepper component for multi-step forms with Vitest tests
- [x] Extract generic FileUpload component with drag and drop

- [x] Extract generic Autocomplete component for search and selection with Vitest tests

### 📊 Milestone 12: Data Visualization & Reporting
- [x] Extract generic StatCard component for dashboard metrics with Vitest tests
- [x] Extract generic Popover component with Vitest tests
- [x] Extract generic Sparkline component for trend visualization with Vitest tests
- [x] Extract generic Gauge component for score and valuation meters with Vitest tests
- [x] Extract generic BarChart component for vehicle market price distributions with Vitest tests

---

### ⚡ Milestone 13: Advanced Automotive Insights & Discovery
- [x] Implement `PriceHistoryModal` with interactive historical price trends and Vitest tests
- [x] Implement vehicle loan amortization matrix breakdown with Vitest tests
- [x] Add trade-in valuation estimator module with Vitest tests

---

### 🛡️ Milestone 14: Buyer Protection & Inspection Diagnostics (Completed)
- [x] Add comprehensive pre-purchase vehicle inspection (OBD-II / 150-point checklist) simulator with Vitest tests
- [x] Add import customs duty and excise tax calculator (DGK / Dövlət Gömrük Komitəsi tariff engine) with Vitest tests
- [x] Add stolen vehicle and lien registry verification mock database with Vitest tests

---

### 📄 Milestone 15: Legal Agreements & Transaction Security (Completed)
- [x] Add bilingual vehicle bill of sale & purchase contract generator (Notariat alqı-satqı müqaviləsi) with Vitest tests
- [x] Add compulsory & KASKO insurance premium estimator with policy comparison and Vitest tests
- [x] Add seller identity and digital escrow deposit holding simulator with Vitest tests

---

### 🔧 Milestone 16: Vehicle Ownership & Maintenance Lifecycle (Completed)
- [x] Add Digital Service Passport & Maintenance Schedule Planner (`ServicePassportModal.tsx`) with intervals, dealer vs certified shop cost estimator, overdue tracking, and Vitest tests
- [x] Implement vehicle maintenance schedule calculation engine (`src/utils/servicePassport.ts`) with mileage-based triggers, wear-and-tear degradation, localized service costs in AZN/USD/EUR, and Vitest tests
- [x] Add comprehensive mock service history records and official dealer service database (`src/data/mockServiceRecords.ts`) with dealer stamps, technician notes, and parts breakdown

---

### 🛡️ Milestone 17: Vehicle Safety Recalls & Technical Service Bulletins (TSB) Registry (Completed)
- [x] Add Manufacturer Safety Recall & TSB Registry (`RecallRegistryModal.tsx`) with VIN-based campaign verification, recall severity scoring, and dealer booking simulator
- [x] Implement recall audit engine (`src/utils/recalls.ts`) with defect risk analysis, remedy tracking, and clearance status verification
- [x] Add comprehensive mock manufacturer recall database (`src/data/mockRecallDatabase.ts`) covering vehicle models, recall bulletins (brakes, battery, powertrain, software), and official authorized service repair centers
- [x] Comprehensive Vitest unit tests for recall calculation engine and `RecallRegistryModal` component

---

### 🏛️ Milestone 18: State Roadworthiness & Technical Inspection (DYP Texniki Baxış) System (Completed)
- [x] Add State Roadworthiness & Electronic Diagnostic Talon (`TechnicalInspectionModal.tsx`) with BDYP E-Talon generation, validity countdown, and automated photo-radar penalty alert
- [x] Implement official legal inspection schedule & fees engine (`src/utils/technicalInspection.ts`) adhering to Article 30 of the Law on Road Traffic (0-4 yr exemption, 4-10 yr biennial, 10+ yr annual intervals, and multi-currency state duties)
- [x] Build comprehensive laboratory diagnostic simulator with brake force balance, exhaust gas analysis (CO%, HC ppm, lambda ratio, zero-emission EV check), and safety gear audit
- [x] Add official BDYP Inspection Centers database (`src/data/mockTechnicalInspection.ts`) and interactive queue booking system with live wait times and voucher generation
- [x] Comprehensive Vitest unit test suite covering legal rules, calculations, talon generation, booking engine, and modal interactions

---

### 🏛️ Milestone 19: Vehicle State Re-Registration & License Plate Registry (BDYP Qeydiyyat & Texpasport) (Completed)
- [x] Add Official State Vehicle Re-Registration & License Plate Registry (`VehicleRegistrationModal.tsx`) with plate visualizer, VIP number tier estimator, and ASAN/BDYP appointment booking
- [x] Implement legal state duties and ownership transfer engine (`src/utils/registration.ts`) adhering to the Law of Azerbaijan on State Duties (Texpasport replacement fee, standard vs VIP plate tariffs, EV/hybrid tax exemptions, and notary archiving fees)
- [x] Add comprehensive mock BDYP Registration Divisions database (`src/data/mockRegistrationData.ts`) covering Baku Zabrat, Qobu, Sumgayit, and Ganja regional hubs with live appointment slots and document checklist requirements
- [x] Interactive Azerbaijan license plate visualizer component with authentic blue EU/AZ strip, national flag, microchip indicator, and dynamic plate customization
- [x] Comprehensive Vitest unit test suite covering legal calculations, fee breakdowns, plate tariff validation, appointment generation, and modal interactions

---

### 🚨 Milestone 20: State Traffic Fines, Radar Protocols & Penalty Points Registry (BDYP Cərimələr, MMX Radarları & AsanPay Sistemi) (Completed)
- [x] Add Official State Traffic Fines & Radar Protocol Registry (`TrafficFinesModal.tsx`) with MMX CCTV photo telemetry simulation, legal article citations, and AsanPay / HÖP checkout simulator
- [x] Implement traffic fines calculation & demerit points audit engine (`src/utils/fines.ts`) with statutory 50% early payment discount countdown (30-day grace period), late penalty handling, and multi-currency conversions (AZN, USD, EUR)
- [x] Add statutory 12-point driver demerit scale breakdown (İXM Maddə 342.1-1: 12-point suspension threshold, risk categories: safe, warning, critical, suspended, and automatic 1-year expiration rule)
- [x] Add comprehensive mock traffic violation database (`src/data/mockFinesData.ts`) covering speeding radars (Traffistar SR590, MultaRadar CD), red lights, yellow bus lane encroachment, mobile phone/seatbelt cameras, and expired inspection ANPR gates
- [x] Official BDYP "Cərimə Borcunun Olmaması Haqqında Arayış" (Clean Record Certificate) generator with security verification code, validity period, and printable/downloadable format
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/fines.test.ts` and `src/components/__tests__/TrafficFinesModal.test.tsx`) covering calculations, discounts, points scale, payment simulation, and modal interactions

---

### 🚨 Milestone 21: Official 24/7 Roadside Assistance, Emergency Towing & Mobile Dispatch Network (156 Evakuator Xidməti & Təcili Yol Köməyi) (Completed)
- [x] Add Official 24/7 Roadside Assistance & Emergency Towing Network Modal (`RoadsideAssistanceModal.tsx`) with instant callout simulator, live GPS telemetry radar, driver card, and official e-voucher
- [x] Implement roadside assistance calculation & fleet dispatch engine (`src/utils/roadsideAssistance.ts`) covering flatbed towing, heavy manipulator cranes, booster jumpstart, on-site puncture vulcanization, emergency 10L fuel delivery, non-destructive lockout bypass, and sand/mud winch extraction
- [x] Add multi-tier location tariff calculation engine with 8km base coverage, per-km excess rates across 16 authentic Azerbaijan districts/corridors (Baku central, Absheron, Sumgayit, Shamakhi & Guba highway routes), vehicle body weight multipliers (SUV, Minivan, Commercial), and 30% night surge (22:00-07:00)
- [x] Add comprehensive mock roadside assistance database (`src/data/mockRoadsideData.ts`) covering 5 strategic depot bases in Baku & Absheron, 7 certified fleet tow trucks & mobile service vans with authentic Azerbaijani license plates (`99-EV-156`, `77-EV-156`), driver profiles, and sample active dispatches
- [x] Official electronic receipt & assistance voucher generator with unique reference code (`SOS-156-BAKU-XXXX`), security verification code, itemized VAT breakdown, and printable/copyable layout
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/roadsideAssistance.test.ts` and `src/components/__tests__/RoadsideAssistanceModal.test.tsx`) covering cost formulas, night detection, truck allocation, nearest depot resolution, tracking simulation, and modal interactions

---

### ⚡ Milestone 22: EV Charging Station Network & Smart Fast-Charge Calculator (Azərişıq & TokBaku Elektromobil Doldurma Şəbəkəsi) (Completed)
- [x] Add Official EV Charging Station Network & Smart Fast-Charge Simulator Modal (`EvChargingModal.tsx`) with Station Radar, Smart BMS Calculator, Live Session Simulator, Green Highway Corridors, and E-Receipt voucher
- [x] Implement EV charging calculation & BMS thermal throttling engine (`src/utils/evCharging.ts`) with multi-stage tapering (0-60%, 60-80%, 80-90%, 90-100% trickle balance), 800V architecture support, multi-currency tariffs, petrol cost comparison, and CO2 savings
- [x] Add comprehensive mock EV charging station database (`src/data/mockEvStations.ts`) covering 8 strategic hubs in Baku (Port Baku, Deniz Mall, Airport, Genclik Mall, Sea Breeze) and regions (Sumgayit, Quba M1 Corridor, Ganja Mall) with authentic GB/T DC, CCS2, and Type 2 connectors
- [x] Add intercity Green Corridors route planning module with battery reachability calculator and highway fast-charging stop recommendations
- [x] Official TokBaku / Azərişıq electronic charging voucher & receipt generator with unique session reference (`TB-AZ-2026-XXXX`), VAT breakdown, and printable/copyable layout
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/evCharging.test.ts` and `src/components/__tests__/EvChargingModal.test.tsx`) covering formulas, BMS curves, currency conversions, route reachability, station filters, simulation lifecycle, and modal interactions

---

### 🅿️ Milestone 23: Official Smart City Parking Radar & AYNA AzParking Tariff Engine (AzParking Dövlət Parklanma Sistemi & Şəhər Parklanma Radar) (Completed)
- [x] Add Official Smart City Parking Locator & AYNA AzParking Tariff Engine Modal (`AzParkingModal.tsx`) with Parking Radar, Smart Tariff Calculator, Live Session Simulator, E-Receipt & Parking Talon, and Resident Permit Eligibility Checker
- [x] Implement official statutory parking tariff calculation & exemption engine (`src/utils/azParking.ts`) adhering to AYNA regulations (Zone 1: 1.00 AZN, Zone 2: 0.70 AZN, Zone 3: 0.40 AZN, Zone 4: 0.20 AZN, 15-minute grace period, free Sunday exemption, 22:00-07:00 night window exemption, EV green incentive, and multi-currency conversions)
- [x] Build official AzParking SMS command generator (`1181` shortcode) formatted as `<PLATE> <ZONE_CODE> <HOURS>` with one-click clipboard copying
- [x] Add comprehensive mock Baku parking lots database (`src/data/mockParkingData.ts`) covering 12 strategic lots across Sabail, Nasimi, Yasamal, Narimanov, Khatai, Nizami, and Binaqadi districts with live capacity, occupancy percentages, CCTV, and EV charger bays
- [x] Official electronic AzParking parking receipt and talon generator with unique reference code (`AZPARK-2026-XXXX`), security verification code, barcode telemetry, and printable layout
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/azParking.test.ts` and `src/components/__tests__/AzParkingModal.test.tsx`) covering tariffs, exemptions, grace periods, SMS command formatting, session simulation, ticket generation, and modal interactions

---

### ⛽ Milestone 24: Fuel Station Network & Smart Trip Fuel Calculator (SOCAR, Azpetrol & Tarif Şurası Rəsmi Yanacaq Şəbəkəsi və Səyahət Xərci Simulyatoru) (Completed)
- [x] Add Official Fuel Station Radar & Smart Trip Fuel Calculator Modal (`FuelStationModal.tsx`) with Station Radar, Intercity Route Cost Simulator, Full Tank & Banking Cashback Engine, E-Fuel Fiscal Voucher, and Official Tarif Şurası Price Matrix
- [x] Implement official State Tariff Council (Tarif Şurası) price engine & route calculation formulas (`src/utils/fuelStations.ts`) covering Aİ-92 (1.10 AZN), Dizel (1.00 AZN), Aİ-95 Premium (1.60 AZN), Aİ-98 Super (2.30 AZN), CNG (0.45 AZN/m³), LPG (0.65 AZN), dynamic AC/passenger/traffic/cargo consumption multipliers, and CO2 emissions
- [x] Implement Azerbaijan Tax Ministry 18% VAT & 17.5% cashless "ƏDV Geri Al" consumer refund calculator alongside banking partner cashback rates (Birbank 5%, TamKart 4%, Leobank 3%, SOCAR Club 1.5%, Azpetrol Qırmızı Kart 1.0%)
- [x] Add comprehensive mock fuel stations database (`src/data/mockFuelStations.ts`) covering 12 strategic stations in Baku (Heydar Aliyev Ave, Babek Ave, Tbilisi Ave, Nobel Ave, Airport Highway, Ziya Bunyadov) and regional highways (M1 Sumgayit km 45, M2 Kurdamir km 168, M3 Salyan km 62, M4 Shamakhi pass km 88) with 24/7 hours, fuel inventory, and amenities
- [x] Add 6 authentic Azerbaijan intercity highway transit corridors with distance, duration, elevation, and recommended waypoint fuel stations (Baku-Ganja, Baku-Quba, Baku-Shaki, Baku-Shusha, Baku-Lankaran, Baku City Commute)
- [x] Official electronic fiscal fuel receipt & voucher generator with unique reference code (`SOCAR-AZ-2026-XXXX` / `AZPETROL-AZ-2026-XXXX`), security hash, barcode telemetry, VAT & cashback breakdown, and printable layout
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/fuelStations.test.ts` and `src/components/__tests__/FuelStationModal.test.tsx`) covering calculations, tariffs, multipliers, refunds, cashback, filters, voucher generation, and modal interactions

---

### 🛣️ Milestone 25: Official Motor Toll Highway Network & Electronic Toll Collection System (AAYDA Bakı-Quba M1 Ödənişli Avtomagistralı, E-Toll RFID Transponder & Yol Haqqı Kalkulyatoru) (Completed)
- [x] Add Official Toll Highway Radar & Smart Trip Fare Calculator Modal (`TollRoadModal.tsx`) with Toll Gate Radar, Smart Trip Calculator, Virtual E-Toll RFID Transponder Simulator, and Official Fiscal Transit Voucher
- [x] Implement official statutory toll tariff engine (`src/utils/tollRoads.ts`) adhering to AAYDA & Cabinet of Ministers regulations (Category 1: 0.07 AZN/km for passenger cars, Category 2: 0.15 AZN/km for medium trucks/buses, Category 3: 0.25 AZN/km for heavy TIR multi-axle freight) with multi-currency conversions
- [x] Implement payment method discount structures with 10% RFID FastPass rebate, 5% Mobile QR E-Pass rebate, and automated 50 km/s toll barrier passage simulation
- [x] Add highway economic benefits calculation engine: 130 km/s speed limit transit times vs 60 km/s congested R-1 road, time savings (up to 70+ minutes), fuel economy savings (~1.4L / 100km), and CO2 emission reductions
- [x] Add comprehensive mock AAYDA toll plazas database (`src/data/mockTollRoads.ts`) covering 7 authentic toll points along the 147 km tollway (Yaşma km 45, Giləzi km 73, Siyəzən km 103, Qəndob km 130, Quba km 160, Qusar km 178, Samur km 192) with live queue telemetry and amenities
- [x] Official electronic fiscal toll transit receipt generator with unique reference code (`AAYDA-M1-2026-XXXXX`), security hash, barcode telemetry, vehicle plate, timestamps, and printable layout
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/tollRoads.test.ts` and `src/components/__tests__/TollRoadModal.test.tsx`) covering statutory tariffs, discounts, passage simulation, top-ups, receipts, filters, and modal interactions



