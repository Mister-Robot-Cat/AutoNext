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

---

### 🕶️ Milestone 26: Official Vehicle Window Tinting & Light Transmittance Permit System (BDYP Qanuni Şüşə Tündləşdirmə "Plyonka" İcazəsi, İşıqburaxma Fotometri & E-İcazə Portalı) (Completed)
- [x] Add Official Window Tinting Legal Standards & Annual Permit Modal (`WindowTintModal.tsx`) with Glass Tint Visualizer, Optical Photometer Simulator, Legal Compliance Checker, and BDYP E-İcazə Certificate
- [x] Implement statutory light transmittance and annual permit tariff engine (`src/utils/windowTint.ts`) adhering to Article 342.2-2 of the Code of Administrative Offences, Cabinet of Ministers regulations, seasonal curtain rules (1 May - 15 Nov), and multi-currency state duties
- [x] Build interactive vehicle glass tint simulator with Visible Light Transmission (VLT%) sliders for windshield, front sides, rear sides, and rear glass with real-time compliance diagnostics
- [x] Add statutory state duty fee matrix (Fiziki şəxs / Hüquqi şəxs, arxa yan şüşələr vs bütün arxa şüşələr, 1-il etibarlılıq müddəti və ASAN xidmət bank komissiyası)
- [x] Official electronic BDYP window tinting permit certificate generator with unique state registration code (`BDYP-PL-2026-XXXXX`), QR security hash, photometer tolerance stamps, and printable layout
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/windowTint.test.ts` and `src/components/__tests__/WindowTintModal.test.tsx`) covering statutory calculations, VLT compliance checks, photometer measurements, certificate generation, and modal interactions

---

### 🚗 Milestone 27: Official Europrotocol Minor Traffic Accident Settlement & Digital Claim Registry (İSB & BDYP Rəsmi Avroprotokol Sistemi, Sadələşdirilmiş Qəza Qeydiyyatı, Zərər Qiymətləndirilməsi & Elektron Təzminat Portalı) (Completed)
- [x] Add Official Europrotocol Minor Accident Settlement & Claim Portal (`EuroprotocolModal.tsx`) with Statutory Eligibility Checker, Crash Scenario Selector, Damage Estimator, Party Information, and Official E-Protocol Voucher
- [x] Implement Article 53-1 statutory Europrotocol eligibility & insurance payout engine (`src/utils/europrotocol.ts`) with 2-vehicle rule, zero bodily injury enforcement, active compulsory policy audit, 1,000 AZN statutory compensation ceiling, multi-currency conversion, and 7-day payment guarantee
- [x] Add comprehensive mock Europrotocol database (`src/data/mockEuroprotocolData.ts`) covering 8 authentic Azerbaijani accident scenarios (rear-end, roundabout yield, lane change, reversing, door opening, rollback, intersection yield, mutual fault), 18 damage parts with Baku repair shop labor & replacement rates, 8 licensed insurers (PAŞA, Qala, Atəşgah, Meqa, Xalq, Bakı, Azsığorta, Günay), and sample active claims
- [x] Official electronic simplified accident notice & voucher generator with unique reference code (`ISB-AVRO-2026-XXXXX`), digital security checksum, QR verification representation, itemized damage tally, and one-click copy & ISB submission simulation
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/europrotocol.test.ts` and `src/components/__tests__/EuroprotocolModal.test.tsx`) covering statutory conditions, liability allocations, payouts, damage calculations, and interactive modal workflows

---

### 📜 Milestone 28: Official Electronic Vehicle Power of Attorney & Notarial Trust Portal (Ədliyyə Nazirliyi & ASAN Notariat Rəsmi Elektron Etibarnamə Sistemi, İdarəetmə və Baş Etibarnamə Reyestri & BDYP Canlı İnteqrasiyası) (Completed)
- [x] Add Official Electronic Vehicle Power of Attorney & Notarial Trust Portal (`PowerOfAttorneyModal.tsx`) with Authority Scope Selector, Statutory Fee Calculator, Grantor/Grantee Verification Dossier, BDYP Real-time Police Telemetry, Electronic Notarial Certificate with QR, and Active Power of Attorney Revocation Registry
- [x] Implement statutory notary tariff & state duty calculation engine (`src/utils/powerOfAttorney.ts`) adhering to Article 26 of the Law of Azerbaijan on State Duties, Civil Code (Articles 362-368), and Law on Notaries (Driving only vs Full disposal, close relative reduction, sub-delegation permissions, cross-border border clearance, and multi-currency conversions)
- [x] Add comprehensive mock power of attorney database (`src/data/mockPoaData.ts`) covering 8 authorized state and ASAN notary offices in Baku, Sumgayit, and Ganja, authentic persona presets (Family member, Personal driver, Commercial representative, Full disposal vehicle sale), and active sample power of attorney records with real-time validity tracking
- [x] Build official electronic notarial certificate generator with Ministry of Justice coat of arms, notary registry serial number (`ETB-NOT-2026-XXXXX`), digital security QR code hash, ASAN Imza / SİMA biometric stamp, and printable layout
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/powerOfAttorney.test.ts` and `src/components/__tests__/PowerOfAttorneyModal.test.tsx`) covering statutory fee calculations, relationship discounts, duration limits, FIN validation, cross-border rules, certificate generation, revocation simulation, and modal interactions

---

### 🌍 Milestone 29: Official International Cross-Border Vehicle Transit & Green Card Insurance Portal (İSB Rəsmi "Yaşıl Kart" / Green Card Beynəlxalq Sığorta Portalı, Dövlət Sərhəd Buraxılış Məntəqələri Radar, Yaşıl Kart Tarif Kalkulyatoru & Elektron Sığorta Polisi) (Completed)
- [x] Add Official International Cross-Border Vehicle Transit & Green Card Insurance Portal (`GreenCardModal.tsx`) with Statutory Tariff Calculator, Border Checkpoints Radar, Cross-Border Compliance Checklist, Official Digital Green Card Certificate with QR & Barcode, and DGK Electronic Customs Transit Declaration
- [x] Implement statutory Green Card tariff & currency conversion engine (`src/utils/greenCard.ts`) adhering to Chapter X of the Law of Azerbaijan on Compulsory Insurances and Council of Bureaux (CoB) regulations across 3 official zones (Zone 1: All 47 CoB member countries; Zone 2: Regional 7 countries; Zone 3: Georgia & Turkey corridor), 5 vehicle categories (passenger, motorcycle, minibus, truck, trailer), and 5 duration tiers (15 days to 1 year) with multi-currency conversions (AZN, USD, EUR)
- [x] Add comprehensive mock Green Card & Border Telemetry database (`src/data/mockGreenCardData.ts`) covering 7 authentic state border checkpoints (Qırmızı Körpü, Samur, Sədərək, Mazımqara, Biləsuvar, Astara, Culfa) with live queue status, lanes, highway corridors, distance from Baku, 6 licensed İSB member insurers (PAŞA, Qala, Atəşgah, Meqa, Xalq, Bakı), and statutory cross-border checklist items
- [x] Build authentic international Green Card certificate generator with green-card layout, Council of Bureaux international matrix, policy number (`AZ/ISB-GC-2026-XXXXX`), security hash, barcode telemetry, and DGK electronic border transit declaration (`DGK-TR-2026-XXXXX`)
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/greenCard.test.ts` and `src/components/__tests__/GreenCardModal.test.tsx`) covering statutory tariffs, currency conversions, border readiness scoring, fuel and transit estimates, policy generation, and interactive modal workflows

---

### 🚖 Milestone 30: Official AYNA Taxi Fleet Compliance, Regulatory Standards & Electronic Carrier Pass Portal (AYNA Rəsmi Taksi Buraxılış Portalı, Standartlara Uyğunluq Yoxlaması, E-Buraxılış Vərəqəsi & Aqreqator Gəlir Kalkulyatoru) (Completed)
- [x] Add Official AYNA Taxi Compliance & Electronic Carrier Pass Modal (`TaxiComplianceModal.tsx`) with Vehicle Compliance Auditor, Ride-Hailing Income Simulator, Regulatory Equipment Checklist, Official E-Buraxılış Vərəqəsi Certificate, and AYNA Training Centers Radar
- [x] Implement statutory AYNA taxi regulation & financial calculation engine (`src/utils/taxiCompliance.ts`) adhering to Cabinet of Ministers Decision No. 94 and AYNA technical regulations (8-year/15-year age ceiling, Euro-5 standard, mandatory equipment matrix, statutory state duties under Law on State Duties, multi-currency conversions)
- [x] Build ride-hailing aggregator financial simulator with Bolt, Yango, Uber AZ, and 189 commission rates, daily shifts, fuel/EV consumption, vehicle wear reserve, and net monthly take-home projections in AZN, USD, EUR
- [x] Add comprehensive mock taxi compliance database (`src/data/mockTaxiData.ts`) covering 8 authorized AYNA inspection & driver training hubs (Baku Heydar Aliyev Ave, Darnagul, Badamdar, Sumgayit, Ganja), regulatory checklists, certified equipment providers, and active licensed taxi fleet registry
- [x] Build authentic official electronic taxi pass ("AYNA E-Buraxılış Vərəqəsi") generator with unique QR verification code (`AYNA-TX-2026-XXXXX`), Ministry of Digital Development and Transport / AYNA coat of arms, carrier VÖEN, vehicle plate, driver FIN, validity countdown, and printable/copyable layout
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/taxiCompliance.test.ts` and `src/components/__tests__/TaxiComplianceModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`) covering compliance evaluations, age calculations, fee structures, aggregator net income projections, pass generation, and modal interactions

---

### 🔧 Milestone 31: Official Vehicle Constructive Modification, LPG/CNG Autogas Conversion & Tuning Certification Portal (BDYP & AZS Rəsmi Konstruktiv Dəyişiklik, Qazbalon / LPG-CNG Quraşdırılması, Tüninq Sertifikatlaşdırma & Texpasport Qeydiyyat Şəhadətnaməsi Portalı) (Completed)
- [x] Add Official BDYP & AZS Constructive Modification, Autogas & Tuning Certification Modal (`TuningComplianceModal.tsx`) with Constructive Modification Configurator, Exhaust Decibel (dBA) & Suspension Clearance Telemetry Stand, LPG/CNG Autogas ROI Calculator, Accredited AZS Laboratories Booking, and Official Constructive Safety Certificate Generator
- [x] Implement statutory constructive modification & telemetry compliance engine (`src/utils/tuningCompliance.ts`) adhering to İXM Articles 342.2-1 & 342.3, Law on Road Traffic (Annex 1), and AZS 597 / AZS 636 State Standards (84 dBA acoustic ceiling, +50mm lift threshold, Texpasport "Xüsusi qeydlər" endorsement generator, and state duty calculations)
- [x] Build interactive LPG (Euro-4 & Direct Injection) and CNG (Methane 0.45 AZN/m³) autogas amortization & ROI calculator comparing against Tarif Şurası Aİ-92, Aİ-95, and Aİ-98 petrol tariffs with monthly/annual savings, payback months, and 5-year net profit in AZN, USD, EUR
- [x] Add comprehensive mock tuning & autogas database (`src/data/mockTuningData.ts`) covering 12 constructive modifications (LPG/CNG, M/AMG body kits, ARB off-road bumpers & winches, snorkels, lift kits, sport mufflers, prohibited cut springs, straight-pipe exhausts, and non-lens xenon), 6 accredited AZS/BDYP laboratories across Baku, Khirdalan, Sumgayit, and Ganja, and verifiable registry certificates
- [x] Build official BDYP Constructive Safety Certificate generator (`BDYP-KD-2026-XXXXX`) with AZS lab protocol stamp, Texpasport special endorsement preview, QR verification hash, and live registry verification search
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/tuningCompliance.test.ts` and `src/components/__tests__/TuningComplianceModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### ♻️ Milestone 32: Official State Vehicle Utilization, Eco-Scrappage Voucher & Recycling Portal ("Təmiz Şəhər" ASC & İqtisadiyyat Nazirliyi Köhnə Avtomobillərin Utilizasiyası Dövlət Proqramı, Utilizasiya Rüsumu Kalkulyatoru, Güzəşt Vauçeri & Təsdiqedici Sənəd Portalı) (Completed)
- [x] Add Official "Təmiz Şəhər" ASC Vehicle Utilization & Eco-Scrappage Voucher Modal (`VehicleScrappageModal.tsx`) with Discount Voucher & 70% Cash Payout Calculator, Local Assembly Vehicle Catalog, DYP & DGK Utilization Fee Calculator, 10-Point Completeness Audit, Collection Centers Radar, and Official Confirmation Certificate Generator
- [x] Implement statutory utilization fee & scrappage payout engine (`src/utils/vehicleScrappage.ts`) adhering to Article 14-1 of the Law on Waste ("Tullantılar haqqında" AR Qanunu) and Cabinet of Ministers Decisions No. 11-13 (DYP periodic technical inspection utilization fees 0-40 AZN, DGK customs import utilization fees 400-2,000 AZN, EV eco-exemptions, 1,500-3,000 AZN state vouchers, and 70% lump-sum cash payouts)
- [x] Add comprehensive mock scrappage database (`src/data/mockScrappageData.ts`) covering 10 technical completeness components, 6 locally manufactured/assembled vehicles (BYD Sumgayit, Chevrolet Cobalt/Onix Hajigabul Azərmaş, Khazar Neftchala, JAC JS4, GAZelle NEXT), 6 authorized "Təmiz Şəhər" ASC regional acceptance centers, and verifiable confirmation certificates
- [x] Build official "Təmiz Şəhər" ASC Confirmation Certificate generator (`TS-UTL-2026-XXXXX`) with BDYP deregistration code (`BDYP-CX-2026-XXXXX`), QR verification hash, and live unified registry lookup
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/vehicleScrappage.test.ts` and `src/components/__tests__/VehicleScrappageModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### 🚨 Milestone 33: Official State Vehicle Impound Lot, Municipal Towing Protocol & Electronic Release Portal (BDYP & AYNA Rəsmi Müvəqqəti Mühafizə Olunan Duracaq / Cərimə Meydançası Axtarışı, Qanuni Evakuasiya Yoxlayıcısı, Tarif Şurası Saxlanma Haqqı Kalkulyatoru və Elektron Buraxılış Qəbzi Portalı) (Completed)
- [x] Add Official BDYP & AYNA Vehicle Impound Lot & Electronic Release Modal (`ImpoundLotModal.tsx`) with Plate/VIN Impound Telemetry Search, Tariff Council Cost Calculator, İXM Article 96 Legality Auditor, BDYP Impound Lots Radar, and AsanPay E-Buraxılış Release Pass Generator
- [x] Implement statutory impound fee & towing legality audit engine (`src/utils/impoundLot.ts`) adhering to İXM Articles 96, 150.11, 332, 333, and 346 and Tariff Council of Azerbaijan decisions (20/40/60 AZN towing fees, 1/2/3 AZN daily storage rates, 3-hour free grace period, 50% early fine discount, and Article 96.2 / 96.10 unlawful towing exoneration)
- [x] Add comprehensive mock impound database (`src/data/mockImpoundData.ts`) covering 7 statutory violation rules, 7 official BDYP & AYNA impound lots across Baku (20-ci Sahə, Dərnəgül, Badamdar, Babək), Xırdalan, Sumqayıt, and Gəncə, active impound records with door seal (`PLOMB`) telemetry, and verifiable release passes
- [x] Build official BDYP & AsanPay Electronic Release Authorization Pass generator (`BDYP-CM-2026-XXXXX`) with 6-digit gate barrier PIN code, QR security hash, and live unified registry lookup
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/impoundLot.test.ts` and `src/components/__tests__/ImpoundLotModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### 🚌 Milestone 34: Official AYNA Dedicated Bus Lanes, Baku Special Traffic Regime & Electronic Entry Permit Portal (AYNA & BDYP Avtobus Zolaqları Radarı — İXM Maddə 327.1-1 Manevr Auditoru, Bakı Şəhərinə Giriş-Çıxış Xüsusi Rejimi, Elektron Tərəzi / Qabarit Nəzarəti və Rəqəmsal Giriş Buraxılış Vərəqəsi Portalı) (Completed)
- [x] Add Official AYNA Bus Lane, Baku Special Entry Regime & WIM Electronic Scale Modal (`SpecialTrafficRegimeModal.tsx`) with Bus Lane Maneuver Auditor, Baku Bus Lane Corridors Radar, Daytime Entry & WIM Overweight Calculator, and AYNA Electronic Entry Pass Generator
- [x] Implement statutory bus lane compliance & Baku entry/WIM weight audit engine (`src/utils/specialTrafficRegime.ts`) adhering to YHQ Article 48, İXM Article 327.1-1 (100 AZN fine & 2 penalty points, 1.11 dashed turn pocket exemption, 7.5.4/7.5.2 operating hours), Cabinet of Ministers YHTK Baku daytime truck restriction (`07:00–22:00` summer / `07:00–21:00` winter for >5t GVW), and İXM Article 353 Electronic Scale (WIM) overweight fines (600 / 1,400 / 4,000 AZN)
- [x] Add comprehensive mock Baku special traffic database (`src/data/mockSpecialTrafficData.ts`) covering 8 authentic AYNA dedicated bus lane corridors (Heydər Əliyev pr., Babək pr., Tbilisi pr., Neftçilər pr., Ziya Bünyadov pr., Mikayıl Müşfiq küç., Rəşid Behbudov küç., Yusif Səfərov küç.), 5 BDYP Baku entry gates with WIM electronic scales, and verifiable AYNA electronic entry passes
- [x] Build official AYNA Electronic Baku Entry & Transit Pass generator (`AYNA-EB-2026-XXXXX`) with QR security hash, authorized corridor routing, VÖEN/FİN validation, and unified registry lookup
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/specialTrafficRegime.test.ts` and `src/components/__tests__/SpecialTrafficRegimeModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### 🪪 Milestone 35: Official BDYP & ASAN Driver's License Category Auditor, Towing (B vs BE) Weight Calculator, International Driving Permit (IDP) & Exam Simulator Portal (BDYP & ASAN Xidmət Sürücülük Vəsiqəsi Portalı — YHQ Maddə 33–35 Kateqoriya Uyğunluğu, Qoşqu B/BE Kalkulyatoru, Dövlət Rüsumu & Nəzəri İmtahan Simulyatoru) (Completed)
- [x] Add Official BDYP & ASAN Driver's License Category, Towing & Exam Modal (`DriverLicenseModal.tsx`) with Category & Trailer (`B` vs `BE`) Auditor, ASAN State Duty & Validity Calculator, 10-Question BDYP Theoretical Exam Simulator, MERO & ASAN Centers Radar, and Electronic License Extract Generator
- [x] Implement statutory driver's license category & towing compliance engine (`src/utils/driverLicense.ts`) adhering to YHQ Articles 33–35 (categories `A1`, `A`, `B`, `BE`, `C1`, `C`, `CE`, `D1`, `D`, ≤750 kg light trailer exemption, >750 kg combined >3,500 kg or >curb weight `BE` requirement, `AT` automatic transmission restriction, age/validity rules) and İXM Article 332 fine risk matrix (100 / 200 / 300 AZN)
- [x] Implement "Law on State Duties" Article 18 fee & validity duration calculator covering first-time issuance (20 + 30 AZN), ASAN expiry renewal (30 AZN), 1968 Vienna Convention International Driving Permit (IDP — 30 AZN, 3-year validity), foreign license exchange, and Forma AZS-083 medical e-certificate rules
- [x] Add comprehensive mock BDYP driver's license & exam database (`src/data/mockDriverLicenseData.ts`) covering 9 statutory categories, 10 authentic YHQ theoretical exam ticket questions (9/10 pass threshold), 6 BDYP MERO & ASAN centers across Baku, Sumgayit, Ganja, and Lankaran, and verifiable electronic license records
- [x] Build official BDYP Electronic Driver's License & IDP Extract generator (`AZE-SV-XXXXXX` / `IDP-AZ-2026-XXXXX`) with QR security hash and live unified registry lookup
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/driverLicense.test.ts` and `src/components/__tests__/DriverLicenseModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### 🛞 Milestone 36: Official BDYP Tire Standards (YHQ Annex 1 Section V), Tread Depth Telemetry Auditor, Rim/Tire Equivalence & Mountain Winter Readiness Portal (BDYP & YHQ Əlavə 1 Rəsmi Şin Standartları, Protektor Dərinliyi Auditoru — İXM Maddə 342.1.5, Şin/Disk Ölçü Ekvivalentliyi & Qış Dağ Aşırımları Radarı) (Completed)
- [x] Add Official BDYP Tire Standards, Tread Depth & Mountain Winter Readiness Modal (`TireComplianceModal.tsx`) with 4-Wheel Tread Depth Auditor, OEM vs Target Tire/Rim Size Calculator, Azerbaijan Mountain Pass Winter Radar, Tire Service & 3D Alignment / Tire Hotel Calculator, and Electronic Tire Compliance Certificate Generator
- [x] Implement statutory tire compliance & dimensional equivalence engine (`src/utils/tireCompliance.ts`) adhering to YHQ Annex 1 Section V (1.6 mm M1 passenger, 1.0 mm truck, 2.0 mm bus, 0.8 mm motorcycle minimum tread limits, 4.0 mm mountain winter M+S/3PMSF threshold, mixed axle prohibition, sidewall cord damage, DOT age audit), İXM Article 342.1.5 (50 AZN fine), and İXM Article 342.2-1 (±3.0% outer diameter tolerance / 150 AZN constructive modification risk)
- [x] Add comprehensive mock tire & mountain pass database (`src/data/mockTireData.ts`) covering 6 authentic Azerbaijan winter mountain corridors (M-4 Ağsu Pass, R-1 Qusar–Şahdağ–Laza, R-19 Toğanalı–Kəlbəcər Murovdağ, R-22 İsmayıllı–Qəbələ Tufandağ, R-25 Şəmkir–Gədəbəy Yasamal Pass, R-48 Lənkəran–Lerik), 6 accredited 3D alignment & Tire Hotel service centers across Baku, Sumgayit, and Ganja, and verifiable compliance certificates
- [x] Build official BDYP & AZS Electronic Tire Roadworthiness Certificate generator (`BDYP-SHIN-2026-XXXXX`) with QR verification hash and live unified registry lookup
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/tireCompliance.test.ts` and `src/components/__tests__/TireComplianceModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### 💡 Milestone 37: Official BDYP Vehicle Lighting Standards (YHQ Annex 1 Section III), Xenon/LED/Bi-LED Legality Auditor, Optical Regloscope Stand & Special Beacon Portal (BDYP & AZS Rəsmi Xarici İşıq Cihazları Standartları, Ksenon/LED Qanunilik Auditoru — İXM Maddə 342.2-1 / 342.1.4 / 342.9, Fara Reqloskop Stendi & ABŞ/Yaponiya Fara Konversiyası Portalı) (Completed)
- [x] Add Official BDYP Vehicle Lighting Standards, Xenon/LED Auditor & Optical Regloscope Modal (`HeadlightComplianceModal.tsx`) with Housing Stamp & Bulb Compatibility Auditor, Kelvin Spectrum Slider, Laser Regloscope & Luxmeter Stand, US/JDM Conversion Calculator, and Official BDYP-FARA-2026 Certificate Generator
- [x] Implement statutory headlight compliance & optical regloscope telemetry engine (`src/utils/headlightCompliance.ts`) adhering to YHQ Annex 1 Section III (Clauses 3.1–3.6), YHQ Article 74, UNECE R48/R112, and İXM Articles 342.1.4 (50 AZN), 342.2-1 (150 AZN + operation prohibition for non-projector Xenon/LED, >6000K blue tint, or smoked tail lights), and 342.9 (500–800 AZN + device confiscation for unauthorized red/blue strobe beacons)
- [x] Add comprehensive mock vehicle lighting database (`src/data/mockHeadlightData.ts`) covering 5 headlamp housing optical markings (`HCR`, `DC/DCR`, `LED/MD`, `DOT/SAE`, `JDM RHD`), 6 light source types, 6 accredited optical calibration & AZS laboratory centers across Baku, Khirdalan, Sumgayit, and Ganja, and verifiable compliance certificates
- [x] Build official BDYP & AZS Optical Headlight Compliance Certificate generator (`BDYP-FARA-2026-XXXXX`) with QR verification hash and live unified registry lookup
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/headlightCompliance.test.ts` and `src/components/__tests__/HeadlightComplianceModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### 🧯 Milestone 38: Official BDYP & FHN Mandatory Emergency Safety Kit (YHQ Annex 1 Section VII), Child Restraint System (CRS / ISOFIX — YHQ Article 37 & İXM Article 327.2), Cargo/Towing Compliance & Safety Certificate Portal (BDYP & FHN Qəza Təchizatı — Odluq OP-2/OU-2, Səhiyyə Nazirliyi Tibbi Çantası, Qəza Üçbucağı, Uşaq Avtokreslosu İSOFIX & Yük/Yedək Qaydaları Portalı) (Completed)
- [x] Add Official BDYP & FHN Emergency Safety Kit, Child Restraint (ISOFIX) & Passenger Compliance Modal (`PassengerSafetyModal.tsx`) with Fire Extinguisher & Medical Box Auditor, Child Seat (CRS / i-Size) & Passenger Capacity Calculator, Cargo Overhang / Towing Cable Auditor, FHN Accredited Supply Centers, and Official BDYP-TEH-2026 Certificate Generator
- [x] Implement statutory emergency safety equipment, child restraint, and cargo/towing compliance engine (`src/utils/passengerSafety.ts`) adhering to YHQ Annex 1 Section VII (Clause 7.7), YHQ Articles 37, 43, 56, and 57, and İXM Articles 342.1.7 (50 AZN fine for missing fire extinguisher, first aid kit, or warning triangle), 327.2 (60 AZN + 3 penalty points for transporting children <12 in front seat without CRS or passenger overload), and 329.1 (40 AZN MMX AI camera seatbelt fine)
- [x] Add comprehensive mock passenger safety database (`src/data/mockPassengerSafetyData.ts`) covering 5 vehicle regulatory classes (`M1`, `N1`, `M2`, `M3`, `N2/N3`), 6 fire extinguisher options (`OP-1`, `OP-2`, `OU-2 CO2`, `OP-5`, `Aerozol`), 6 mandatory Ministry of Health automotive medical box items, 6 FHN & BDYP accredited supply & ISOFIX centers across Baku, Khirdalan, Sumgayit, and Ganja, and verifiable compliance certificates
- [x] Build official BDYP & FHN Electronic Safety Equipment & Passenger Compliance Certificate generator (`BDYP-TEH-2026-XXXXX`) with QR verification hash and live unified registry lookup
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/passengerSafety.test.ts` and `src/components/__tests__/PassengerSafetyModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### 🌿 Milestone 39: Official BDYP & ETSN "Təmiz Hava" Exhaust Emissions (YHQ Annex 1 Section VI — CO/CH & Smoke Opacity), Catalytic Converter & DPF/AdBlue Integrity Auditor, İXM Article 342.5 Penalty Calculator & Electronic Eco-Compliance Certificate Portal (BDYP & ETSN "Təmiz Hava" Ekoloji Nəzarət Portalı — YHQ Əlavə 1 Bölmə VI Zəhərli Qazların Normativləri, İXM Maddə 342.5 Cərimə Auditoru, Katalizator / DPF / AdBlue Diaqnostikası, Qazanalizator / Tüstümər Stendi & Rəsmi Ekoloji Uyğunluq Sertifikatı) (Completed)
- [x] Add Official BDYP & ETSN Exhaust Emissions, Gas Analyzer Stand & Catalyst/DPF Compliance Modal (`EmissionsComplianceModal.tsx`) with 5-Gas Analyzer & Diesel Smoke Opacimeter Simulator, Catalytic Converter & DPF/OBD-II Integrity Auditor, Annual CO₂ Footprint & Euro-4/5/6 Class Calculator, ETSN & BDYP Accredited Laboratories Radar, and Official BDYP-EKO-2026 Certificate Generator
- [x] Implement statutory exhaust emission norms & catalytic converter/DPF telemetry engine (`src/utils/emissionsCompliance.ts`) adhering to YHQ Annex 1 Section VI (Clauses 6.1–6.5), Cabinet of Ministers Decision No. 92 (Euro-4+ ecological standard), and İXM Articles 342.5 (50 AZN individual fine / 25 AZN 30-day AsanPay discount) & 342.6/348 (150 AZN fleet official liability)
- [x] Add comprehensive mock exhaust emissions & catalyst database (`src/data/mockEmissionsData.ts`) covering 6 engine emission categories (`petrol_catalyst`, `petrol_uncatalyzed`, `lpg_cng`, `diesel_turbo_dpf`, `diesel_standard`, `electric`), 7 OBD-II emission fault codes (`P0420`, `P0430`, `P2002`, `P2463`, `P0401`, `P20EE`, `P0130`), 5 Baku catalyst/DPF restoration packages, 6 accredited ETSN/BDYP laboratories across Baku, Khirdalan, Sumgayit, and Ganja, and verifiable eco-certificates
- [x] Build official BDYP & ETSN Electronic Ecological Compliance Certificate generator (`BDYP-EKO-2026-XXXXX`) with QR verification hash and live unified registry lookup
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/emissionsCompliance.test.ts` and `src/components/__tests__/EmissionsComplianceModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### 🛑 Milestone 40: Official BDYP Braking System & Steering Mechanism Roadworthiness Portal (YHQ Annex 1 Sections I & II — MAHA Barabanlı Tormoz Stendi, Fiziki Dayanma Məsafəsi Simulyatoru, Sükan Lüftometr Stendi, İXM Maddə 342.2 / 96.1.4 İstismarın Qadağan Edilməsi və Rəsmi BDYP-TRM-2026 Sertifikatı) (Completed)
- [x] Add Official BDYP Braking System, Steering Luftometer & Stopping Physics Modal (`BrakeSteeringModal.tsx`) with MAHA IW-2 Roller Brake Tester Simulator, Steering Play Angle Auditor, Real-Time Stopping Distance Physics & DOT-4 Boiling Point Auditor, Accredited BDYP/Bosch Laboratories Radar, and Official BDYP-TRM-2026 Certificate Generator
- [x] Implement statutory braking & steering compliance engine (`src/utils/brakeSteeringCompliance.ts`) adhering to YHQ Annex 1 Section I (Clauses 1.1–1.5: ≤14.7m M1 / ≤18.3m truck/bus stopping distance at 40 km/h, ≥5.8 m/s² deceleration, ≤15% front / ≤20% rear axle imbalance, 16% full-load / 23% M1 / 31% truck curb-weight handbrake slope hold), Section II (Clauses 2.1–2.3: ≤10° M1 / ≤20° bus / ≤25° truck steering play angle), and İXM Articles 342.2 (150 AZN fine), 348 (200/600 AZN official/entity liability), & 96.1.4 (operation prohibition & impound tow)
- [x] Add comprehensive mock braking & steering database (`src/data/mockBrakeSteeringData.ts`) covering 5 vehicle classes (`M1`, `N1`, `N2/N3`, `M2/M3`, `L3`), 3 Baku road surface friction profiles, 4 DOT brake fluid specs (`DOT-3`, `DOT-4`, `DOT-4 LV`, `DOT-5.1`), 5 Baku brake/steering repair packages, 6 accredited BDYP & Bosch/MAHA roller stand laboratories across Baku, Khirdalan, Sumgayit, and Ganja, and verifiable certificates
- [x] Build official BDYP & AZS Electronic Brake & Steering Stand Certificate generator (`BDYP-TRM-2026-XXXXX`) with QR security hash and live unified registry lookup
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/brakeSteeringCompliance.test.ts` and `src/components/__tests__/BrakeSteeringModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### 👁️ Milestone 41: Official BDYP Driver Visibility, Windshield Integrity, Wipers & Acoustic Horn ("FİFA" Prohibition) Compliance Portal (YHQ Annex 1 Sections IV & VII — Alın Şüşəsi Zona-A Çat Ekspertizası, Şüşəsilən Tezlik Stendi, Qış Şüşəyuyan Donma Testi, UNECE R28 Səs Siqnalı / Polifonik "FİFA" & SGU Qadağası — İXM Maddə 342.2-1 / 342.9 / 96.1.4 və Taxoqraf Plomb Nəzarəti) (Completed)
- [x] Add Official BDYP Driver Visibility, Windshield, Wipers & Acoustic Horn Modal (`VisibilityHornComplianceModal.tsx`) with Windshield Zone-A Crack Auditor, Wiper Frequency & Winter Washer Freeze Simulator, UNECE R28 Acoustic Horn ("FİFA" / SGU) & Tachograph Auditor, Restoration Cost Calculator, Accredited BDYP/AZS Centers Radar, and Official BDYP-GOR-2026 Certificate Generator
- [x] Implement statutory visibility, wiper, and acoustic horn compliance engine (`src/utils/visibilityHornCompliance.ts`) adhering to YHQ Annex 1 Section IV (Clauses 4.1–4.2: ≥35 cpm wiper frequency, working washer pump & winter freeze protection, İXM Article 96.1.4 immediate operation prohibition if driver wiper fails during rain/snow) and Section VII (Clauses 7.1–7.5: Zone-A driver sweep windshield crack ban, UNECE R28 93–112 dBA horn sound pressure, İXM 342.2-1 150 AZN fine for polyphonic "FİFA" horns, İXM 342.9 800 AZN + confiscation for unauthorized SGU sirens, İXM 329.3 30 AZN unnecessary residential honking, digital tachograph seal, and rear mudguards)
- [x] Add comprehensive mock visibility, glass & acoustic database (`src/data/mockVisibilityHornData.ts`) covering 4 windshield inspection zones, 6 acoustic horn specifications, 4 seasonal washer fluid grades, 6 restoration packages, 6 accredited BDYP & AZS glass/acoustic/tachograph centers across Baku, Sumgayit, and Ganja, and verifiable certificates
- [x] Build official BDYP & AZS Electronic Visibility & Acoustic Compliance Certificate generator (`BDYP-GOR-2026-XXXXX`) with QR security hash and live unified registry lookup
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/visibilityHornCompliance.test.ts` and `src/components/__tests__/VisibilityHornComplianceModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### 🔍 Milestone 42: Official BDYP Engine/VIN Criminalistic Forensic Stand, License Plate Optical Readability (İXM Maddə 342.1.3 vs 342.7 Anti-Radar/Curtain Frame Auditor), SRS Airbag "Obmanka" (2.2 Ω Resistor) Detector & Fluid Hermeticity Portal (BDYP Mühərrik Nömrəsi Texpasport Ekspertizası — YHQ Maddə 27 / Əlavə 1 Bənd 7.15, DQN 20m Oxunuş & Kvadrat Nömrə Tip-2 / RFID Çip Stendi, SRS Piropatron Saxtakarlığı və Yanacaq/Yağ Sızması Portalı) (Completed)
- [x] Add Official BDYP Engine/VIN Forensic, License Plate Readability & SRS Airbag Modal (`ForensicPlateComplianceModal.tsx`) with Texpasport vs Engine Block Serial Auditor, DQN 20m/40m Visibility & İXM 342.7 Anti-Radar/Curtain Frame Auditor, SRS Airbag 2.2 Ω "Obmanka" Resistor Fraud & Fluid Hermeticity Stand, Meyvəli MERO & Justice Forensic Centers Radar, and Official BDYP-EKS-2026 Certificate Generator
- [x] Implement statutory engine/VIN forensic, license plate optical readability, and SRS/fluid hermeticity compliance engine (`src/utils/forensicPlateCompliance.ts`) adhering to YHQ Article 27 & Annex 1 Clauses 6.1, 7.2, 7.8, and 7.15, AZS 598, Criminal Code Article 320, and İXM Articles 342.1.3 (40 AZN dirty/unlit plate or bent Type-1 plate in US/JDM square recess), 342.2-1 (150 AZN undeclared engine swap), and 342.7 (500–800 AZN + 4 penalty points for IR anti-radar film, remote magnetic/curtain frames, or missing plates)
- [x] Add comprehensive mock forensic, license plate, and SRS/fluid database (`src/data/mockForensicPlateData.ts`) covering 5 engine forensic profiles, 6 license plate condition specs, 6 statutory fee & restoration packages, 6 accredited BDYP MERO & Ministry of Justice forensic laboratories across Baku, Khirdalan, Sumgayit, and Ganja, and verifiable `BDYP-EKS-2026-XXXXX` certificates
- [x] Build official BDYP Criminalistic Forensic & DQN Compliance Certificate generator (`BDYP-EKS-2026-XXXXX`) with UHF RFID Tag UID, QR security hash, and live unified registry lookup
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/forensicPlateCompliance.test.ts` and `src/components/__tests__/ForensicPlateComplianceModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### 🎨 Milestone 43: Official BDYP & ADRA Exterior Bodywork, Vinyl Wrap Color Endorsement (YHQ Article 27 — >30% Surface / 10-Day Rule), Vehicle Advertising (Law on Advertising Art. 26 & İXM Art. 342.1.8) & Tow Hitch ("Farkop") / Bullbar ("Kenguryatnik") Compliance Portal (BDYP & ADRA Kuzov Rəng Dəyişikliyi, Tutqun/Xameleon Vinil Plonka Qeydiyyatı, Nəqliyyat Üzərində Reklam Ekspertizası, Farkop / Kenguryatnik / Dam Baqajı Normativləri və Rəsmi BDYP-KUZ-2026 Sertifikatı) (Completed)
- [x] Add Official BDYP & ADRA Exterior Bodywork, Vinyl Wrap, Advertising & Farkop Modal (`BodyworkAdvertisingModal.tsx`) with >30% Surface & 10-Day MERO Color Endorsement Auditor, ADRA Vehicle Advertising Auditor, Farkop/Kenguryatnik/Roof Cargo Stand, MERO & ADRA Centers Radar, and Official BDYP-KUZ-2026 Certificate Generator
- [x] Implement statutory bodywork color/wrap, advertising, and exterior hardware compliance engine (`src/utils/bodyworkAdvertisingCompliance.ts`) adhering to YHQ Article 27 (>30% color/matte wrap 10-day Texpasport endorsement & Clear PPF exemption), YHQ Annex 1 Clauses 6.1, 7.6, 7.11, and 7.14, Law on Advertising Article 26, and İXM Articles 342.1.3 (40 AZN plate-blocking farkop), 342.1.8 (50 AZN / 150–300 AZN vehicle advertising violation), 342.2-1 (150 AZN undeclared color/wrap or steel kenguryatnik), and 342.9 (800 AZN prohibited operative police/ambulance livery)
- [x] Add comprehensive mock bodywork, vinyl wrap, ADRA advertising, and farkop database (`src/data/mockBodyworkAdvertisingData.ts`) covering 6 body wrap profiles, 5 advertising regulation profiles, 5 exterior hardware profiles, 5 service packages, 6 accredited BDYP MERO, ADRA & AZS centers across Baku, Khirdalan, Sumgayit, and Ganja, and verifiable `BDYP-KUZ-2026-XXXXX` certificates
- [x] Build official BDYP & ADRA Exterior Bodywork & Advertising Compliance Certificate generator (`BDYP-KUZ-2026-XXXXX`) with QR verification hash and live unified registry lookup
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/bodyworkAdvertisingCompliance.test.ts` and `src/components/__tests__/BodyworkAdvertisingModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### ⏱️ Milestone 44: Official AYNA & BDYP Digital Tachograph, Driver Work & Rest Regime (NK Decision No. 73 / AETR — 4.5h / 9h Rules), 24-Month Metrological Calibration & «E-Uğur» Electronic Waybill Portal (AYNA & BDYP Rəqəmsal Taxoqraf, Sürücü İş və İstirahət Rejimi — NK Qərar № 73 / AETR, 24 Aylıq AZS Kalibrasiya Plombu, Reysöncəsi Tibbi Müayinə və «E-Uğur» Elektron Yol Vərəqəsi Portalı) (Completed)
- [x] Add Official AYNA & BDYP Digital Tachograph, Driver Work/Rest Regime & E-Uğur Waybill Modal (`TachographWorkRestModal.tsx`) with AETR 4.5h/9h/56h Simulator, 24-Month Metrological Seal & Speed Limiter Stand, Seated Passenger & E-Uğur Waybill Auditor, AYNA/AZS Centers Radar, and Official AYNA-TAXO-2026 Certificate Generator
- [x] Implement statutory driver work/rest regime, digital tachograph calibration, and passenger/freight manifest compliance engine (`src/utils/tachographCompliance.ts`) adhering to Cabinet of Ministers Decision No. 73, International AETR Convention (≤4.5h continuous driving with 45-min break, ≤9h/10h daily, ≤56h weekly / ≤90h biweekly, ≥9h/11h daily rest), YHQ Annex 1 Clause 7.4 (24-month AZS calibration, KITAS sensor plomb, UNECE R89 speed limiter), and İXM Articles 326-1 (80–150 AZN driver fine) & 348 (250–2,000 AZN official/entity dispatch liability)
- [x] Add comprehensive mock tachograph & commercial transport database (`src/data/mockTachographData.ts`) covering 5 tachograph hardware profiles, 5 passenger/freight manifest violation rules, 5 AYNA driver card & AZS calibration packages, 5 accredited AYNA/AZS calibration centers across Baku, Khirdalan, Sumgayit, and Ganja, and verifiable `AYNA-TAXO-2026-XXXXX` certificates
- [x] Build official AYNA & AZS Digital Tachograph & AETR Compliance Certificate generator (`AYNA-TAXO-2026-XXXXX`) with Driver Chip Card ID (`AZ-DRV-2026-XXXXXX`), E-Uğur Waybill reference, and live unified registry lookup
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/tachographCompliance.test.ts` and `src/components/__tests__/TachographWorkRestModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### 🔋 Milestone 45: Official AZS, BDYP & FHN Electric & Hybrid High-Voltage Safety (UNECE R100 — ≥500 Ω/V Insulation Resistance), Battery SOH% & Cell Delta (mV) Telemetry Stand, UNECE R138 AVAS Pedestrian Alert & AMB Green Credit Portal (AZS, BDYP & FHN Elektromobil və Hibrid Yüksək Gərginlik Təhlükəsizlik Stendi — UNECE R100 İzolyasiya Müqaviməti ≥500 Ω/V, Batareya SOH% & Özək Disbalansı ΔmV, UNECE R138 AVAS Piyada Səsi, Vergi Məcəlləsi Maddə 164.1.41 və AMB Yaşıl Avtokredit Portalı) (Completed)
- [x] Add Official AZS, BDYP & FHN Electric & Hybrid High-Voltage Safety, SOH% & Green Privilege Modal (`HvBatterySafetyModal.tsx`) with 1000V Megohmmeter Insulation Stand, SOH% & Cell Delta (mV) Telemetry Auditor, UNECE R138 AVAS & AMB Green Loan Calculator, Accredited HV Centers Radar, and Official AZS-HV-2026 Certificate Generator
- [x] Implement statutory HV insulation resistance, battery health, AVAS, and fiscal/prudential privilege engine (`src/utils/hvBatteryCompliance.ts`) adhering to UNECE R100 (≥500 Ω/V AC/DC bus insulation resistance, HVIL loop, Pyro-fuse, P0AA6 leak prohibition), FHN thermal runaway rules (>55°C), UNECE R138 AVAS (56–75 dBA at 0–20 km/h, İXM Art. 342.2-1 150 AZN fine), Tax Code Art. 164.1.41 (0% VAT / 0% Customs Duty for ≤3 yr EV/HEV), and CBAR (AMB) 10%/20% Green Down Payment rules
- [x] Add comprehensive mock HV battery database (`src/data/mockHvBatteryData.ts`) covering 5 battery chemistries (`LFP_Blade_400V`, `NMC_400V`, `NMC_800V`, `NiMH_HEV_245V`, `PHEV_EREV_350V`), 5 HV fault profiles (`P0AA6`, `P0A80`, `U0111/HVIL`, `Pyro-Fuse`), 4 HV service & cell-balancing packages, 6 accredited AZS/BDYP/FHN HV laboratories across Baku, Sumgayit, and Ganja, and verifiable `AZS-HV-2026-XXXXX` certificates
- [x] Build official AZS & BDYP High-Voltage Safety & Battery SOH% Certificate generator (`AZS-HV-2026-XXXXX`) with QR security hash and live unified registry lookup
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/hvBatteryCompliance.test.ts` and `src/components/__tests__/HvBatterySafetyModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### 🚗 Milestone 46: Official BDYP & AZS Suspension, Shock Absorber (EUSAMA Test Bench) & Chassis Roadworthiness Portal (YHQ Annex 1 Clauses 5.4, 5.5, 7.3, 7.12 — EUSAMA ≥40% Adhesion & ≤15% Imbalance, Kəsilmiş Yaylar / Qanunsuz "Peredok" Qaldırma — İXM Maddə 342.2-1 & Maddə 96.1.4, Qeyri-Standart Təkər Araqatı / Flans "Spacers" və Celette 3D Kuzov Həndəsəsi Portalı) (Completed)
- [x] Add Official BDYP & AZS Suspension, Shock Absorber, "Peredok" & 3D Chassis Modal (`SuspensionChassisModal.tsx`) with MAHA FWT-1 EUSAMA Vibrostend Simulator, "Peredok" & Cut Springs Legal Auditor, Hunter 3D Laser Alignment & Celette Frame Stand, Chassis Repair Packages, Accredited Centers Radar, and Official BDYP-ASQ-2026 Certificate Generator
- [x] Implement statutory suspension compliance, EUSAMA damping balance, and 3D chassis geometry engine (`src/utils/suspensionChassisCompliance.ts`) adhering to YHQ Annex 1 Clauses 5.4 (missing lug bolts), 5.5 (cracked/welded rims), 7.3 & 7.12 (anti-roll stabilizer bar integrity), and İXM Articles 342.1.5 (50 AZN fine), 342.2-1 (150 AZN fine for "Peredok" lift >35mm or cut springs / spacers), and 96.1.4 (immediate impound towing)
- [x] Add comprehensive mock suspension, chassis & 3D geometry database (`src/data/mockSuspensionChassisData.ts`) covering 6 suspension modification profiles, 5 wheel fastener/rim conditions, 5 chassis service & 3D alignment packages, 6 accredited BDYP & AZS chassis laboratories across Baku, Khirdalan, Sumgayit, and Ganja, and verifiable `BDYP-ASQ-2026-XXXXX` certificates
- [x] Build official BDYP & AZS Electronic Suspension & 3D Chassis Geometry Certificate generator (`BDYP-ASQ-2026-XXXXX`) with QR security hash and live unified registry lookup
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/suspensionChassisCompliance.test.ts` and `src/components/__tests__/SuspensionChassisModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### 🩺 Milestone 47: Official Ministry of Health (Səhiyyə Nazirliyi), BDYP & ASAN Driver Medical Examination & Electronic Health Certificate Portal (Forma AZS-083/e Rəqəmsal Tibbi Arayış, Rabkin Polixromatik Rəng Korluğu Testi, Snellen/Sivtsev Görmə İtiyi (Visus ≥0.6), Psixonevroloji & Narkoloji Dispanser Təsdiqi, Sərxoşluq Alkotest / Toksikologiya — İXM Maddə 333 / 334 və Rəsmi SN-TIB-2026 Sertifikatı) (Completed)
- [x] Add Official Ministry of Health & BDYP Driver Medical Examination & Electronic Certificate Modal (`DriverMedicalModal.tsx`) with Forma AZS-083/e Eligibility Auditor, Rabkin Polychromatic Color Vision Test Stand, BAC/Breath Sobriety & Dispensary Query Simulator, Accredited Polyclinics Radar & Booking Simulator, and Official SN-TIB-2026 Certificate Generator
- [x] Implement statutory driver medical eligibility, Rabkin color blindness, and toxicology audit engine (`src/utils/driverMedicalCompliance.ts`) adhering to Ministry of Health & YHQ Articles 33–35 standards (Amateur Visus ≥0.6/≥0.2 vs Professional Visus ≥0.8/≥0.4, 01.01 eyeglasses endorsement, 10-year / 2-year / 1-year age-based validity, Rabkin polychromatic plate diagnostics for protanopia/deuteranopia/total color blindness, and İXM Articles 333 & 334 sobriety scale: ≤0.28 ‰ sober, 0.28–0.50 ‰ mild intoxication [400 ₼ / 6-12 mo], 0.50–1.00 ‰ moderate intoxication [700 ₼ / 1-2 yr], >1.00 ‰ severe intoxication [700 ₼ or 15-30 days detention + 2 yr suspension], and test refusal)
- [x] Add comprehensive mock driver medical database (`src/data/mockDriverMedicalData.ts`) covering 6 Rabkin polychromatic test plates, 4 central dispensary records, 6 accredited polyclinics and diagnostic centers across Baku, Sumgayit, and Ganja, 4 medical commission service packages, and verifiable `SN-TIB-2026-XXXXX` certificates
- [x] Build official Səhiyyə Nazirliyi & BDYP Electronic Driver Medical Certificate generator (`SN-TIB-2026-XXXXX`) with SİMA Digital Signature UID, QR security hash, blood type classification, allowed categories matrix, and live unified registry lookup
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/driverMedicalCompliance.test.ts` and `src/components/__tests__/DriverMedicalModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### 🎓 Milestone 48: Official BDYP, DİN & Elm və Təhsil Nazirliyi Driving School ("Avtoməktəb") Accreditation, Practical Autodrome Exam Simulator (Estakada, Parallel Parking, 90° Box Reverse), City Route Penalty Scale & "U" Dual-Pedal Training Vehicle Compliance Portal (BDYP & DİN Rəsmi Sürücülük Məktəbləri Reyestri, 5-Mərhələli İmtahan Avtodromu Simulyatoru — Estakada ≤20sm Sürüşmə, Elektron Şəhər İmtahanı Cərimə Balları / 100 Bal Şkalası, Tədris Avtomobili "U" / İkili Pedal Qanuniliyi və Rəsmi BDYP-AVM-2026 Kurs Şəhadətnaməsi) (Completed)
- [x] Add Official BDYP & Elm Nazirliyi Driving School Accreditation & Practical Autodrome Exam Modal (`DrivingSchoolModal.tsx`) with 5-Exercise Autodrome Simulator (Estakada, Parallel Parking, 90° Box Reverse, Slalom, 3-Point Turn), City Driving Route 100-Point Error Telemetry Stand, "Tədris Avtomobili" & "U" Dual-Pedal Regulatory Auditor, Accredited Driving Schools Radar, and Official BDYP-AVM-2026 Certificate Generator
- [x] Implement statutory autodrome tolerances, city exam penalty scale, and dual-pedal vehicle compliance engine (`src/utils/drivingSchoolCompliance.ts`) adhering to YHQ Articles 33–35, YHQ Annex 2 (dual clutch/brake pedals, illuminated rooftop "U" sign, instructor rear-view mirrors, examiner 2-way dashcam, and Texpasport special endorsement), BDYP Autodrome rules (Estakada ≤20 cm rollback, curb offset 10–30 cm), and BDYP City Driving Route 100-point rubric (Passing threshold ≥80 pts and 0 critical violations)
- [x] Add comprehensive mock driving school database (`src/data/mockDrivingSchoolData.ts`) covering 5 autodrome exercises with sensory tolerances, 10 city exam error items with legal citations, 6 accredited driving schools across Baku, Sumgayit, and Ganja, 4 tuition packages (Category B Standard, Intensive, BC Commercial, BE Towing), and sample verifiable `BDYP-AVM-2026-XXXXX` certificates
- [x] Build official BDYP & Elm və Təhsil Nazirliyi Electronic Driving School Graduation Certificate generator (`BDYP-AVM-2026-XXXXX`) with security QR checksum hash, student FIN, total theory/practical log hours, and live unified registry lookup
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/drivingSchoolCompliance.test.ts` and `src/components/__tests__/DrivingSchoolModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### ☣️ Milestone 49: Official FHN (Fövqəladə Hallar Nazirliyi), BDYP & AZS Dangerous Goods Road Transport (ADR) Portal (FHN & BDYP Rəsmi Təhlükəli Yüklərin Avtomobillə Daşınması Portalı — ADR / YHQ Əlavə 1 Bənd 7.9, BMT (UN) & Narıncı Kemler Lövhəsi Standartı, EX/II, EX/III, FL, AT Sistern və Nəqliyyat Təchizatı Auditoru, ADR Sürücü Şəhadətnaməsi & Rəsmi FHN-ADR-2026 Xüsusi İcazə Portalı) (Completed)
- [x] Add Official FHN & BDYP Dangerous Goods Road Transport (ADR) Modal (`AdrComplianceModal.tsx`) with Interactive Retro-reflective Orange Kemler Plate Generator (400x300mm), Tanker & Vehicle Safety Equipment Stand (FL/AT/EX), Azerbaijan Highway Transit Corridors (M-1, M-2, M-3, Baku Ring Bypass), and Official FHN-ADR-2026 Special Permit Generator
- [x] Implement statutory ADR compliance, Kemler HIN interpretation, and transit permit fee engine (`src/utils/adrCompliance.ts`) adhering to UNECE ADR 2023/2025, Law on Road Traffic (YHQ Article 58 & Annex 1 Clause 7.9), and Code of Administrative Offences (İXM Article 354: 200–500 AZN driver / 1,500–2,500 AZN official / 3,000–5,000 AZN legal entity fines, and Article 96.1.4 impound towing)
- [x] Add comprehensive mock ADR database (`src/data/mockAdrData.ts`) covering 8 BMT (UN) dangerous substances (Benzin Aİ-92/95 UN 1203, Dizel UN 1202, LPG Propane UN 1965, Sulfuric Acid UN 1830, Oleum UN 1831, Chlorine Gas UN 1017, Gunpowder UN 0027, Lithium-ion batteries UN 3480), 11 mandatory UNECE 8.1.5 emergency kit items, 4 transit corridors, and 4 accredited FHN & BDYP technical inspection centers
- [x] Build official FHN State Industrial Safety Agency Electronic Special Transport Permit generator (`FHN-ADR-2026-XXXXX`) with QR security verification checksum, carrier VÖEN, vehicle plate, UN code, and live unified registry lookup
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/adrCompliance.test.ts` and `src/components/__tests__/AdrComplianceModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### 🚛 Milestone 50: Official AAYDA & BDYP Heavy Axle Load & Oversize Cargo Road Transport Permitting Portal (İriqabaritli və Ağırçəkili Yüklərin Daşınması — AAYDA & BDYP Rəsmi Xüsusi İcazə Portalı, Ox Yükü / Qabarit Standartları — YHQ Maddə 57 & NK Qərar № 104, İXM Maddə 353 Cərimə Matrisi, Eskort/Müşayiət Avtomobili Qaydaları, Yola Dəyən Ziyan Rüsumu & Elektron Xüsusi Yol Marşrut İcazəsi Portalı) (Completed)
- [x] Add Official AAYDA & BDYP Heavy Axle Load & Oversize Cargo Transport Modal (`OversizePermitModal.tsx`) with Dimension & Axle Load Auditor, Azerbaijan Highway Corridors & Bridge Clearance Radar (M-1, M-2, M-3, M-4, Alat Hub), Pilot/Police Escort Protocol, Official Electronic Special Route Permit Generator, and Unified Permit Registry Lookup
- [x] Implement statutory oversize compliance, axle load distribution, escort tier determination, and AAYDA road wear damage engine (`src/utils/oversizePermitCompliance.ts`) adhering to Cabinet of Ministers Decision No. 104, Law on Road Traffic (YHQ Article 57), Law on State Duties (Article 33 base duty), and Code of Administrative Offences (İXM Article 353: 600–800 AZN driver / 1,400–2,000 AZN official / 4,000–7,000 AZN legal entity fines, and impound towing)
- [x] Add comprehensive mock heavy transport database (`src/data/mockOversizeData.ts`) covering 7 cargo presets (CAT 336 excavator, 55m wind turbine blade, oilfield drilling mud tank, 80t electrical transformer, Liebherr LTM mobile crane, 40ft container with intermodal 44t exemption), 5 Azerbaijan transit corridors with bridge clearances & WIM scales, and verifiable sample `AAYDA-OVS-2026-XXXXX` permits
- [x] Build official AAYDA & BDYP Electronic Special Route Permit generator (`AAYDA-OVS-2026-XXXXX`) with SHA256 security checksum, QR verification hash, carrier VÖEN, tractor/trailer plates, approved corridor, transit distance, itemized road wear damage fees, and printable layout
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/oversizePermitCompliance.test.ts` and `src/components/__tests__/OversizePermitModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### 💥 Milestone 51: Official BDYP, Ədliyyə Nazirliyi & İSB Traffic Accident (YNH) Investigation, Skid Mark Speed Telemetry ($v = \sqrt{254 \cdot \mu \cdot S}$) & Forensic Crash Reconstruction Portal (BDYP & Ədliyyə Nazirliyi Məhkəmə Ekspertizası Mərkəzi — Yol-Nəqliyyat Hadisəsi (YNH) Avtotexniki Ekspertizası, Tormoz İzi ilə Qəza Sürətinin Hesablanması $v = \sqrt{254 \cdot \mu \cdot S}$, Piyada Vurma Reaksiya/Dayanma Zonası, İXM Maddə 327 / CM Maddə 263 Məsuliyyət Matrisi, İSB Sığorta Zərəri və Rəsmi MEM-YNH-2026 Ekspertiza Rəyi Portalı) (Completed)
- [x] Add Official BDYP & Ədliyyə Nazirliyi Traffic Accident Forensics & Reconstruction Modal (`AccidentForensicsModal.tsx`) with Skid Mark Speed Telemetry ($v = \sqrt{254 \cdot \mu \cdot S}$), Pedestrian Hazard Avoidance Auditor, Criminal Code Art. 263 vs İXM Art. 327 Legal Liability Classifier, İSB Compulsory & KASKO Damage Settlement, and Official MEM-YNH-2026 Certificate Generator
- [x] Implement statutory forensic crash calculation & legal liability engine (`src/utils/accidentForensics.ts`) adhering to Forensic Auto-Technical Calculation Standards ($v = \sqrt{254 \cdot (\mu \pm 0.01 \cdot i) \cdot \eta \cdot S}$), Azerbaijan Criminal Code (Cinayət Məcəlləsi Articles 263, 263-1, 264), Code of Administrative Offences (İXM Articles 327.1, 327.3, 327.8, 333.1), and Compulsory Insurance Bureau (İSB) claims calculation rules
- [x] Add comprehensive mock accident forensics database (`src/data/mockAccidentForensicsData.ts`) covering 4 authentic collision scenarios (Heydar Aliyev Ave pedestrian impact, Tbilisi Ave wet intersection, M-1 Sumgayit high-speed rollover, M-4 Shamakhi black ice), 5 accredited forensic institutions across Baku, Ganja, and Sheki, and verifiable sample `MEM-YNH-2026-XXXXX` conclusion reports
- [x] Build official Ministry of Justice Forensic Center Electronic Technical Expertise Conclusion generator (`MEM-YNH-2026-XXXXX`) with SİMA digital signature hash, QR verification checksum, lead expert credentials, itemized forensic formula telemetry, and printable layout
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/accidentForensics.test.ts` and `src/components/__tests__/AccidentForensicsModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### 🚨 Milestone 52: Official DİN (Daxili İşlər Nazirliyi) & BDYP Emergency Flashing Beacons, Multi-Tone Siren Systems ("Miqalka" & Siren) Regulatory Compliance, Acoustic Decibel Norms & Operative Priority Vehicle Portal (DİN & BDYP Xüsusi Sayrışan Mayak və Çoxavazlı Səs Siqnalları («Miqalka» / Siren) Qanuniliyi — YHQ Maddə 48 & Əlavə 1 Bənd 7.16, Operativ Nəqliyyat Kateqoriyaları: Göy-Qırmızı DİN/BDYP, Göy Təcili Yardım 103 / FHN 112, Sarı/Narıncı AAYDA Evakuator / İnkassasiya; İXM Maddə 342.9 Cərimə Matrisi: 500–800 AZN + Cihazın Müsadirəsi & Maddə 96 Duracaq; Web Audio API Sintetik Səs Siqnalı Simulyatoru: Wail, Yelp, Hi-Lo, Horn / 110–124 dBA; Canlı Sayrışan Mayak Vizualizatoru və Rəsmi DİN-OPR-2026 Xüsusi İcazə Portalı) (Completed)
- [x] Add Official DİN & BDYP Emergency Beacon, Siren & Operative Priority Modal (`SpecialSignalModal.tsx`) with Statutory Audit & Sanctions Stand, Animated Strobe Lightbar Visualizer (Blue-Red, Blue, Amber, White), Web Audio API Synthetic Siren Controller (Wail, Yelp, Hi-Lo, Horn), Traffic Priority & Yielding Simulator (İXM Art. 327.3: 100 AZN + 3 points), Accredited DİN & AZS Acoustic Laboratories Radar, and Official DİN-OPR-2026 Certificate Generator
- [x] Implement statutory special signal legality, sanction calculation, and synthetic tone engine (`src/utils/specialSignalCompliance.ts`) adhering to Law on Road Traffic (YHQ Article 48 & Annex 1 Clause 7.16), Code of Administrative Offences (İXM Articles 342.9 [500–800 AZN fine + equipment confiscation], 327.3 [100 AZN + 3 points for failure to yield], and 96.1.4 [impoundment]), AZS Acoustic standard (≤124 dBA at 2m), and Web Audio API tone synthesis configs
- [x] Add comprehensive mock special signal, siren hardware, and operative database (`src/data/mockSpecialSignalData.ts`) covering 6 vehicle profiles (BDYP YPX patrol, 103 Ambulance, 112 Fire engine, AAYDA recovery tow truck, armored bank cash transit, unauthorized civilian flasher), 5 siren models (Federal Signal PA300, Whelen 295SL100, Premier Hazard, Standby Pintsch), 4 yielding traffic scenarios, 4 service packages, 5 accredited DİN/AZS testing stations across Baku, Sumgayit, and Ganja, and verifiable sample `DIN-OPR-2026-XXXXX` permits
- [x] Build official Ministry of Internal Affairs (DİN) & BDYP Electronic Special Operative Vehicle Permit generator (`DIN-OPR-2026-XXXXX`) with cryptographic security hash, hologram UID, QR security strip, authorized signal colors, agency credentials, and printable layout
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/specialSignalCompliance.test.ts` and `src/components/__tests__/SpecialSignalModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### 🏛️ Milestone 53: Official State Property Issues Service (Əmlak Məsələləri Dövlət Xidməti) & Judicial Enforcement (Məhkəmə İcraçıları) Official Electronic Vehicle Auction, Confiscated & Repossessed Asset Bidding Portal (Dövlət Əmlakı və Müsadirə Olunmuş Nəqliyyat Vasitələrinin Rəsmi Elektron Hərrac Portalı — e-herrac.emlak.gov.az İnteqrasiyası, İlkin Hərrac Qiyməti, 5% Bank Qarantı / Beh Hesablayıcısı, Canlı Addım-Addım Hərrac Çəkic Simulyatoru, ƏDV və Notariat Rəsmiləşdirməsi, Müsadirə Əsası (İcra / Gömrük / Məhkəmə) və Rəsmi ƏMLAK-HRC-2026 Hərrac Qalibi Qərar Protokolu Portalı) (Completed)
- [x] Add Official State Property Issues Service & Judicial Enforcement Vehicle Auction Modal (`VehicleAuctionModal.tsx`) with Live Auction Stand & Bot Bidding Simulator, Lot Catalog & Filters, 5% Guarantee Deposit (Beh) Calculator, Official Electronic Winner Protocol Generator, and Physical Inspection Sites Radar
- [x] Implement statutory vehicle auction financial & bid validation engine (`src/utils/vehicleAuction.ts`) adhering to the Law on State Property Privatization, Law on Execution (Article 52), Customs Code (Articles 245-250), 5% refundable guarantee deposit formula, 0.5% State Property Service platform commission, 18% VAT on service fee, 10 banking days settlement timeline, and multi-currency conversions (AZN, USD, EUR)
- [x] Add comprehensive mock vehicle auction database (`src/data/mockVehicleAuctionData.ts`) covering 8 authentic Azerbaijani auction lots across state surplus, court debt enforcement, customs forfeiture, and bank repossession categories, 4 regional inspection yards in Baku, Zabrat, Sumgayit, and Ganja, and verifiable sample `ƏMLAK-HRC-2026-XXXXX` winner protocols
- [x] Build official State Property Issues Service Electronic Auction Winner Protocol generator (`ƏMLAK-HRC-2026-XXXXX`) with cryptographic security checksum, QR verification hash, BDYP police re-registration instruction note, and printable/copyable layout
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/vehicleAuction.test.ts` and `src/components/__tests__/VehicleAuctionModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)

---

### 🌐 Milestone 54: Official State Customs Committee (DGK) & BDYP Foreign-Registered Vehicle Temporary Import, Customs Deposit & 90-Day Transit Regime Portal (Xarici Qeydiyyatlı Nəqliyyat Vasitələrinin Rəsmi Müvəqqəti İdxal & Tranzit Portalı — Gömrük Məcəlləsi Maddə 258/259, 90 Günlük Rejim Countdown, Rezident Gömrük Təminatı / Depozit Kalkulyatoru, Yol Vergisi & Rəsmiləşdirmə Rüsumu, İXM Maddə 499 Cərimə Qaydaları, Sərhəd Buraxılış Məntəqələri Radarı və Rəsmi DGK-MVI-2026 Elektron Müvəqqəti İdxal İcazəsi Portalı) (Completed)
- [x] Add Official State Customs Committee & BDYP Foreign Vehicle Temporary Import & Transit Modal (`CustomsTransitModal.tsx`) with Interactive Calculator & Deposit Estimator, 90-Day Regime & İXM 499 Sanctions Stand, Border Checkpoints Radar, Active Foreign Permits Registry, and Official DGK-MVI-2026 Electronic Permit Certificate Generator
- [x] Implement statutory temporary import, refundable guarantee deposit, and administrative sanctions engine (`src/utils/customsTransit.ts`) adhering to Customs Code (Articles 258, 259, 260 — non-resident 90-day personal use exemption, resident full customs duty/excise/VAT security deposit in treasury), Tax Code (Articles 209-211 Road Tax / Yol Vergisi), Law on State Duties (Article 33 clearance fees), and Code of Administrative Offences (İXM Article 499.1 [100 AZN], 499.2 [300 AZN], and 499.3 [50-100% vehicle value or confiscation]) with multi-currency support (AZN, USD, EUR)
- [x] Add comprehensive mock foreign vehicle & border checkpoints database (`src/data/mockCustomsTransitData.ts`) covering 6 strategic border posts (Qırmızı Körpü, Samur, Astara, Biləsuvar, Mazımqara, Ələt Ro-Ro Port) with coordinates, contact phones, wait times, daily capacity, and live queues, 6 authentic foreign-registered vehicles (`GE`, `RU`, `TR`, `IR`, `KZ`, `DE`), and sample verifiable `DGK-MVI-2026-XXXXX` permits
- [x] Build official State Customs Committee Electronic Temporary Import Certificate generator (`DGK-MVI-2026-XXXXX`) with national coat of arms header, SHA256 security checksum, foreign plate visualizer, inspector ID, permitted exit deadline countdown, and printable/copyable layout
- [x] Comprehensive Vitest unit test suites (`src/utils/__tests__/customsTransit.test.ts` and `src/components/__tests__/CustomsTransitModal.test.tsx`, plus integrations in `Navbar.test.tsx` and `CarDetailModal.test.tsx`)















