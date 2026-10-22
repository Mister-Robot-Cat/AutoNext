import React, { useState, useMemo, useEffect } from 'react';
import { Vehicle, Currency, Language, SellerInfo } from './types/vehicle';
import { MOCK_VEHICLES } from './data/mockVehicles';
import { TRANSLATIONS, formatPrice } from './utils/i18n';
import { useVehicleFilter } from './hooks/useVehicleFilter';
import { useWatchlist } from './hooks/useWatchlist';
import { useCarComparison } from './hooks/useCarComparison';
import { usePreferences } from './hooks/usePreferences';
import { useRecentlyViewed } from './hooks/useRecentlyViewed';
import { usePagination } from './hooks/usePagination';
import { Navbar } from './components/Navbar';
import { FilterBar } from './components/FilterBar';
import { CarCard } from './components/CarCard';
import { CarCardSkeleton } from './components/CarCardSkeleton';
import { Pagination } from './components/Pagination';
import { EmptyState } from './components/EmptyState';
import { ScrollToTop } from './components/ScrollToTop';
import { ToastContainer } from './components/ToastContainer';
import { toastManager } from './hooks/useToast';
const CarDetailModal = React.lazy(() => import('./components/CarDetailModal').then(m => ({ default: m.CarDetailModal })));
const CarComparator = React.lazy(() => import('./components/CarComparator').then(m => ({ default: m.CarComparator })));
const LoanCalculatorModal = React.lazy(() => import('./components/LoanCalculatorModal').then(m => ({ default: m.LoanCalculatorModal })));
const VinHistoryModal = React.lazy(() => import('./components/VinHistoryModal').then(m => ({ default: m.VinHistoryModal })));
const DealershipProfileModal = React.lazy(() => import('./components/DealershipProfileModal').then(m => ({ default: m.DealershipProfileModal })));
const PriceHistoryModal = React.lazy(() => import('./components/PriceHistoryModal').then(m => ({ default: m.PriceHistoryModal })));
const TcoForecasterModal = React.lazy(() => import('./components/TcoForecasterModal').then(m => ({ default: m.TcoForecasterModal })));
const TradeInModal = React.lazy(() => import('./components/TradeInModal').then(m => ({ default: m.TradeInModal })));
const InspectionModal = React.lazy(() => import('./components/InspectionModal').then(m => ({ default: m.InspectionModal })));
const CustomsCalculatorModal = React.lazy(() => import('./components/CustomsCalculatorModal').then(m => ({ default: m.CustomsCalculatorModal })));
const LienRegistryModal = React.lazy(() => import('./components/LienRegistryModal').then(m => ({ default: m.LienRegistryModal })));
const BillOfSaleModal = React.lazy(() => import('./components/BillOfSaleModal').then(m => ({ default: m.BillOfSaleModal })));
const InsuranceCalculatorModal = React.lazy(() => import('./components/InsuranceCalculatorModal').then(m => ({ default: m.InsuranceCalculatorModal })));
const EscrowSimulatorModal = React.lazy(() => import('./components/EscrowSimulatorModal').then(m => ({ default: m.EscrowSimulatorModal })));
const ServicePassportModal = React.lazy(() => import('./components/ServicePassportModal').then(m => ({ default: m.ServicePassportModal })));
const RecallRegistryModal = React.lazy(() => import('./components/RecallRegistryModal').then(m => ({ default: m.RecallRegistryModal })));
const TechnicalInspectionModal = React.lazy(() => import('./components/TechnicalInspectionModal').then(m => ({ default: m.TechnicalInspectionModal })));
const VehicleRegistrationModal = React.lazy(() => import('./components/VehicleRegistrationModal').then(m => ({ default: m.VehicleRegistrationModal })));
const TrafficFinesModal = React.lazy(() => import('./components/TrafficFinesModal').then(m => ({ default: m.TrafficFinesModal })));
const RoadsideAssistanceModal = React.lazy(() => import('./components/RoadsideAssistanceModal').then(m => ({ default: m.RoadsideAssistanceModal })));
const EvChargingModal = React.lazy(() => import('./components/EvChargingModal').then(m => ({ default: m.EvChargingModal })));
const AzParkingModal = React.lazy(() => import('./components/AzParkingModal').then(m => ({ default: m.AzParkingModal })));
const FuelStationModal = React.lazy(() => import('./components/FuelStationModal').then(m => ({ default: m.FuelStationModal })));
const TollRoadModal = React.lazy(() => import('./components/TollRoadModal').then(m => ({ default: m.TollRoadModal })));
const WindowTintModal = React.lazy(() => import('./components/WindowTintModal').then(m => ({ default: m.WindowTintModal })));
const EuroprotocolModal = React.lazy(() => import('./components/EuroprotocolModal').then(m => ({ default: m.EuroprotocolModal })));
const PowerOfAttorneyModal = React.lazy(() => import('./components/PowerOfAttorneyModal').then(m => ({ default: m.PowerOfAttorneyModal })));
const GreenCardModal = React.lazy(() => import('./components/GreenCardModal').then(m => ({ default: m.GreenCardModal })));
const TaxiComplianceModal = React.lazy(() => import('./components/TaxiComplianceModal').then(m => ({ default: m.TaxiComplianceModal })));
const TuningComplianceModal = React.lazy(() => import('./components/TuningComplianceModal').then(m => ({ default: m.TuningComplianceModal })));
const VehicleScrappageModal = React.lazy(() => import('./components/VehicleScrappageModal').then(m => ({ default: m.VehicleScrappageModal })));
const ImpoundLotModal = React.lazy(() => import('./components/ImpoundLotModal').then(m => ({ default: m.ImpoundLotModal })));
const SpecialTrafficRegimeModal = React.lazy(() => import('./components/SpecialTrafficRegimeModal').then(m => ({ default: m.SpecialTrafficRegimeModal })));
const DriverLicenseModal = React.lazy(() => import('./components/DriverLicenseModal').then(m => ({ default: m.DriverLicenseModal })));
const TireComplianceModal = React.lazy(() => import('./components/TireComplianceModal').then(m => ({ default: m.TireComplianceModal })));
const HeadlightComplianceModal = React.lazy(() => import('./components/HeadlightComplianceModal').then(m => ({ default: m.HeadlightComplianceModal })));
const PassengerSafetyModal = React.lazy(() => import('./components/PassengerSafetyModal').then(m => ({ default: m.PassengerSafetyModal })));
const EmissionsComplianceModal = React.lazy(() => import('./components/EmissionsComplianceModal').then(m => ({ default: m.EmissionsComplianceModal })));
const BrakeSteeringModal = React.lazy(() => import('./components/BrakeSteeringModal').then(m => ({ default: m.BrakeSteeringModal })));
const VisibilityHornComplianceModal = React.lazy(() => import('./components/VisibilityHornComplianceModal').then(m => ({ default: m.VisibilityHornComplianceModal })));
const ForensicPlateComplianceModal = React.lazy(() => import('./components/ForensicPlateComplianceModal').then(m => ({ default: m.ForensicPlateComplianceModal })));
const BodyworkAdvertisingModal = React.lazy(() => import('./components/BodyworkAdvertisingModal').then(m => ({ default: m.BodyworkAdvertisingModal })));
const TachographWorkRestModal = React.lazy(() => import('./components/TachographWorkRestModal').then(m => ({ default: m.TachographWorkRestModal })));
const HvBatterySafetyModal = React.lazy(() => import('./components/HvBatterySafetyModal').then(m => ({ default: m.HvBatterySafetyModal })));
const SuspensionChassisModal = React.lazy(() => import('./components/SuspensionChassisModal').then(m => ({ default: m.SuspensionChassisModal })));
const DriverMedicalModal = React.lazy(() => import('./components/DriverMedicalModal').then(m => ({ default: m.DriverMedicalModal })));
const DrivingSchoolModal = React.lazy(() => import('./components/DrivingSchoolModal').then(m => ({ default: m.DrivingSchoolModal })));
const AdrComplianceModal = React.lazy(() => import('./components/AdrComplianceModal').then(m => ({ default: m.AdrComplianceModal })));
const OversizePermitModal = React.lazy(() => import('./components/OversizePermitModal').then(m => ({ default: m.OversizePermitModal })));
const AccidentForensicsModal = React.lazy(() => import('./components/AccidentForensicsModal').then(m => ({ default: m.AccidentForensicsModal })));
import { 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  ShieldAlert,
  TrendingDown, 
  Calculator, 
  ArrowRight, 
  X, 
  Plus, 
  Check, 
  Zap, 
  Send, 
  SlidersHorizontal,
  Flame,
  CheckCircle2,
  Car,
  Clock,
  Scale,
  FileText,
  AlertTriangle,
  Building2,
  Truck,
  CircleParking,
  Fuel,
  Route,
  Sun,
  FileCheck,
  FileSignature,
  Globe,
  Wrench,
  Recycle,
  Bus,
  Award,
  Disc,
  Lightbulb,
  HeartPulse,
  Wind,
  Eye,
  Fingerprint,
  Palette,
  Timer,
  BatteryCharging,
  Activity
} from 'lucide-react';
import { useTheme } from './hooks/useTheme';

export function App() {
  const { currency, setCurrency, lang, setLang } = usePreferences();
  const { theme, toggleTheme } = useTheme();
  const t = TRANSLATIONS[lang];

  // Vehicles state
  const [vehicles, setVehicles] = useState<Vehicle[]>(MOCK_VEHICLES);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulate network loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Car Comparison Custom Hook
  const {
    comparedVehicleIds,
    comparedVehicles,
    toggleCompare,
    removeComparedVehicle,
    clearComparison,
    limit: compareLimit,
  } = useCarComparison(vehicles);

  const {
    favoriteIds,
    isFavoritesFilterActive,
    setIsFavoritesFilterActive,
    toggleFavorite,
  } = useWatchlist();

  const { recentlyViewedIds, addRecentlyViewed, clearRecentlyViewed } = useRecentlyViewed();

  const recentlyViewedVehicles = useMemo(() => {
    return recentlyViewedIds.map(id => vehicles.find(v => v.id === id)).filter(Boolean) as Vehicle[];
  }, [recentlyViewedIds, vehicles]);

  // Modal visibility states
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [isLoanModalOpen, setIsLoanModalOpen] = useState(false);
  const [loanCarTarget, setLoanCarTarget] = useState<Vehicle | null>(null);
  const [vinTargetCar, setVinTargetCar] = useState<Vehicle | null>(null);
  const [dealershipTarget, setDealershipTarget] = useState<SellerInfo | null>(null);
  const [priceHistoryTargetCar, setPriceHistoryTargetCar] = useState<Vehicle | null>(null);
  const [tcoTargetCar, setTcoTargetCar] = useState<Vehicle | null>(null);
  const [tradeInTargetCar, setTradeInTargetCar] = useState<Vehicle | null>(null);
  const [inspectionTargetCar, setInspectionTargetCar] = useState<Vehicle | null>(null);
  const [customsTargetCar, setCustomsTargetCar] = useState<Vehicle | null>(null);
  const [lienTargetCar, setLienTargetCar] = useState<Vehicle | null>(null);
  const [billOfSaleTargetCar, setBillOfSaleTargetCar] = useState<Vehicle | null>(null);
  const [insuranceTargetCar, setInsuranceTargetCar] = useState<Vehicle | null>(null);
  const [escrowTargetCar, setEscrowTargetCar] = useState<Vehicle | null>(null);
  const [servicePassportTargetCar, setServicePassportTargetCar] = useState<Vehicle | null>(null);
  const [recallTargetCar, setRecallTargetCar] = useState<Vehicle | null>(null);
  const [technicalInspectionTargetCar, setTechnicalInspectionTargetCar] = useState<Vehicle | null>(null);
  const [registrationTargetCar, setRegistrationTargetCar] = useState<Vehicle | null>(null);
  const [trafficFinesTargetCar, setTrafficFinesTargetCar] = useState<Vehicle | null>(null);
  const [roadsideTargetCar, setRoadsideTargetCar] = useState<Vehicle | null>(null);
  const [evChargingTargetCar, setEvChargingTargetCar] = useState<Vehicle | null>(null);
  const [isEvModalOpen, setIsEvModalOpen] = useState(false);
  const [parkingTargetCar, setParkingTargetCar] = useState<Vehicle | null>(null);
  const [isParkingModalOpen, setIsParkingModalOpen] = useState(false);
  const [fuelStationTargetCar, setFuelStationTargetCar] = useState<Vehicle | null>(null);
  const [isFuelStationModalOpen, setIsFuelStationModalOpen] = useState(false);
  const [tollRoadTargetCar, setTollRoadTargetCar] = useState<Vehicle | null>(null);
  const [isTollRoadModalOpen, setIsTollRoadModalOpen] = useState(false);
  const [windowTintTargetCar, setWindowTintTargetCar] = useState<Vehicle | null>(null);
  const [isWindowTintModalOpen, setIsWindowTintModalOpen] = useState(false);
  const [europrotocolTargetCar, setEuroprotocolTargetCar] = useState<Vehicle | null>(null);
  const [isEuroprotocolModalOpen, setIsEuroprotocolModalOpen] = useState(false);
  const [poaTargetCar, setPoaTargetCar] = useState<Vehicle | null>(null);
  const [isPoaModalOpen, setIsPoaModalOpen] = useState(false);
  const [greenCardTargetCar, setGreenCardTargetCar] = useState<Vehicle | null>(null);
  const [isGreenCardModalOpen, setIsGreenCardModalOpen] = useState(false);
  const [taxiTargetCar, setTaxiTargetCar] = useState<Vehicle | null>(null);
  const [isTaxiModalOpen, setIsTaxiModalOpen] = useState(false);
  const [tuningTargetCar, setTuningTargetCar] = useState<Vehicle | null>(null);
  const [isTuningModalOpen, setIsTuningModalOpen] = useState(false);
  const [scrappageTargetCar, setScrappageTargetCar] = useState<Vehicle | null>(null);
  const [isScrappageModalOpen, setIsScrappageModalOpen] = useState(false);
  const [impoundLotTargetCar, setImpoundLotTargetCar] = useState<Vehicle | null>(null);
  const [isImpoundLotModalOpen, setIsImpoundLotModalOpen] = useState(false);
  const [specialTrafficTargetCar, setSpecialTrafficTargetCar] = useState<Vehicle | null>(null);
  const [isSpecialTrafficModalOpen, setIsSpecialTrafficModalOpen] = useState(false);
  const [driverLicenseTargetCar, setDriverLicenseTargetCar] = useState<Vehicle | null>(null);
  const [isDriverLicenseModalOpen, setIsDriverLicenseModalOpen] = useState(false);
  const [tireComplianceTargetCar, setTireComplianceTargetCar] = useState<Vehicle | null>(null);
  const [isTireComplianceModalOpen, setIsTireComplianceModalOpen] = useState(false);
  const [headlightComplianceTargetCar, setHeadlightComplianceTargetCar] = useState<Vehicle | null>(null);
  const [isHeadlightComplianceModalOpen, setIsHeadlightComplianceModalOpen] = useState(false);
  const [passengerSafetyTargetCar, setPassengerSafetyTargetCar] = useState<Vehicle | null>(null);
  const [isPassengerSafetyModalOpen, setIsPassengerSafetyModalOpen] = useState(false);
  const [emissionsComplianceTargetCar, setEmissionsComplianceTargetCar] = useState<Vehicle | null>(null);
  const [isEmissionsComplianceModalOpen, setIsEmissionsComplianceModalOpen] = useState(false);
  const [brakeSteeringTargetCar, setBrakeSteeringTargetCar] = useState<Vehicle | null>(null);
  const [isBrakeSteeringModalOpen, setIsBrakeSteeringModalOpen] = useState(false);
  const [visibilityHornTargetCar, setVisibilityHornTargetCar] = useState<Vehicle | null>(null);
  const [isVisibilityHornModalOpen, setIsVisibilityHornModalOpen] = useState(false);
  const [forensicPlateTargetCar, setForensicPlateTargetCar] = useState<Vehicle | null>(null);
  const [isForensicPlateModalOpen, setIsForensicPlateModalOpen] = useState(false);
  const [bodyworkAdvertisingTargetCar, setBodyworkAdvertisingTargetCar] = useState<Vehicle | null>(null);
  const [isBodyworkAdvertisingModalOpen, setIsBodyworkAdvertisingModalOpen] = useState(false);
  const [tachographWorkRestTargetCar, setTachographWorkRestTargetCar] = useState<Vehicle | null>(null);
  const [isTachographWorkRestModalOpen, setIsTachographWorkRestModalOpen] = useState(false);
  const [hvBatteryTargetCar, setHvBatteryTargetCar] = useState<Vehicle | null>(null);
  const [isHvBatteryModalOpen, setIsHvBatteryModalOpen] = useState(false);
  const [suspensionTargetCar, setSuspensionTargetCar] = useState<Vehicle | null>(null);
  const [isSuspensionModalOpen, setIsSuspensionModalOpen] = useState(false);
  const [driverMedicalTargetCar, setDriverMedicalTargetCar] = useState<Vehicle | null>(null);
  const [isDriverMedicalModalOpen, setIsDriverMedicalModalOpen] = useState(false);
  const [drivingSchoolTargetCar, setDrivingSchoolTargetCar] = useState<Vehicle | null>(null);
  const [isDrivingSchoolModalOpen, setIsDrivingSchoolModalOpen] = useState(false);
  const [adrTargetCar, setAdrTargetCar] = useState<Vehicle | null>(null);
  const [isAdrModalOpen, setIsAdrModalOpen] = useState(false);
  const [oversizeTargetCar, setOversizeTargetCar] = useState<Vehicle | null>(null);
  const [isOversizeModalOpen, setIsOversizeModalOpen] = useState(false);
  const [accidentForensicsTargetCar, setAccidentForensicsTargetCar] = useState<Vehicle | null>(null);
  const [isAccidentForensicsModalOpen, setIsAccidentForensicsModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);

  // AI Advisor query
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiActivePreset, setAiActivePreset] = useState('Baku tıxaclarında az yandıran hibrid və ya elektrik maşın');

  // Vehicle Search & Filter Engine Custom Hook
  const {
    filters,
    setFilters,
    resetFilters,
    uniqueMakes,
    uniqueModels,
    uniqueCities,
    filteredVehicles,
  } = useVehicleFilter(vehicles, {
    isFavoritesFilterActive,
    favoriteIds,
  });

  const {
    currentPage,
    pageSize,
    totalPages,
    goToPage
  } = usePagination({ totalItems: filteredVehicles.length, initialPageSize: 12 });

  // Reset to page 1 when filters change
  useEffect(() => {
    goToPage(1);
  }, [filters]);

  const paginatedVehicles = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return filteredVehicles.slice(startIndex, startIndex + pageSize);
  }, [filteredVehicles, currentPage, pageSize]);

  // AI Filtered recommendations
  const aiRecommendations = useMemo(() => {
    const q = (aiActivePreset + ' ' + aiPrompt).toLowerCase();
    if (q.includes('hibrid') || q.includes('elektrik') || q.includes('qənaət') || q.includes('az yandıran')) {
      return vehicles.filter((v) => v.fuelType === 'hybrid' || v.fuelType === 'electric');
    }
    if (q.includes('suv') || q.includes('krossover') || q.includes('ailə')) {
      return vehicles.filter((v) => v.bodyType === 'suv');
    }
    if (q.includes('lüks') || q.includes('güc') || q.includes('amg') || q.includes('porsche')) {
      return vehicles.filter((v) => v.powerHp > 250 || v.priceAzn > 70000);
    }
    return vehicles.slice(0, 3);
  }, [vehicles, aiActivePreset, aiPrompt]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Header / Navbar */}
      <Navbar
        currency={currency}
        setCurrency={setCurrency}
        lang={lang}
        setLang={setLang}
        theme={theme}
        onToggleTheme={toggleTheme}
        comparedVehicles={comparedVehicles}
        favoritesCount={favoriteIds.length}
        isFavoritesFilterActive={isFavoritesFilterActive}
        onToggleFavoritesFilter={() => setIsFavoritesFilterActive((prev) => !prev)}
        onOpenCompare={() => setIsCompareOpen(true)}
        onOpenCalculator={() => {
          setLoanCarTarget(null);
          setIsLoanModalOpen(true);
        }}
        onOpenAiAdvisor={() => setIsAiModalOpen(true)}
        onOpenCreateListing={() => setIsCreateListingOpen(true)}
        onOpenEvCharging={() => {
          setEvChargingTargetCar(vehicles.find(v => v.fuelType === 'electric') || null);
          setIsEvModalOpen(true);
        }}
        onOpenParking={() => {
          setParkingTargetCar(vehicles[0] || null);
          setIsParkingModalOpen(true);
        }}
        onOpenFuelStations={() => {
          setFuelStationTargetCar(vehicles[0] || null);
          setIsFuelStationModalOpen(true);
        }}
        onOpenEuroprotocol={() => {
          setEuroprotocolTargetCar(vehicles[0] || null);
          setIsEuroprotocolModalOpen(true);
        }}
        onOpenGreenCard={() => {
          setGreenCardTargetCar(vehicles[0] || null);
          setIsGreenCardModalOpen(true);
        }}
        onOpenTaxiCompliance={() => {
          setTaxiTargetCar(vehicles[0] || null);
          setIsTaxiModalOpen(true);
        }}
        onOpenTuningCompliance={() => {
          setTuningTargetCar(vehicles[0] || null);
          setIsTuningModalOpen(true);
        }}
        onOpenScrappage={() => {
          setScrappageTargetCar(vehicles[0] || null);
          setIsScrappageModalOpen(true);
        }}
        onOpenImpoundLot={() => {
          setImpoundLotTargetCar(vehicles[0] || null);
          setIsImpoundLotModalOpen(true);
        }}
        onOpenSpecialTraffic={() => {
          setSpecialTrafficTargetCar(vehicles[0] || null);
          setIsSpecialTrafficModalOpen(true);
        }}
        onOpenDriverLicense={() => {
          setDriverLicenseTargetCar(vehicles[0] || null);
          setIsDriverLicenseModalOpen(true);
        }}
        onOpenTireCompliance={() => {
          setTireComplianceTargetCar(vehicles[0] || null);
          setIsTireComplianceModalOpen(true);
        }}
        onOpenHeadlightCompliance={() => {
          setHeadlightComplianceTargetCar(vehicles[0] || null);
          setIsHeadlightComplianceModalOpen(true);
        }}
        onOpenPassengerSafety={() => {
          setPassengerSafetyTargetCar(vehicles[0] || null);
          setIsPassengerSafetyModalOpen(true);
        }}
        onOpenEmissionsCompliance={() => {
          setEmissionsComplianceTargetCar(vehicles[0] || null);
          setIsEmissionsComplianceModalOpen(true);
        }}
        onOpenBrakeSteering={() => {
          setBrakeSteeringTargetCar(vehicles[0] || null);
          setIsBrakeSteeringModalOpen(true);
        }}
        onOpenVisibilityHorn={() => {
          setVisibilityHornTargetCar(vehicles[0] || null);
          setIsVisibilityHornModalOpen(true);
        }}
        onOpenForensicPlate={() => {
          setForensicPlateTargetCar(vehicles[0] || null);
          setIsForensicPlateModalOpen(true);
        }}
        onOpenBodyworkAdvertising={() => {
          setBodyworkAdvertisingTargetCar(vehicles[0] || null);
          setIsBodyworkAdvertisingModalOpen(true);
        }}
        onOpenTachographWorkRest={() => {
          setTachographWorkRestTargetCar(vehicles[0] || null);
          setIsTachographWorkRestModalOpen(true);
        }}
        onOpenHvBatterySafety={() => {
          setHvBatteryTargetCar(vehicles.find(v => v.fuelType === 'electric' || v.fuelType === 'hybrid') || vehicles[0] || null);
          setIsHvBatteryModalOpen(true);
        }}
        onOpenSuspensionChassis={() => {
          setSuspensionTargetCar(vehicles[0] || null);
          setIsSuspensionModalOpen(true);
        }}
        onOpenDriverMedical={() => {
          setDriverMedicalTargetCar(vehicles[0] || null);
          setIsDriverMedicalModalOpen(true);
        }}
        onOpenDrivingSchool={() => {
          setDrivingSchoolTargetCar(vehicles[0] || null);
          setIsDrivingSchoolModalOpen(true);
        }}
        onOpenAdrCompliance={() => {
          setAdrTargetCar(vehicles[0] || null);
          setIsAdrModalOpen(true);
        }}
        onOpenOversizePermit={() => {
          setOversizeTargetCar(vehicles[0] || null);
          setIsOversizeModalOpen(true);
        }}
        onOpenAccidentForensics={() => {
          setAccidentForensicsTargetCar(vehicles[0] || null);
          setIsAccidentForensicsModalOpen(true);
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-12 sm:pt-14 sm:pb-16 border-b border-slate-800/80">
        {/* Glowing background circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-blue-600/20 via-indigo-500/20 to-purple-600/20 blur-3xl pointer-events-none rounded-full" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-inner backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
            <span className="text-xs font-semibold text-slate-200">
              Ağıllı Süni İntellekt ilə Təchiz Olunmuş Avtomobil Ekosistemi
            </span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none">
            Avtomobil alqı-satqısında <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-300">
              Yeni Nəsil Zəka & Şəffaflıq
            </span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-lg max-w-2xl mx-auto font-normal">
            Süni intellekt ilə real bazar qiymətinin hesablanması, rəqəmsal zədə xəritəsi və avtomobillərin canlı müqayisəsi.
          </p>

          {/* Key Differentiators Counters */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-3xl mx-auto pt-4 text-left">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-1">
                <TrendingDown className="w-4 h-4" />
                <span>AI Qiymətləndirmə</span>
              </div>
              <p className="text-slate-300 text-xs">Hər maşının bazar dəyərindən fərqi saniyəsində görünür</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-blue-400 text-xs font-bold mb-1">
                <Layers className="w-4 h-4" />
                <span>Canlı Müqayisə</span>
              </div>
              <p className="text-slate-300 text-xs">4 maşını yan-yana qoyun, üstün cəhətləri avtomatik görün</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-purple-400 text-xs font-bold mb-1">
                <ShieldCheck className="w-4 h-4" />
                <span>Zədə & Boya Xəritəsi</span>
              </div>
              <p className="text-slate-300 text-xs">Hansı detal dəyişilib və ya rənglənib gizlədilmir</p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                <Calculator className="w-4 h-4" />
                <span>Daxili Bank Kreditləri</span>
              </div>
              <p className="text-slate-300 text-xs">Kapital, ABB və Unibank faizləri ilə dərhal aylıq ödəniş</p>
            </div>
          </div>

          {/* Quick Access to Customs Duty Calculator & Notariat Bill of Sale */}
          <div className="pt-2 flex flex-wrap justify-center gap-2.5">
            <button
              onClick={() => setCustomsTargetCar(vehicles[0] || null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-cyan-500/10 group cursor-pointer"
            >
              <Scale className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>DGK Gömrük & Aksiz Kalkulyatoru</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => setBillOfSaleTargetCar(vehicles[0] || null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-indigo-500/30 hover:border-indigo-500/60 text-indigo-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-indigo-500/10 group cursor-pointer"
            >
              <FileText className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
              <span>Notariat Alqı-Satqı Müqaviləsi Generatoru</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => setRecallTargetCar(vehicles[0] || null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-rose-500/30 hover:border-rose-500/60 text-rose-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-rose-500/10 group cursor-pointer"
              data-testid="hero-recall-registry-btn"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 group-hover:rotate-12 transition-transform" />
              <span>İstehsalçı Geri Çağırış Reyestri</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => setRegistrationTargetCar(vehicles[0] || null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-sky-500/30 hover:border-sky-500/60 text-sky-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-sky-500/10 group cursor-pointer"
              data-testid="hero-registration-btn"
            >
              <Building2 className="w-4 h-4 text-sky-400 group-hover:rotate-12 transition-transform" />
              <span>BDYP Qeydiyyat & Texpasport</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => setTrafficFinesTargetCar(vehicles[0] || null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-rose-500/30 hover:border-rose-500/60 text-rose-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-rose-500/10 group cursor-pointer"
              data-testid="hero-traffic-fines-btn"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400 group-hover:rotate-12 transition-transform" />
              <span>BDYP Radar Cərimələri & AsanPay</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => setRoadsideTargetCar(vehicles[0] || null)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-amber-500/10 group cursor-pointer"
              data-testid="hero-roadside-assistance-btn"
            >
              <Truck className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>156 Evakuasiya & Təcili Yol Köməyi</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setEvChargingTargetCar(vehicles.find(v => v.fuelType === 'electric') || null);
                setIsEvModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-emerald-500/10 group cursor-pointer"
              data-testid="hero-ev-charging-btn"
            >
              <Zap className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
              <span>Azərişıq & TokBaku EV Şəbəkəsi</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setParkingTargetCar(vehicles[0] || null);
                setIsParkingModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-sky-500/30 hover:border-sky-500/60 text-sky-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-sky-500/10 group cursor-pointer"
              data-testid="hero-az-parking-btn"
            >
              <CircleParking className="w-4 h-4 text-sky-400 group-hover:rotate-12 transition-transform" />
              <span>AYNA AzParking Radarı</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setFuelStationTargetCar(vehicles[0] || null);
                setIsFuelStationModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-amber-500/10 group cursor-pointer"
              data-testid="hero-fuel-stations-btn"
            >
              <Fuel className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>SOCAR & Azpetrol Yanacaq Radarı</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setTollRoadTargetCar(vehicles[0] || null);
                setIsTollRoadModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-cyan-500/10 group cursor-pointer"
              data-testid="hero-toll-roads-btn"
            >
              <Route className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>AAYDA M-1 Ödənişli Magistral Radarı</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setWindowTintTargetCar(vehicles[0] || null);
                setIsWindowTintModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-amber-500/10 group cursor-pointer"
              data-testid="hero-window-tint-btn"
            >
              <Sun className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>BDYP Qanuni Şüşə Plyonka İcazəsi</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setEuroprotocolTargetCar(vehicles[0] || null);
                setIsEuroprotocolModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-emerald-500/10 group cursor-pointer"
              data-testid="hero-europrotocol-btn"
            >
              <FileCheck className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
              <span>İSB & BDYP Rəsmi Avroprotokol Sistemi</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setPoaTargetCar(vehicles[0] || null);
                setIsPoaModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-indigo-500/30 hover:border-indigo-500/60 text-indigo-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-indigo-500/10 group cursor-pointer"
              data-testid="hero-power-of-attorney-btn"
            >
              <FileSignature className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
              <span>Elektron Etibarnamə & Notariat Sistemi</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setGreenCardTargetCar(vehicles[0] || null);
                setIsGreenCardModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-emerald-500/10 group cursor-pointer"
              data-testid="hero-green-card-btn"
            >
              <Globe className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
              <span>İSB Yaşıl Kart & Sərhəd Keçid Radarı</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setTaxiTargetCar(vehicles[0] || null);
                setIsTaxiModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-amber-500/10 group cursor-pointer"
              data-testid="hero-taxi-compliance-btn"
            >
              <Car className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>AYNA Taksi Portalı & E-Buraxılış Vərəqəsi</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setTuningTargetCar(vehicles[0] || null);
                setIsTuningModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-orange-500/30 hover:border-orange-500/60 text-orange-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-orange-500/10 group cursor-pointer"
              data-testid="hero-tuning-compliance-btn"
            >
              <Wrench className="w-4 h-4 text-orange-400 group-hover:rotate-12 transition-transform" />
              <span>BDYP Tüninq, Qazbalon (LPG/CNG) & AZS İcazə</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setImpoundLotTargetCar(vehicles[0] || null);
                setIsImpoundLotModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-rose-500/30 hover:border-rose-500/60 text-rose-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-rose-500/10 group cursor-pointer"
              data-testid="hero-impound-lot-btn"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400 group-hover:rotate-12 transition-transform" />
              <span>BDYP & AYNA Cərimə Meydançası və Evakuasiya</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setSpecialTrafficTargetCar(vehicles[0] || null);
                setIsSpecialTrafficModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-sky-500/30 hover:border-sky-500/60 text-sky-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-sky-500/10 group cursor-pointer"
              data-testid="hero-special-traffic-btn"
            >
              <Bus className="w-4 h-4 text-sky-400 group-hover:rotate-12 transition-transform" />
              <span>AYNA Avtobus Zolağı (100 ₼) & Bakı Giriş E-Buraxılış</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setTireComplianceTargetCar(vehicles[0] || null);
                setIsTireComplianceModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/30 hover:border-cyan-500/60 text-cyan-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-cyan-500/10 group cursor-pointer"
              data-testid="hero-tire-compliance-btn"
            >
              <Disc className="w-4 h-4 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span>BDYP Şin Standartları (YHQ Əlavə 1) & Qış Dağ Radarı</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setHeadlightComplianceTargetCar(vehicles[0] || null);
                setIsHeadlightComplianceModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-amber-500/10 group cursor-pointer"
              data-testid="hero-headlight-compliance-btn"
            >
              <Lightbulb className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>BDYP Fara, Ksenon/LED (İXM 342.2-1) & Reqloskop Stendi</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setPassengerSafetyTargetCar(vehicles[0] || null);
                setIsPassengerSafetyModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-rose-500/30 hover:border-rose-500/60 text-rose-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-rose-500/10 group cursor-pointer"
              data-testid="hero-passenger-safety-btn"
            >
              <HeartPulse className="w-4 h-4 text-rose-400 group-hover:rotate-12 transition-transform" />
              <span>BDYP & FHN Odluq, Tibbi Çanta & Uşaq Avtokreslosu (İSOFIX)</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setEmissionsComplianceTargetCar(vehicles[0] || null);
                setIsEmissionsComplianceModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-emerald-500/30 hover:border-emerald-500/60 text-emerald-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-emerald-500/10 group cursor-pointer"
              data-testid="hero-emissions-compliance-btn"
            >
              <Wind className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
              <span>BDYP & ETSN «Təmiz Hava» Qazanalizator, Katalizator & DPF</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setBrakeSteeringTargetCar(vehicles[0] || null);
                setIsBrakeSteeringModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-red-500/30 hover:border-red-500/60 text-red-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-red-500/10 group cursor-pointer"
              data-testid="hero-brake-steering-btn"
            >
              <Disc className="w-4 h-4 text-red-400 group-hover:rotate-12 transition-transform" />
              <span>BDYP Tormoz Stendi, Sükan Lüftometri (YHQ Əlavə 1) & DOT-4</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setVisibilityHornTargetCar(vehicles[0] || null);
                setIsVisibilityHornModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-sky-500/30 hover:border-sky-500/60 text-sky-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-sky-500/10 group cursor-pointer"
              data-testid="hero-visibility-horn-btn"
            >
              <Eye className="w-4 h-4 text-sky-400 group-hover:rotate-12 transition-transform" />
              <span>BDYP Alın Şüşəsi, Şüşəsilən & FİFA Siqnal Auditoru</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setForensicPlateTargetCar(vehicles[0] || null);
                setIsForensicPlateModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-indigo-500/30 hover:border-indigo-500/60 text-indigo-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-indigo-500/10 group cursor-pointer"
              data-testid="hero-forensic-plate-btn"
            >
              <Fingerprint className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
              <span>BDYP Mühərrik № Ekspertiza, DQN (İXM 342.7) & SRS Stendi</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setBodyworkAdvertisingTargetCar(vehicles[0] || null);
                setIsBodyworkAdvertisingModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-fuchsia-500/30 hover:border-fuchsia-500/60 text-fuchsia-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-fuchsia-500/10 group cursor-pointer"
              data-testid="hero-bodywork-advertising-btn"
            >
              <Palette className="w-4 h-4 text-fuchsia-400 group-hover:rotate-12 transition-transform" />
              <span>BDYP & ADRA Kuzov Rəngi/Vinil (YHQ 27), Reklam & Farkop Portalı</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>

            <button
              onClick={() => {
                setTachographWorkRestTargetCar(vehicles[0] || null);
                setIsTachographWorkRestModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-indigo-500/30 hover:border-indigo-500/60 text-indigo-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-indigo-500/10 group cursor-pointer"
              data-testid="hero-tachograph-work-rest-btn"
            >
              <Timer className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
              <span>AYNA Rəqəmsal Taxoqraf, İş-İstirahət (AETR) & E-Uğur Yol Vərəqəsi</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => {
                setSuspensionTargetCar(vehicles[0] || null);
                setIsSuspensionModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-amber-500/30 hover:border-amber-500/60 text-amber-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-amber-500/10 group cursor-pointer"
              data-testid="hero-suspension-chassis-btn"
            >
              <Activity className="w-4 h-4 text-amber-400 group-hover:rotate-12 transition-transform" />
              <span>BDYP & AZS Asqı, EUSAMA, Peredok & Hunter 3D Razval</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>


            <button
              onClick={() => {
                setHvBatteryTargetCar(vehicles.find(v => v.fuelType === 'electric' || v.fuelType === 'hybrid') || vehicles[0] || null);
                setIsHvBatteryModalOpen(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-teal-500/30 hover:border-teal-500/60 text-teal-300 text-xs sm:text-sm font-semibold transition-all shadow-lg shadow-teal-500/10 group cursor-pointer"
              data-testid="hero-hv-battery-safety-btn"
            >
              <BatteryCharging className="w-4 h-4 text-teal-400 group-hover:rotate-12 transition-transform" />
              <span>AZS & BDYP Elektromobil/Hibrid HV İzolyasiya (R100), SOH% & Yaşıl Kredit</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filter Bar */}
        <FilterBar
          filters={filters}
          setFilters={setFilters}
          makes={uniqueMakes}
          models={uniqueModels}
          cities={uniqueCities}
          totalResults={filteredVehicles.length}
          lang={lang}
        />

        {/* Vehicle Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <CarCardSkeleton key={`skeleton-${i}`} />
            ))}
          </div>
        ) : filteredVehicles.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {paginatedVehicles.map((car) => (
                <CarCard
                  key={car.id}
                  vehicle={car}
                  currency={currency}
                  lang={lang}
                  isCompared={comparedVehicleIds.includes(car.id)}
                  isFavorite={favoriteIds.includes(car.id)}
                  onToggleFavorite={toggleFavorite}
                  onToggleCompare={toggleCompare}
                  onSelect={(v) => {
                    setSelectedVehicle(v);
                    addRecentlyViewed(v.id);
                  }}
                />
              ))}
            </div>
            
            <Pagination 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => {
                goToPage(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </>
        ) : (
          <EmptyState
            icon={Car}
            title={lang === 'az' ? 'Axtarışa uyğun elan tapılmadı' : lang === 'ru' ? 'Подходящих объявлений не найдено' : 'No matching vehicles found'}
            description={lang === 'az' ? 'Zəhmət olmasa axtarış parametrlərini genişləndirin və ya filtrləri sıfırlayın.' : lang === 'ru' ? 'Пожалуйста, расширьте параметры поиска или сбросьте фильтры.' : 'Please broaden your search parameters or reset the filters.'}
            actionLabel={TRANSLATIONS[lang].resetFilters}
            onAction={resetFilters}
          />
        )}
      </main>

      {/* Floating Bottom Comparison Drawer (when cars are picked) */}
      {comparedVehicles.length > 0 && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-2xl bg-slate-900/95 border border-blue-500/50 rounded-2xl p-3 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-2 overflow-x-auto">
            <span className="text-xs font-bold text-blue-400 whitespace-nowrap pl-2">
              Müqayisə ({comparedVehicles.length}/4):
            </span>
            <div className="flex gap-2">
              {comparedVehicles.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-800 text-xs text-white border border-slate-700 flex-shrink-0"
                >
                  <span className="truncate max-w-[100px]">{c.title}</span>
                  <button
                    onClick={() => removeComparedVehicle(c.id)}
                    className="text-slate-400 hover:text-red-400"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={clearComparison}
              className="text-xs text-slate-400 hover:text-white px-2"
            >
              Təmizlə
            </button>
            <button
              onClick={() => setIsCompareOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/30 flex items-center gap-1.5"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Müqayisə et</span>
            </button>
          </div>
        </div>
      )}

      <React.Suspense fallback={null}>
        {/* Car Detail Modal */}
        <CarDetailModal
          vehicle={selectedVehicle}
          currency={currency}
          lang={lang}
          onClose={() => setSelectedVehicle(null)}
          onOpenLoanForCar={(car) => {
            setSelectedVehicle(null);
            setLoanCarTarget(car);
            setIsLoanModalOpen(true);
          }}
          onOpenVinHistory={(car) => {
            setVinTargetCar(car);
          }}
          onOpenPriceHistory={(car) => {
            setPriceHistoryTargetCar(car);
          }}
          onOpenTcoForecast={(car) => {
            setTcoTargetCar(car);
          }}
          onOpenTradeInValuation={(car) => {
            setTradeInTargetCar(car);
          }}
          onOpenInspection={(car) => {
            setInspectionTargetCar(car);
          }}
          onOpenCustomsCalculator={(car) => {
            setCustomsTargetCar(car);
          }}
          onOpenLienRegistry={(car) => {
            setLienTargetCar(car);
          }}
          onOpenBillOfSale={(car) => {
            setBillOfSaleTargetCar(car);
          }}
          onOpenInsuranceCalculator={(car) => {
            setInsuranceTargetCar(car);
          }}
          onOpenEscrowSimulator={(car) => {
            setEscrowTargetCar(car);
          }}
          onOpenServicePassport={(car) => {
            setServicePassportTargetCar(car);
          }}
          onOpenRecallRegistry={(car) => {
            setRecallTargetCar(car);
          }}
          onOpenTechnicalInspection={(car) => {
            setTechnicalInspectionTargetCar(car);
          }}
          onOpenRegistration={(car) => {
            setRegistrationTargetCar(car);
          }}
          onOpenTrafficFines={(car) => {
            setTrafficFinesTargetCar(car);
          }}
          onOpenRoadsideAssistance={(car) => {
            setRoadsideTargetCar(car);
          }}
          onOpenEvCharging={(car) => {
            setEvChargingTargetCar(car);
            setIsEvModalOpen(true);
          }}
          onOpenFuelStations={(car) => {
            setFuelStationTargetCar(car);
            setIsFuelStationModalOpen(true);
          }}
          onOpenTollRoads={(car) => {
            setTollRoadTargetCar(car);
            setIsTollRoadModalOpen(true);
          }}
          onOpenWindowTint={(car) => {
            setWindowTintTargetCar(car);
            setIsWindowTintModalOpen(true);
          }}
          onOpenEuroprotocol={(car) => {
            setEuroprotocolTargetCar(car);
            setIsEuroprotocolModalOpen(true);
          }}
          onOpenPowerOfAttorney={(car) => {
            setPoaTargetCar(car);
            setIsPoaModalOpen(true);
          }}
          onOpenGreenCard={(car) => {
            setGreenCardTargetCar(car);
            setIsGreenCardModalOpen(true);
          }}
          onOpenTaxiCompliance={(car) => {
            setTaxiTargetCar(car);
            setIsTaxiModalOpen(true);
          }}
          onOpenTuningCompliance={(car) => {
            setTuningTargetCar(car);
            setIsTuningModalOpen(true);
          }}
          onOpenScrappage={(car) => {
            setScrappageTargetCar(car);
            setIsScrappageModalOpen(true);
          }}
          onOpenImpoundLot={(car) => {
            setImpoundLotTargetCar(car);
            setIsImpoundLotModalOpen(true);
          }}
          onOpenSpecialTraffic={(car) => {
            setSpecialTrafficTargetCar(car);
            setIsSpecialTrafficModalOpen(true);
          }}
          onOpenDriverLicense={(car) => {
            setDriverLicenseTargetCar(car);
            setIsDriverLicenseModalOpen(true);
          }}
          onOpenTireCompliance={(car) => {
            setTireComplianceTargetCar(car);
            setIsTireComplianceModalOpen(true);
          }}
          onOpenHeadlightCompliance={(car) => {
            setHeadlightComplianceTargetCar(car);
            setIsHeadlightComplianceModalOpen(true);
          }}
          onOpenPassengerSafety={(car) => {
            setPassengerSafetyTargetCar(car);
            setIsPassengerSafetyModalOpen(true);
          }}
          onOpenEmissionsCompliance={(car) => {
            setEmissionsComplianceTargetCar(car);
            setIsEmissionsComplianceModalOpen(true);
          }}
          onOpenBrakeSteering={(car) => {
            setBrakeSteeringTargetCar(car);
            setIsBrakeSteeringModalOpen(true);
          }}
          onOpenVisibilityHorn={(car) => {
            setVisibilityHornTargetCar(car);
            setIsVisibilityHornModalOpen(true);
          }}
          onOpenForensicPlate={(car) => {
            setForensicPlateTargetCar(car);
            setIsForensicPlateModalOpen(true);
          }}
          onOpenBodyworkAdvertising={(car) => {
            setBodyworkAdvertisingTargetCar(car);
            setIsBodyworkAdvertisingModalOpen(true);
          }}
          onOpenTachographWorkRest={(car) => {
            setTachographWorkRestTargetCar(car);
            setIsTachographWorkRestModalOpen(true);
          }}
          onOpenHvBatterySafety={(car) => {
            setHvBatteryTargetCar(car);
            setIsHvBatteryModalOpen(true);
          }}
          onOpenSuspensionChassis={(car) => {
            setSuspensionTargetCar(car);
            setIsSuspensionModalOpen(true);
          }}
          onOpenDriverMedical={(car) => {
            setDriverMedicalTargetCar(car);
            setIsDriverMedicalModalOpen(true);
          }}
          onOpenDrivingSchool={(car) => {
            setDrivingSchoolTargetCar(car);
            setIsDrivingSchoolModalOpen(true);
          }}
          onOpenAdrCompliance={(car) => {
            setAdrTargetCar(car);
            setIsAdrModalOpen(true);
          }}
          onOpenOversizePermit={(car) => {
            setOversizeTargetCar(car);
            setIsOversizeModalOpen(true);
          }}
          onOpenAccidentForensics={(car) => {
            setAccidentForensicsTargetCar(car);
            setIsAccidentForensicsModalOpen(true);
          }}
          onOpenDealership={(seller) => {
            setDealershipTarget(seller);
          }}
        />

        {/* VIN History Report Modal */}
        <VinHistoryModal
          vehicle={vinTargetCar}
          lang={lang}
          onClose={() => setVinTargetCar(null)}
        />

        {/* Price History & Market Dynamics Modal */}
        <PriceHistoryModal
          vehicle={priceHistoryTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => setPriceHistoryTargetCar(null)}
        />

        {/* 5-Year Total Cost of Ownership (TCO) Forecaster Modal */}
        <TcoForecasterModal
          isOpen={!!tcoTargetCar}
          vehicle={tcoTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => setTcoTargetCar(null)}
        />

        {/* Trade-In & Barter Valuation Estimator Modal */}
        <TradeInModal
          isOpen={!!tradeInTargetCar}
          targetVehicle={tradeInTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => setTradeInTargetCar(null)}
        />

        {/* 150-Point Pre-Purchase Inspection & OBD-II Diagnostics Modal */}
        <InspectionModal
          isOpen={!!inspectionTargetCar}
          vehicle={inspectionTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => setInspectionTargetCar(null)}
        />

        {/* Import Customs Duty and DGK Tariff Calculator Modal */}
        <CustomsCalculatorModal
          isOpen={!!customsTargetCar}
          initialVehicle={customsTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => setCustomsTargetCar(null)}
        />

        {/* Stolen Vehicle & Bank Lien Registry Verification Modal */}
        <LienRegistryModal
          isOpen={!!lienTargetCar}
          vehicle={lienTargetCar}
          lang={lang}
          onClose={() => setLienTargetCar(null)}
          onOpenTrafficFines={(plate) => {
            const found = vehicles.find((v) => v.plateNumber === plate) || {
              ...vehicles[0],
              plateNumber: plate,
            };
            setTrafficFinesTargetCar(found);
          }}
        />

        {/* Vehicle Bill of Sale & Notary Purchase Contract Generator Modal */}
        <BillOfSaleModal
          isOpen={!!billOfSaleTargetCar}
          vehicle={billOfSaleTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => setBillOfSaleTargetCar(null)}
        />

        {/* Compulsory & KASKO Motor Insurance Calculator & Policy Generator Modal */}
        <InsuranceCalculatorModal
          isOpen={!!insuranceTargetCar}
          vehicle={insuranceTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => setInsuranceTargetCar(null)}
        />

        {/* Seller Identity & Digital Escrow Deposit Holding Simulator Modal */}
        <EscrowSimulatorModal
          isOpen={!!escrowTargetCar}
          vehicle={escrowTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => setEscrowTargetCar(null)}
        />

        {/* Digital Service Passport & Maintenance Schedule Planner Modal */}
        <ServicePassportModal
          isOpen={!!servicePassportTargetCar}
          vehicle={servicePassportTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => setServicePassportTargetCar(null)}
        />

        {/* Official Manufacturer Safety Recall & TSB Registry Modal */}
        <RecallRegistryModal
          isOpen={!!recallTargetCar}
          vehicle={recallTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => setRecallTargetCar(null)}
        />

        {/* Official State Roadworthiness & Technical Inspection (DYP) Modal */}
        <TechnicalInspectionModal
          isOpen={!!technicalInspectionTargetCar}
          vehicle={technicalInspectionTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => setTechnicalInspectionTargetCar(null)}
        />

        {/* Official State Vehicle Re-registration & Plate Registry (BDYP) Modal */}
        <VehicleRegistrationModal
          isOpen={!!registrationTargetCar}
          vehicle={registrationTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => setRegistrationTargetCar(null)}
        />

        {/* Official BDYP State Traffic Fines & MMX Radar Protocols Modal */}
        <TrafficFinesModal
          isOpen={!!trafficFinesTargetCar}
          vehicle={trafficFinesTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => setTrafficFinesTargetCar(null)}
        />

        {/* 156 Roadside Assistance & Emergency Towing Network Modal */}
        <RoadsideAssistanceModal
          isOpen={!!roadsideTargetCar}
          vehicle={roadsideTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => setRoadsideTargetCar(null)}
        />

        {/* Azərişıq & TokBaku EV Charging Station Network & Smart Fast-Charge Modal */}
        <EvChargingModal
          isOpen={isEvModalOpen || !!evChargingTargetCar}
          vehicle={evChargingTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => {
            setIsEvModalOpen(false);
            setEvChargingTargetCar(null);
          }}
        />

        {/* AYNA AzParking Smart City Parking Locator & Tariff Engine Modal */}
        <AzParkingModal
          isOpen={isParkingModalOpen || !!parkingTargetCar}
          vehicle={parkingTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => {
            setIsParkingModalOpen(false);
            setParkingTargetCar(null);
          }}
        />

        {/* SOCAR & Azpetrol Fuel Station Radar & Tarif Şurası Modal */}
        <FuelStationModal
          isOpen={isFuelStationModalOpen || !!fuelStationTargetCar}
          vehicle={fuelStationTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => {
            setIsFuelStationModalOpen(false);
            setFuelStationTargetCar(null);
          }}
        />

        {/* AAYDA M-1 Toll Highway & E-Toll FastPass Modal */}
        <TollRoadModal
          isOpen={isTollRoadModalOpen || !!tollRoadTargetCar}
          vehicle={tollRoadTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => {
            setIsTollRoadModalOpen(false);
            setTollRoadTargetCar(null);
          }}
        />

        {/* BDYP Window Tint & Legal Permit Modal */}
        <WindowTintModal
          isOpen={isWindowTintModalOpen || !!windowTintTargetCar}
          vehicle={windowTintTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => {
            setIsWindowTintModalOpen(false);
            setWindowTintTargetCar(null);
          }}
        />

        {/* ISB & BDYP Official Europrotocol Minor Accident Modal */}
        <EuroprotocolModal
          isOpen={isEuroprotocolModalOpen || !!europrotocolTargetCar}
          vehicle={europrotocolTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => {
            setIsEuroprotocolModalOpen(false);
            setEuroprotocolTargetCar(null);
          }}
        />

        {/* Official Electronic Vehicle Power of Attorney & Notarial Trust Modal */}
        <PowerOfAttorneyModal
          isOpen={isPoaModalOpen || !!poaTargetCar}
          vehicle={poaTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => {
            setIsPoaModalOpen(false);
            setPoaTargetCar(null);
          }}
        />

        {/* Official ISB Green Card International Insurance & Border Transit Modal */}
        <GreenCardModal
          isOpen={isGreenCardModalOpen || !!greenCardTargetCar}
          vehicle={greenCardTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => {
            setIsGreenCardModalOpen(false);
            setGreenCardTargetCar(null);
          }}
        />

        {/* Official AYNA Taxi Compliance & Electronic Carrier Pass Modal */}
        <TaxiComplianceModal
          isOpen={isTaxiModalOpen || !!taxiTargetCar}
          vehicle={taxiTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => {
            setIsTaxiModalOpen(false);
            setTaxiTargetCar(null);
          }}
        />

        {/* Official BDYP & AZS Constructive Modification, Autogas (LPG/CNG) & Tuning Portal Modal */}
        <TuningComplianceModal
          isOpen={isTuningModalOpen || !!tuningTargetCar}
          vehicle={tuningTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => {
            setIsTuningModalOpen(false);
            setTuningTargetCar(null);
          }}
        />

        {/* Official Təmiz Şəhər ASC Vehicle Scrappage, Utilization Fee & Eco-Voucher Modal */}
        <VehicleScrappageModal
          isOpen={isScrappageModalOpen || !!scrappageTargetCar}
          vehicle={scrappageTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => {
            setIsScrappageModalOpen(false);
            setScrappageTargetCar(null);
          }}
        />

        {/* Official BDYP & AYNA Impound Lot, Towing Protocol & Electronic Release Modal */}
        <ImpoundLotModal
          isOpen={isImpoundLotModalOpen || !!impoundLotTargetCar}
          vehicle={impoundLotTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => {
            setIsImpoundLotModalOpen(false);
            setImpoundLotTargetCar(null);
          }}
        />

        {/* Official AYNA Bus Lane (İXM 327.1-1), Baku Special Entry Regime & WIM Portal Modal */}
        <SpecialTrafficRegimeModal
          isOpen={isSpecialTrafficModalOpen || !!specialTrafficTargetCar}
          vehicle={specialTrafficTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => {
            setIsSpecialTrafficModalOpen(false);
            setSpecialTrafficTargetCar(null);
          }}
        />

        {/* Official BDYP & ASAN Driver's License Category (B/BE), Fees & Exam Portal Modal */}
        <DriverLicenseModal
          isOpen={isDriverLicenseModalOpen || !!driverLicenseTargetCar}
          vehicle={driverLicenseTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => {
            setIsDriverLicenseModalOpen(false);
            setDriverLicenseTargetCar(null);
          }}
        />

        {/* Official BDYP Tire Standards (YHQ Annex 1), Tread Depth & Mountain Winter Readiness Modal */}
        <TireComplianceModal
          isOpen={isTireComplianceModalOpen || !!tireComplianceTargetCar}
          vehicle={tireComplianceTargetCar}
          currency={currency}
          lang={lang}
          onClose={() => {
            setIsTireComplianceModalOpen(false);
            setTireComplianceTargetCar(null);
          }}
        />

        {/* Official BDYP Vehicle Lighting Standards, Xenon/LED Auditor & Optical Regloscope Modal */}
        <HeadlightComplianceModal
          isOpen={isHeadlightComplianceModalOpen || !!headlightComplianceTargetCar}
          vehicle={headlightComplianceTargetCar}
          currency={currency}
          onClose={() => {
            setIsHeadlightComplianceModalOpen(false);
            setHeadlightComplianceTargetCar(null);
          }}
        />

        {/* Official BDYP & FHN Emergency Safety Kit, Child Restraint (ISOFIX) & Passenger Compliance Modal */}
        <PassengerSafetyModal
          isOpen={isPassengerSafetyModalOpen || !!passengerSafetyTargetCar}
          vehicle={passengerSafetyTargetCar}
          currency={currency}
          onClose={() => {
            setIsPassengerSafetyModalOpen(false);
            setPassengerSafetyTargetCar(null);
          }}
        />

        {/* Official BDYP & ETSN Exhaust Emissions, Gas Analyzer & Catalyst/DPF Compliance Modal */}
        <EmissionsComplianceModal
          isOpen={isEmissionsComplianceModalOpen || !!emissionsComplianceTargetCar}
          vehicle={emissionsComplianceTargetCar}
          currency={currency}
          onClose={() => {
            setIsEmissionsComplianceModalOpen(false);
            setEmissionsComplianceTargetCar(null);
          }}
        />

        {/* Official BDYP Braking System & Steering Mechanism Stand Modal */}
        <BrakeSteeringModal
          isOpen={isBrakeSteeringModalOpen || !!brakeSteeringTargetCar}
          vehicle={brakeSteeringTargetCar}
          currency={currency}
          onClose={() => {
            setIsBrakeSteeringModalOpen(false);
            setBrakeSteeringTargetCar(null);
          }}
        />

        {/* Official BDYP Driver Visibility, Windshield, Wipers & Acoustic Horn ("FIFA") Modal */}
        <VisibilityHornComplianceModal
          isOpen={isVisibilityHornModalOpen || !!visibilityHornTargetCar}
          vehicle={visibilityHornTargetCar}
          currency={currency}
          onClose={() => {
            setIsVisibilityHornModalOpen(false);
            setVisibilityHornTargetCar(null);
          }}
        />

        {/* Official BDYP Engine/VIN Forensic, DQN Readability (IXM 342.7) & SRS Airbag Modal */}
        <ForensicPlateComplianceModal
          isOpen={isForensicPlateModalOpen || !!forensicPlateTargetCar}
          vehicle={forensicPlateTargetCar}
          currency={currency}
          onClose={() => {
            setIsForensicPlateModalOpen(false);
            setForensicPlateTargetCar(null);
          }}
        />

        {/* Official BDYP & ADRA Exterior Bodywork, Vinyl Wrap, Advertising & Farkop Modal */}
        <BodyworkAdvertisingModal
          isOpen={isBodyworkAdvertisingModalOpen || !!bodyworkAdvertisingTargetCar}
          vehicle={bodyworkAdvertisingTargetCar}
          currency={currency}
          onClose={() => {
            setIsBodyworkAdvertisingModalOpen(false);
            setBodyworkAdvertisingTargetCar(null);
          }}
        />

        {/* Official AYNA & BDYP Digital Tachograph, Driver Work/Rest Regime (AETR) & E-Ugur Waybill Modal */}
        <TachographWorkRestModal
          isOpen={isTachographWorkRestModalOpen || !!tachographWorkRestTargetCar}
          vehicle={tachographWorkRestTargetCar}
          currency={currency}
          onClose={() => {
            setIsTachographWorkRestModalOpen(false);
            setTachographWorkRestTargetCar(null);
          }}
        />
        {/* Official BDYP & AZS Suspension, Shock Absorber (EUSAMA), Peredok & Chassis 3D Alignment Modal */}
        <SuspensionChassisModal
          isOpen={isSuspensionModalOpen || !!suspensionTargetCar}
          vehicle={suspensionTargetCar}
          currency={currency}
          onClose={() => {
            setIsSuspensionModalOpen(false);
            setSuspensionTargetCar(null);
          }}
        />

        {/* Official Səhiyyə Nazirliyi & BDYP Driver Medical Examination (Forma AZS-083/e) Modal */}
        <DriverMedicalModal
          isOpen={isDriverMedicalModalOpen || !!driverMedicalTargetCar}
          vehicle={driverMedicalTargetCar}
          currency={currency}
          onClose={() => {
            setIsDriverMedicalModalOpen(false);
            setDriverMedicalTargetCar(null);
          }}
        />

        {/* Official BDYP & Elm Nazirliyi Driving School & Practical Exam Modal */}
        <DrivingSchoolModal
          isOpen={isDrivingSchoolModalOpen || !!drivingSchoolTargetCar}
          vehicle={drivingSchoolTargetCar}
          currency={currency}
          onClose={() => {
            setIsDrivingSchoolModalOpen(false);
            setDrivingSchoolTargetCar(null);
          }}
        />

        {/* Official FHN & BDYP Dangerous Goods Road Transport (ADR) Modal */}
        <AdrComplianceModal
          isOpen={isAdrModalOpen || !!adrTargetCar}
          currency={currency}
          initialPlate={adrTargetCar?.plateNumber || '99-JH-120'}
          initialVehicleModel={adrTargetCar ? `${adrTargetCar.make} ${adrTargetCar.model}` : 'Mercedes-Benz Actros 1845 ADR (FL)'}
          onClose={() => {
            setIsAdrModalOpen(false);
            setAdrTargetCar(null);
          }}
        />

        {/* Official AAYDA & BDYP Heavy Axle Load & Oversize Cargo Road Transport Modal */}
        <OversizePermitModal
          isOpen={isOversizeModalOpen || !!oversizeTargetCar}
          currency={currency}
          initialPlate={oversizeTargetCar?.plateNumber || '99-JH-840'}
          onClose={() => {
            setIsOversizeModalOpen(false);
            setOversizeTargetCar(null);
          }}
        />

        {/* Official BDYP & Ədliyyə Nazirliyi YNH Məhkəmə Avtotexniki Ekspertizası Modal */}
        <AccidentForensicsModal
          isOpen={isAccidentForensicsModalOpen || !!accidentForensicsTargetCar}
          currency={currency}
          initialPlate={accidentForensicsTargetCar?.plateNumber || '90-OX-404'}
          initialVehicleModel={accidentForensicsTargetCar ? `${accidentForensicsTargetCar.make} ${accidentForensicsTargetCar.model}` : 'BMW 530i (G30)'}
          onClose={() => {
            setIsAccidentForensicsModalOpen(false);
            setAccidentForensicsTargetCar(null);
          }}
        />



        {/* Official AZS, BDYP & FHN EV/Hybrid High-Voltage Insulation (R100), SOH% & Green Privilege Modal */}
        <HvBatterySafetyModal
          isOpen={isHvBatteryModalOpen || !!hvBatteryTargetCar}
          vehicle={hvBatteryTargetCar}
          currency={currency}
          onClose={() => {
            setIsHvBatteryModalOpen(false);
            setHvBatteryTargetCar(null);
          }}
        />

        {/* Car Comparator Modal */}
        {isCompareOpen && (
          <CarComparator
            vehicles={comparedVehicles}
            currency={currency}
            lang={lang}
            onRemoveVehicle={removeComparedVehicle}
            onClose={() => setIsCompareOpen(false)}
            onSelectVehicle={(v) => {
              setIsCompareOpen(false);
              setSelectedVehicle(v);
            }}
          />
        )}

        {/* Loan Calculator Modal */}
        {isLoanModalOpen && (
          <LoanCalculatorModal
            initialVehicle={loanCarTarget}
            currency={currency}
            lang={lang}
            onClose={() => {
              setIsLoanModalOpen(false);
              setLoanCarTarget(null);
            }}
          />
        )}

        {/* Dealership Profile Modal */}
        {dealershipTarget && (
          <DealershipProfileModal
            seller={dealershipTarget}
            currency={currency}
            lang={lang}
            onClose={() => setDealershipTarget(null)}
            onSelectVehicle={(v) => {
              setDealershipTarget(null);
              setSelectedVehicle(v);
            }}
            favoriteIds={favoriteIds}
            comparedVehicleIds={comparedVehicleIds}
            onToggleFavorite={toggleFavorite}
            onToggleCompare={toggleCompare}
          />
        )}
      </React.Suspense>

      {/* AI Advisor Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* AI Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-20 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white shadow-lg shadow-purple-500/25">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-black text-white flex items-center gap-2">
                    <span>AutoNext AI Məsləhətçi</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      GPT-4o Vision Powered
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">Büdcənizə və istəyinizə uyğun ən doğru avtomobili saniyələr içində seçin</p>
                </div>
              </div>

              <button
                onClick={() => setIsAiModalOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* AI Modal Body */}
            <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
              {/* Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Hazır Axtarış Ssenariləri
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { title: 'Şəhər üçün ən qənaətcil (Hibrid / EV)', q: 'Baku tıxaclarında az yandıran hibrid və ya elektrik maşın', tag: 'Qənaət' },
                    { title: 'Ailə üçün geniş və təhlükəsiz Krossover (SUV)', q: 'Böyük ailə üçün təhlükəsiz və geniş baqajlı SUV', tag: 'Ailə' },
                    { title: 'Lüks və yüksək status (AMG / GTS / LC250)', q: 'Gözəl səs, güclü mühərrik və maksimal statuslu maşın', tag: 'Status' },
                    { title: '50 000 AZN-ə qədər etibarlı biznes sedan', q: '50000 AZN büdcə ilə konfortlu və dözümlü sedan', tag: 'Biznes' },
                  ].map((preset) => (
                    <button
                      key={preset.title}
                      type="button"
                      onClick={() => {
                        setAiActivePreset(preset.q);
                        setAiPrompt('');
                      }}
                      className={`p-3 rounded-2xl border text-left text-xs transition-all flex items-center justify-between gap-3 ${
                        aiActivePreset === preset.q
                          ? 'bg-purple-600/15 border-purple-500 text-white shadow-md shadow-purple-500/15'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800/40 hover:text-white'
                      }`}
                    >
                      <span className="font-semibold">{preset.title}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-800 text-purple-400 flex-shrink-0">
                        {preset.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Prompt Box */}
              <div className="relative">
                <input
                  type="text"
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="Məsələn: 25.000 AZN-ə qədər az yandıran, ehtiyat hissəsi ucuz maşın..."
                  className="w-full pl-4 pr-12 py-3.5 bg-slate-950/80 border border-slate-700 rounded-2xl text-white text-sm focus:outline-none focus:border-purple-500 transition-all placeholder-slate-500"
                />
                <button
                  onClick={() => {
                    if (aiPrompt.trim()) setAiActivePreset(aiPrompt);
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md shadow-purple-600/30"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>

              {/* AI Diagnosis */}
              <div className="p-4 rounded-2xl bg-purple-950/20 border border-purple-800/30 flex items-start gap-3">
                <Zap className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div className="text-xs sm:text-sm text-slate-300 space-y-1">
                  <strong className="text-purple-300 block font-semibold">
                    AutoNext Ağıllı Uyğunluq Nəticəsi:
                  </strong>
                  <p className="leading-relaxed">
                    «{aiActivePreset}» meyarlarına əsasən Bakı bazarındakı avtomobillər təhlil edildi. Aşağıdakı modellər ən yüksək etibarlılıq və yanacaq səmərəliliyi göstəricilərinə malikdir:
                  </p>
                </div>
              </div>

              {/* Recommended Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {aiRecommendations.map((car) => (
                  <div
                    key={car.id}
                    onClick={() => {
                      setIsAiModalOpen(false);
                      setSelectedVehicle(car);
                    }}
                    className="group bg-slate-950/80 border border-slate-800 hover:border-purple-500/50 rounded-2xl p-3 flex flex-col justify-between cursor-pointer transition-all hover:scale-[1.02]"
                  >
                    <div>
                      <img
                        src={car.images[0]}
                        alt={car.title}
                        className="w-full h-32 object-cover rounded-xl mb-2.5"
                      />
                      <h4 className="font-bold text-white text-sm group-hover:text-purple-400 transition-colors line-clamp-1">
                        {car.title}
                      </h4>
                      <p className="text-xs text-slate-400 mb-2">
                        {car.year} • {car.fuelConsumptionLPer100Km === 0 ? '0 L (EV)' : `${car.fuelConsumptionLPer100Km} L/100km`}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
                      <span className="font-black text-white text-sm">
                        {formatPrice(car.priceAzn, currency)}
                      </span>
                      <span className="text-xs font-semibold text-purple-400 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Seç <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Listing Modal */}
      {isCreateListingOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-xl font-black text-white">Yeni Elan Yerləşdir</h3>
                <p className="text-xs text-slate-400">AutoNext alqoritmləri avtomobiliniz üçün real bazar qiymətini avtomatik hesablayır</p>
              </div>
              <button
                onClick={() => setIsCreateListingOpen(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">VIN Kod</label>
                <input
                  type="text"
                  placeholder="Məsələn: WBA5A7C50JB192841"
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Marka & Model</label>
                  <input
                    type="text"
                    placeholder="Toyota Camry"
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Buraxılış İli</label>
                  <input
                    type="number"
                    defaultValue={2022}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Yürüş (km)</label>
                  <input
                    type="number"
                    defaultValue={45000}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Təklif Qiyməti (AZN)</label>
                  <input
                    type="number"
                    defaultValue={52000}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white font-bold text-emerald-400"
                  />
                </div>
              </div>

              {/* Instant Fair-Price Indicator */}
              <div className="p-3.5 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-xs text-emerald-300 flex items-center justify-between">
                <div>
                  <span className="font-bold">AI Bazar Təhlili: </span>
                  Bu avtomobil üçün Bakı üzrə orta bazar qiyməti: <strong>51 500 AZN</strong>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                  Bazar Qiyməti
                </span>
              </div>

              <button
                onClick={() => {
                  toastManager.add('Elanınız uğurla yerləşdirildi və moderasiyaya göndərildi!', 'success');
                  setIsCreateListingOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-bold transition-all shadow-lg shadow-blue-600/20"
              >
                Elanı Dərc Et
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recently Viewed Section */}
      {recentlyViewedVehicles.length > 0 && !isLoading && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 mt-8 border-t border-slate-800/80 w-full overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-400" />
              {lang === 'az' ? 'Son baxılanlar' : lang === 'en' ? 'Recently Viewed' : 'Недавно просмотренные'}
            </h2>
            <button 
              onClick={clearRecentlyViewed}
              className="text-xs font-semibold text-slate-400 hover:text-red-400 transition-colors"
            >
              {lang === 'az' ? 'Tarixçəni təmizlə' : lang === 'en' ? 'Clear history' : 'Очистить историю'}
            </button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
            {recentlyViewedVehicles.map(car => (
              <div key={`recent-${car.id}`} className="min-w-[280px] sm:min-w-[300px] snap-start shrink-0">
                <CarCard
                  vehicle={car}
                  currency={currency}
                  lang={lang}
                  isCompared={comparedVehicleIds.includes(car.id)}
                  isFavorite={favoriteIds.includes(car.id)}
                  onToggleFavorite={toggleFavorite}
                  onToggleCompare={toggleCompare}
                  onSelect={(v) => {
                    setSelectedVehicle(v);
                    addRecentlyViewed(v.id);
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 mt-16 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white">
              <Car className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-200 text-sm">AutoNext Azerbaijan</span>
              <p className="text-[11px] text-slate-500">Next-generation smart automotive marketplace</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <span>© 2026 AutoNext. All rights reserved.</span>
            <span>Developed for Mister-Robot-Cat</span>
            <a href="https://github.com/Mister-Robot-Cat/AutoNext" target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
              GitHub Repo
            </a>
          </div>
        </div>
      </footer>

      <ToastContainer />
      <ScrollToTop />
    </div>
  );
}

export default App;
