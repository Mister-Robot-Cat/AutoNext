import React, { useState, useMemo } from 'react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import { formatPrice, TRANSLATIONS } from '../utils/i18n';
import { FairPriceBadge } from './FairPriceBadge';
import { Avatar } from './Avatar';
import { 
  X, 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  Calendar, 
  Gauge as GaugeIcon, 
  Fuel, 
  Settings, 
  Compass, 
  CheckCircle, 
  AlertCircle, 
  TrendingDown, 
  Calculator,
  ChevronLeft,
  ChevronRight,
  Share2,
  FileCheck,
  Rotate3d,
  Image as ImageIcon,
  ZoomIn,
  BarChart3,
  History,
  Coins,
  ArrowLeftRight,
  ClipboardCheck,
  Scale,
  ShieldAlert,
  FileText,
  Umbrella,
  BookOpenCheck,
  AlertTriangle,
  Building2,
  Truck,
  Crosshair,
  Zap,
  Route,
  Sun,
  FileSignature,
  Globe,
  Car,
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
  Activity,
  Stethoscope,
  GraduationCap,
  Flame,
  Siren,
  Gavel
} from 'lucide-react';
import { Gauge } from './Gauge';
import { BarChart, generateVehiclePriceDistribution } from './BarChart';
import { CarRotationViewer } from './CarRotationViewer';
import { PriceDepreciationChart } from './PriceDepreciationChart';
import { LightboxViewer } from './LightboxViewer';
import { useShare } from '../hooks/useShare';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { Copy, Check } from 'lucide-react';

interface CarDetailModalProps {
  vehicle: Vehicle | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
  onOpenLoanForCar: (vehicle: Vehicle) => void;
  onOpenVinHistory: (vehicle: Vehicle) => void;
  onOpenDealership?: (seller: any) => void;
  onOpenPriceHistory?: (vehicle: Vehicle) => void;
  onOpenTcoForecast?: (vehicle: Vehicle) => void;
  onOpenTradeInValuation?: (vehicle: Vehicle) => void;
  onOpenInspection?: (vehicle: Vehicle) => void;
  onOpenCustomsCalculator?: (vehicle: Vehicle) => void;
  onOpenLienRegistry?: (vehicle: Vehicle) => void;
  onOpenBillOfSale?: (vehicle: Vehicle) => void;
  onOpenInsuranceCalculator?: (vehicle: Vehicle) => void;
  onOpenEscrowSimulator?: (vehicle: Vehicle) => void;
  onOpenServicePassport?: (vehicle: Vehicle) => void;
  onOpenRecallRegistry?: (vehicle: Vehicle) => void;
  onOpenTechnicalInspection?: (vehicle: Vehicle) => void;
  onOpenRegistration?: (vehicle: Vehicle) => void;
  onOpenTrafficFines?: (vehicle: Vehicle) => void;
  onOpenRoadsideAssistance?: (vehicle: Vehicle) => void;
  onOpenEvCharging?: (vehicle: Vehicle) => void;
  onOpenFuelStations?: (vehicle: Vehicle) => void;
  onOpenTollRoads?: (vehicle: Vehicle) => void;
  onOpenWindowTint?: (vehicle: Vehicle) => void;
  onOpenEuroprotocol?: (vehicle: Vehicle) => void;
  onOpenPowerOfAttorney?: (vehicle: Vehicle) => void;
  onOpenGreenCard?: (vehicle: Vehicle) => void;
  onOpenTaxiCompliance?: (vehicle: Vehicle) => void;
  onOpenTuningCompliance?: (vehicle: Vehicle) => void;
  onOpenScrappage?: (vehicle: Vehicle) => void;
  onOpenImpoundLot?: (vehicle: Vehicle) => void;
  onOpenSpecialTraffic?: (vehicle: Vehicle) => void;
  onOpenDriverLicense?: (vehicle: Vehicle) => void;
  onOpenTireCompliance?: (vehicle: Vehicle) => void;
  onOpenHeadlightCompliance?: (vehicle: Vehicle) => void;
  onOpenPassengerSafety?: (vehicle: Vehicle) => void;
  onOpenEmissionsCompliance?: (vehicle: Vehicle) => void;
  onOpenBrakeSteering?: (vehicle: Vehicle) => void;
  onOpenVisibilityHorn?: (vehicle: Vehicle) => void;
  onOpenForensicPlate?: (vehicle: Vehicle) => void;
  onOpenBodyworkAdvertising?: (vehicle: Vehicle) => void;
  onOpenTachographWorkRest?: (vehicle: Vehicle) => void;
  onOpenHvBatterySafety?: (vehicle: Vehicle) => void;
  onOpenSuspensionChassis?: (vehicle: Vehicle) => void;
  onOpenDriverMedical?: (vehicle: Vehicle) => void;
  onOpenDrivingSchool?: (vehicle: Vehicle) => void;
  onOpenAdrCompliance?: (vehicle: Vehicle) => void;
  onOpenOversizePermit?: (vehicle: Vehicle) => void;
  onOpenAccidentForensics?: (vehicle: Vehicle) => void;
  onOpenSpecialSignal?: (vehicle: Vehicle) => void;
  onOpenVehicleAuction?: (vehicle: Vehicle) => void;
  onOpenCustomsTransit?: (vehicle: Vehicle) => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({
  vehicle,
  currency,
  lang,
  onClose,
  onOpenLoanForCar,
  onOpenVinHistory,
  onOpenDealership,
  onOpenPriceHistory,
  onOpenTcoForecast,
  onOpenTradeInValuation,
  onOpenInspection,
  onOpenCustomsCalculator,
  onOpenLienRegistry,
  onOpenBillOfSale,
  onOpenInsuranceCalculator,
  onOpenEscrowSimulator,
  onOpenServicePassport,
  onOpenRecallRegistry,
  onOpenTechnicalInspection,
  onOpenRegistration,
  onOpenTrafficFines,
  onOpenRoadsideAssistance,
  onOpenEvCharging,
  onOpenFuelStations,
  onOpenTollRoads,
  onOpenWindowTint,
  onOpenEuroprotocol,
  onOpenPowerOfAttorney,
  onOpenGreenCard,
  onOpenTaxiCompliance,
  onOpenTuningCompliance,
  onOpenScrappage,
  onOpenImpoundLot,
  onOpenSpecialTraffic,
  onOpenDriverLicense,
  onOpenTireCompliance,
  onOpenHeadlightCompliance,
  onOpenPassengerSafety,
  onOpenEmissionsCompliance,
  onOpenBrakeSteering,
  onOpenVisibilityHorn,
  onOpenForensicPlate,
  onOpenBodyworkAdvertising,
  onOpenTachographWorkRest,
  onOpenHvBatterySafety,
  onOpenSuspensionChassis,
  onOpenDriverMedical,
  onOpenDrivingSchool,
  onOpenAdrCompliance,
  onOpenOversizePermit,
  onOpenAccidentForensics,
  onOpenSpecialSignal,
  onOpenVehicleAuction,
  onOpenCustomsTransit,
}) => {
  const [activeImage, setActiveImage] = useState(0);
  const [selectedDamagePart, setSelectedDamagePart] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'gallery' | '360'>('gallery');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const { share, isShared } = useShare();
  const [copiedVin, copyVin] = useCopyToClipboard();
  const [copiedPhone, copyPhone] = useCopyToClipboard();
  
  useScrollLock(!!vehicle);
  useKeyPress('Escape', onClose);
  
  const priceDistributionData = useMemo(() => {
    if (!vehicle) return [];
    return generateVehiclePriceDistribution({
      currentPrice: vehicle.priceAzn,
      avgPrice: vehicle.valuation.avgMarketPriceAzn,
      minPrice: vehicle.valuation.minMarketPriceAzn,
      maxPrice: vehicle.valuation.maxMarketPriceAzn,
      bucketsCount: 5,
      currencySymbol: currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '₼',
    });
  }, [vehicle, currency]);

  if (!vehicle) return null;
  const t = TRANSLATIONS[lang];
  const handleShare = () => {
    if (vehicle) {
      share(
        `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
        `Check out this ${vehicle.make} ${vehicle.model} for ${formatPrice(vehicle.priceAzn, currency)}!`,
        window.location.href
      );
    }
  };

  const damagePartDetails = vehicle.damageReport.find((p) => p.partId === selectedDamagePart);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {isLightboxOpen && (
        <LightboxViewer
          images={vehicle.images}
          initialIndex={activeImage}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}
      <div 
        className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-20 backdrop-blur-md">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">{vehicle.title}</h2>
              {vehicle.isVerified && (
                <span className="flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Yoxlanılıb
                </span>
              )}
            </div>
            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>VIN:</span>
              <div className="flex items-center gap-1 group/vin">
                <span className="font-mono text-slate-300 font-semibold">{vehicle.vin}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyVin(vehicle.vin);
                  }}
                  title="Copy VIN"
                  className="p-1 rounded opacity-0 group-hover/vin:opacity-100 focus:opacity-100 hover:bg-slate-800 transition-all text-slate-400 hover:text-white"
                >
                  {copiedVin === vehicle.vin ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <span>• {vehicle.city} • Elan #{vehicle.id}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              title={isShared ? "Copied to clipboard!" : "Share"}
              className={`p-2 rounded-xl transition-colors ${
                isShared 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white'
              }`}
            >
              {isShared ? <CheckCircle className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Main Showcase Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Gallery Column (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              {/* Mode Switcher Tabs */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewMode('gallery')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    viewMode === 'gallery'
                      ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/25'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-white hover:bg-slate-900'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Foto Qalereya</span>
                </button>

                <button
                  type="button"
                  onClick={() => setViewMode('360')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                    viewMode === '360'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white border-cyan-400 shadow-md shadow-cyan-500/25'
                      : 'bg-slate-950/60 text-slate-400 border-slate-800 hover:text-cyan-400 hover:bg-slate-900'
                  }`}
                >
                  <Rotate3d className="w-3.5 h-3.5" />
                  <span>360° Studio Baxışı</span>
                </button>
              </div>

              {viewMode === '360' ? (
                <CarRotationViewer vehicle={vehicle} />
              ) : (
                <>
                  <div 
                    className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 cursor-pointer group"
                    onClick={() => setIsLightboxOpen(true)}
                  >
                    <img
                      src={vehicle.images[activeImage] || vehicle.images[0]}
                      alt={vehicle.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    />

                    {/* Magnify Icon Overlay */}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <div className="p-3 rounded-full bg-black/60 text-white/90 backdrop-blur-sm">
                        <ZoomIn className="w-6 h-6" />
                      </div>
                    </div>

                    {vehicle.images.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImage((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length);
                          }}
                          className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white z-10"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveImage((prev) => (prev + 1) % vehicle.images.length);
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white z-10"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>

                  {/* Thumbnails */}
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {vehicle.images.map((img, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(idx)}
                        className={`w-20 h-14 rounded-lg overflow-hidden border-2 transition-all flex-shrink-0 ${
                          activeImage === idx ? 'border-blue-500 scale-95' : 'border-transparent opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img src={img} alt="thumb" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Price & Seller Column (5 cols) */}
            <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
              {/* Price Block */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase font-semibold text-slate-400">Təklif Qiyməti</span>
                  <FairPriceBadge valuation={vehicle.valuation} lang={lang} size="md" showDetails />
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black text-white">
                    {formatPrice(vehicle.priceAzn, currency)}
                  </span>
                  {currency !== 'AZN' && (
                    <span className="text-sm text-slate-400 font-medium">
                      ({formatPrice(vehicle.priceAzn, 'AZN')})
                    </span>
                  )}
                </div>

                {/* AI Price Insight Card */}
                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200 flex items-center justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <TrendingDown className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-emerald-400">Bazar Analitikası: </span>
                      Bakı üzrə orta qiymət {formatPrice(vehicle.valuation.avgMarketPriceAzn, currency)} təşkil edir.
                      Bu avtomobil bazardan <strong>{Math.abs(vehicle.valuation.percentageDiff)}%</strong> sərfəlidir.
                    </div>
                  </div>
                  {vehicle.valuation.confidenceScore !== undefined && (
                    <div className="flex-shrink-0" data-testid="valuation-confidence-gauge" title={`AI Dəqiqlik dərəcəsi: ${vehicle.valuation.confidenceScore}%`}>
                      <Gauge
                        value={vehicle.valuation.confidenceScore}
                        size={56}
                        thickness={6}
                        type="half"
                        autoColor
                        unit="%"
                        label="Dəqiqlik"
                      />
                    </div>
                  )}
                </div>

                {/* Loan Shortcut */}
                <button
                  type="button"
                  onClick={() => onOpenLoanForCar(vehicle)}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <Calculator className="w-4 h-4" />
                  <span>Kreditlə aylıq: ≈ {formatPrice(Math.round(vehicle.priceAzn * 0.024), currency)} / ay</span>
                </button>

                {/* VIN History Report Shortcut */}
                <button
                  type="button"
                  onClick={() => onOpenVinHistory(vehicle)}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>VIN Tarixçəsi & Yürüş Hesabatı</span>
                </button>

                {/* Price History & Trends Shortcut */}
                {onOpenPriceHistory && (
                  <button
                    type="button"
                    onClick={() => onOpenPriceHistory(vehicle)}
                    data-testid="price-history-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-purple-600/10 hover:bg-purple-600/20 text-purple-400 border border-purple-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <History className="w-4 h-4" />
                    <span>Qiymət Tarixçəsi & Bazar Dinamikası</span>
                  </button>
                )}

                {/* 5-Year TCO Forecaster Shortcut */}
                {onOpenTcoForecast && (
                  <button
                    type="button"
                    onClick={() => onOpenTcoForecast(vehicle)}
                    data-testid="tco-forecaster-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <Coins className="w-4 h-4" />
                    <span>5 İllik Sahiblik Xərci (TCO) Proqnozu</span>
                  </button>
                )}

                {/* Trade-In & Barter Valuation Shortcut */}
                {onOpenTradeInValuation && (
                  <button
                    type="button"
                    onClick={() => onOpenTradeInValuation(vehicle)}
                    data-testid="trade-in-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <ArrowLeftRight className="w-4 h-4" />
                    <span>Trade-In & Barter Qiymətləndirməsi</span>
                  </button>
                )}

                {/* 150-Point Pre-Purchase Inspection & OBD-II Shortcut */}
                {onOpenInspection && (
                  <button
                    type="button"
                    onClick={() => onOpenInspection(vehicle)}
                    data-testid="inspection-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <ClipboardCheck className="w-4 h-4" />
                    <span>150-Nöqtəli Diaqnostika & OBD-II Simulyatoru</span>
                  </button>
                )}

                {/* Customs Import Tariff & Duty Calculator Shortcut */}
                {onOpenCustomsCalculator && (
                  <button
                    type="button"
                    onClick={() => onOpenCustomsCalculator(vehicle)}
                    data-testid="customs-calculator-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <Scale className="w-4 h-4" />
                    <span>İdxal Gömrük Rüsumu & Vergi Kalkulyatoru</span>
                  </button>
                )}

                {/* Stolen Vehicle & Bank Lien Registry Shortcut */}
                {onOpenLienRegistry && (
                  <button
                    type="button"
                    onClick={() => onOpenLienRegistry(vehicle)}
                    data-testid="lien-registry-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>DİN Axtarış & Girov Reyestri Yoxlanışı</span>
                  </button>
                )}

                {/* Vehicle Bill of Sale & Purchase Contract Generator Shortcut */}
                {onOpenBillOfSale && (
                  <button
                    type="button"
                    onClick={() => onOpenBillOfSale(vehicle)}
                    data-testid="bill-of-sale-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <FileText className="w-4 h-4" />
                    <span>Rəsmi Alqı-Satqı Müqaviləsi (Notariat)</span>
                  </button>
                )}

                {/* Compulsory & KASKO Insurance Premium Estimator Shortcut */}
                {onOpenInsuranceCalculator && (
                  <button
                    type="button"
                    onClick={() => onOpenInsuranceCalculator(vehicle)}
                    data-testid="insurance-calculator-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <Umbrella className="w-4 h-4" />
                    <span>İcbari & KASKO Sığorta Hesablayıcı</span>
                  </button>
                )}

                {/* Seller Identity & Digital Escrow Deposit Holding Simulator Shortcut */}
                {onOpenEscrowSimulator && (
                  <button
                    type="button"
                    onClick={() => onOpenEscrowSimulator(vehicle)}
                    data-testid="escrow-simulator-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Satıcı Yoxlanışı & Rəqəmsal Beh (Escrow)</span>
                  </button>
                )}

                {/* Digital Service Passport & Maintenance Planner Shortcut */}
                {onOpenServicePassport && (
                  <button
                    type="button"
                    onClick={() => onOpenServicePassport(vehicle)}
                    data-testid="service-passport-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <BookOpenCheck className="w-4 h-4" />
                    <span>Rəqəmsal Servis Pasportu & Qulluq Planı</span>
                  </button>
                )}

                {/* Official Manufacturer Safety Recall & TSB Registry Shortcut */}
                {onOpenRecallRegistry && (
                  <button
                    type="button"
                    onClick={() => onOpenRecallRegistry(vehicle)}
                    data-testid="recall-registry-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    <span>Təhlükəsizlik və Geri Çağırış (Safety Recalls)</span>
                  </button>
                )}

                {/* Official BDYP State Technical Inspection & E-Talon Shortcut */}
                {onOpenTechnicalInspection && (
                  <button
                    type="button"
                    onClick={() => onOpenTechnicalInspection(vehicle)}
                    data-testid="technical-inspection-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Dövlət Texniki Baxışı & E-Talon (DYP)</span>
                  </button>
                )}

                {/* Official BDYP State Re-registration & Plate Registry Shortcut */}
                {onOpenRegistration && (
                  <button
                    type="button"
                    onClick={() => onOpenRegistration(vehicle)}
                    data-testid="registration-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <Building2 className="w-4 h-4" />
                    <span>BDYP Qeydiyyat & Texpasport Rəsmiləşdirilməsi</span>
                  </button>
                )}

                {/* Official BDYP State Traffic Fines & MMX Protocols Shortcut */}
                {onOpenTrafficFines && (
                  <button
                    type="button"
                    onClick={() => onOpenTrafficFines(vehicle)}
                    data-testid="traffic-fines-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>BDYP Radar Cərimələri & AsanPay (MMX)</span>
                  </button>
                )}

                {/* 156 Roadside Assistance & Emergency Towing Shortcut */}
                {onOpenRoadsideAssistance && (
                  <button
                    type="button"
                    onClick={() => onOpenRoadsideAssistance(vehicle)}
                    data-testid="roadside-assistance-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    <span>156 Evakuasiya & Təcili Yol Köməyi (SOS)</span>
                  </button>
                )}

                {/* TokBaku & Azərişıq EV Charging Network Shortcut */}
                {onOpenEvCharging && (
                  <button
                    type="button"
                    onClick={() => onOpenEvCharging(vehicle)}
                    data-testid="ev-charging-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4" />
                    <span>Azərişıq & TokBaku Elektromobil Doldurma Şəbəkəsi</span>
                  </button>
                )}

                {/* SOCAR & Azpetrol Fuel Station Radar Shortcut */}
                {onOpenFuelStations && (
                  <button
                    type="button"
                    onClick={() => onOpenFuelStations(vehicle)}
                    data-testid="fuel-stations-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Fuel className="w-4 h-4" />
                    <span>SOCAR & Azpetrol Yanacaq Radarı və Səyahət Xərci</span>
                  </button>
                )}

                {/* AAYDA M-1 Toll Highway & E-Toll Shortcut */}
                {onOpenTollRoads && (
                  <button
                    type="button"
                    onClick={() => onOpenTollRoads(vehicle)}
                    data-testid="toll-roads-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Route className="w-4 h-4" />
                    <span>AAYDA M-1 Ödənişli Magistral & E-Toll Radarı</span>
                  </button>
                )}

                {/* BDYP Window Tint & Legal Permit Shortcut */}
                {onOpenWindowTint && (
                  <button
                    type="button"
                    onClick={() => onOpenWindowTint(vehicle)}
                    data-testid="window-tint-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Sun className="w-4 h-4" />
                    <span>BDYP Qanuni Şüşə Plyonka & İcazə Portalı</span>
                  </button>
                )}

                {/* ISB Europrotocol Accident Settlement Shortcut */}
                {onOpenEuroprotocol && (
                  <button
                    type="button"
                    onClick={() => onOpenEuroprotocol(vehicle)}
                    data-testid="europrotocol-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <FileCheck className="w-4 h-4" />
                    <span>İSB & BDYP Rəsmi Avroprotokol Qəza Qeydiyyatı</span>
                  </button>
                )}

                {/* Official Ministry of Justice & ASAN Electronic Power of Attorney Shortcut */}
                {onOpenPowerOfAttorney && (
                  <button
                    type="button"
                    onClick={() => onOpenPowerOfAttorney(vehicle)}
                    data-testid="poa-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <FileSignature className="w-4 h-4" />
                    <span>Elektron Etibarnamə & Notariat Portalı (Ədliyyə)</span>
                  </button>
                )}

                {/* Official ISB International Green Card & Border Transit Shortcut */}
                {onOpenGreenCard && (
                  <button
                    type="button"
                    onClick={() => onOpenGreenCard(vehicle)}
                    data-testid="green-card-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Globe className="w-4 h-4" />
                    <span>İSB Beynəlxalq Yaşıl Kart & Sərhəd Keçid Portalı</span>
                  </button>
                )}

                {/* AYNA Taxi Compliance & Buraxılış Vərəqəsi Shortcut */}
                {onOpenTaxiCompliance && (
                  <button
                    type="button"
                    onClick={() => onOpenTaxiCompliance(vehicle)}
                    data-testid="taxi-compliance-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Car className="w-4 h-4" />
                    <span>AYNA Taksi Uyğunluğu & E-Buraxılış Vərəqəsi</span>
                  </button>
                )}

                {/* BDYP Constructive Modification, Autogas (LPG/CNG) & Tuning Shortcut */}
                {onOpenTuningCompliance && (
                  <button
                    type="button"
                    onClick={() => onOpenTuningCompliance(vehicle)}
                    data-testid="tuning-compliance-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Wrench className="w-4 h-4" />
                    <span>BDYP & AZS Tüninq, Qazbalon (LPG/CNG) & Konstruktiv İcazə</span>
                  </button>
                )}

                {/* Təmiz Şəhər ASC Vehicle Scrappage & Voucher Shortcut */}
                {onOpenScrappage && (
                  <button
                    type="button"
                    onClick={() => onOpenScrappage(vehicle)}
                    data-testid="scrappage-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Recycle className="w-4 h-4" />
                    <span>"Təmiz Şəhər" Utilizasiya & Güzəşt Vauçeri Portalı</span>
                  </button>
                )}

                {/* BDYP & AYNA Impound Lot & Towing Release Shortcut */}
                {onOpenImpoundLot && (
                  <button
                    type="button"
                    onClick={() => onOpenImpoundLot(vehicle)}
                    data-testid="impound-lot-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <ShieldAlert className="w-4 h-4" />
                    <span>BDYP & AYNA Cərimə Meydançası və Evakuasiya Portalı</span>
                  </button>
                )}

                {/* AYNA Bus Lane & Baku Special Traffic Entry Regime Shortcut */}
                {onOpenSpecialTraffic && (
                  <button
                    type="button"
                    onClick={() => onOpenSpecialTraffic(vehicle)}
                    data-testid="special-traffic-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Bus className="w-4 h-4" />
                    <span>AYNA Avtobus Zolağı (İXM 327.1-1) & Bakı Giriş E-Buraxılış</span>
                  </button>
                )}

                {/* BDYP Driver's License Category (B/BE) & Exam Portal Shortcut */}
                {onOpenDriverLicense && (
                  <button
                    type="button"
                    onClick={() => onOpenDriverLicense(vehicle)}
                    data-testid="driver-license-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>BDYP Sürücülük Vəsiqəsi, Kateqoriya (B/BE) & İmtahan Portalı</span>
                  </button>
                )}

                {/* BDYP Tire Standards (YHQ Annex 1), Tread Depth & Mountain Winter Readiness Shortcut */}
                {onOpenTireCompliance && (
                  <button
                    type="button"
                    onClick={() => onOpenTireCompliance(vehicle)}
                    data-testid="tire-compliance-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Disc className="w-4 h-4" />
                    <span>BDYP Şin Standartları (YHQ Əlavə 1), Protektor & Qış Dağ Keçidi Portalı</span>
                  </button>
                )}

                {/* BDYP Headlight Standards, Xenon/LED Legality & Optical Regloscope Shortcut */}
                {onOpenHeadlightCompliance && (
                  <button
                    type="button"
                    onClick={() => onOpenHeadlightCompliance(vehicle)}
                    data-testid="headlight-compliance-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Lightbulb className="w-4 h-4" />
                    <span>BDYP Xarici İşıq, Ksenon/LED (İXM 342.2-1) & Fara Reqloskop Stendi</span>
                  </button>
                )}

                {/* BDYP & FHN Emergency Safety Kit, Child Seat (ISOFIX) & Passenger Compliance Shortcut */}
                {onOpenPassengerSafety && (
                  <button
                    type="button"
                    onClick={() => onOpenPassengerSafety(vehicle)}
                    data-testid="passenger-safety-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <HeartPulse className="w-4 h-4" />
                    <span>BDYP & FHN Qəza Təchizatı (Odluq, Tibbi Çanta) & Uşaq Avtokreslosu (İSOFIX)</span>
                  </button>
                )}

                {/* BDYP & ETSN Exhaust Emissions, Gas Analyzer & Catalyst/DPF Shortcut */}
                {onOpenEmissionsCompliance && (
                  <button
                    type="button"
                    onClick={() => onOpenEmissionsCompliance(vehicle)}
                    data-testid="emissions-compliance-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Wind className="w-4 h-4" />
                    <span>BDYP & ETSN «Təmiz Hava» Qazanalizator, Katalizator & DPF Portalı</span>
                  </button>
                )}

                {/* BDYP Braking System & Steering Mechanism Stand Shortcut */}
                {onOpenBrakeSteering && (
                  <button
                    type="button"
                    onClick={() => onOpenBrakeSteering(vehicle)}
                    data-testid="brake-steering-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Disc className="w-4 h-4" />
                    <span>BDYP Tormoz Stendi, Sükan Lüftometri (YHQ Əlavə 1) & DOT-4 Auditoru</span>
                  </button>
                )}

                {/* BDYP Driver Visibility, Windshield, Wipers & Acoustic Horn ("FIFA") Shortcut */}
                {onOpenVisibilityHorn && (
                  <button
                    type="button"
                    onClick={() => onOpenVisibilityHorn(vehicle)}
                    data-testid="visibility-horn-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>BDYP Görünüş, Alın Şüşəsi, Şüşəsilən & Akustik Siqnal (FİFA) Portalı</span>
                  </button>
                )}

                {/* BDYP Engine/VIN Forensic, DQN Readability (IXM 342.7) & SRS Airbag Shortcut */}
                {onOpenForensicPlate && (
                  <button
                    type="button"
                    onClick={() => onOpenForensicPlate(vehicle)}
                    data-testid="forensic-plate-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Fingerprint className="w-4 h-4" />
                    <span>BDYP Mühərrik/VIN Kriminalistik Ekspertiza, DQN (İXM 342.7) & SRS Stendi</span>
                  </button>
                )}

                {/* BDYP & ADRA Exterior Bodywork, Vinyl Wrap, Advertising & Farkop Shortcut */}
                {onOpenBodyworkAdvertising && (
                  <button
                    type="button"
                    onClick={() => onOpenBodyworkAdvertising(vehicle)}
                    data-testid="bodywork-advertising-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Palette className="w-4 h-4" />
                    <span>BDYP & ADRA Kuzov Rəngi/Vinil (YHQ 27), Reklam (İXM 342.1.8) & Farkop Portalı</span>
                  </button>
                )}

                {/* AYNA & BDYP Digital Tachograph, Driver Work/Rest Regime (AETR) & E-Ugur Waybill Shortcut */}
                {onOpenTachographWorkRest && (
                  <button
                    type="button"
                    onClick={() => onOpenTachographWorkRest(vehicle)}
                    data-testid="tachograph-work-rest-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Timer className="w-4 h-4" />
                    <span>AYNA Rəqəmsal Taxoqraf, İş-İstirahət (AETR / NK №73) & E-Uğur Yol Vərəqəsi</span>
                  </button>
                )}
                {/* BDYP & AZS Suspension, EUSAMA & Chassis 3D Alignment Shortcut */}
                {onOpenSuspensionChassis && (
                  <button
                    type="button"
                    onClick={() => onOpenSuspensionChassis(vehicle)}
                    data-testid="suspension-chassis-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Activity className="w-4 h-4" />
                    <span>BDYP & AZS Asqı, Amortizator (EUSAMA), Peredok & Hunter 3D Razval</span>
                  </button>
                )}

                {/* Səhiyyə Nazirliyi & BDYP Driver Medical Examination (Forma AZS-083/e) Shortcut */}
                {onOpenDriverMedical && (
                  <button
                    type="button"
                    onClick={() => onOpenDriverMedical(vehicle)}
                    data-testid="driver-medical-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>Səhiyyə Nazirliyi & BDYP Sürücülük Tibbi Müayinəsi (Forma AZS-083/e)</span>
                  </button>
                )}

                {/* BDYP & Elm Nazirliyi Driving School & Practical Exam Shortcut */}
                {onOpenDrivingSchool && (
                  <button
                    type="button"
                    onClick={() => onOpenDrivingSchool(vehicle)}
                    data-testid="driving-school-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>BDYP & Elm Nazirliyi Avtoməktəb & Praktiki İmtahan Portalı</span>
                  </button>
                )}

                {/* FHN & BDYP ADR Dangerous Goods Road Transport Shortcut */}
                {onOpenAdrCompliance && (
                  <button
                    type="button"
                    onClick={() => onOpenAdrCompliance(vehicle)}
                    data-testid="adr-compliance-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Flame className="w-4 h-4" />
                    <span>FHN & BDYP ADR Təhlükəli Yüklərin Daşınması & Narıncı Kemler Standartı</span>
                  </button>
                )}

                {/* AAYDA & BDYP Oversize & Heavy Axle Transport Permitting Shortcut */}
                {onOpenOversizePermit && (
                  <button
                    type="button"
                    onClick={() => onOpenOversizePermit(vehicle)}
                    data-testid="oversize-permit-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Truck className="w-4 h-4" />
                    <span>AAYDA & BDYP İriqabaritli və Ağırçəkili Yük Daşınması (NK № 104) & Xüsusi İcazə</span>
                  </button>
                )}

                {/* BDYP & Ədliyyə Nazirliyi YNH Məhkəmə Avtotexniki Ekspertizası Shortcut */}
                {onOpenAccidentForensics && (
                  <button
                    type="button"
                    onClick={() => onOpenAccidentForensics(vehicle)}
                    data-testid="accident-forensics-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Crosshair className="w-4 h-4" />
                    <span>BDYP & Ədliyyə Nazirliyi YNH Məhkəmə Avtotexniki Ekspertizası (v=√(254·μ·S))</span>
                  </button>
                )}

                {/* DİN & BDYP Xüsusi Sayrışan Mayak və Siren («Miqalka») Shortcut */}
                {onOpenSpecialSignal && (
                  <button
                    type="button"
                    onClick={() => onOpenSpecialSignal(vehicle)}
                    data-testid="special-signal-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Siren className="w-4 h-4 text-blue-400" />
                    <span>DİN & BDYP Xüsusi Sayrışan Mayak («Miqalka») & Siren Qanuniliyi</span>
                  </button>
                )}

                {/* Əmlak Məsələləri Dövlət Xidməti & Məhkəmə İcraçıları Dövlət Hərracı Shortcut */}
                {onOpenVehicleAuction && (
                  <button
                    type="button"
                    onClick={() => onOpenVehicleAuction(vehicle)}
                    data-testid="vehicle-auction-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Gavel className="w-4 h-4 text-amber-400" />
                    <span>Dövlət Əmlakı və Müsadirə Olunmuş Nəqliyyat Hərracı (e-herrac)</span>
                  </button>
                )}

                {/* DGK & BDYP Foreign-Registered Vehicle Temporary Import & Transit Shortcut */}
                {onOpenCustomsTransit && (
                  <button
                    type="button"
                    onClick={() => onOpenCustomsTransit(vehicle)}
                    data-testid="customs-transit-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <Globe className="w-4 h-4 text-emerald-400" />
                    <span>DGK Xarici Nəqliyyat Müvəqqəti İdxal & 90 Günlük Rejim Portalı</span>
                  </button>
                )}


                {/* AZS, BDYP & FHN EV/Hybrid High-Voltage Insulation (R100), SOH% & Green Privilege Shortcut */}
                {onOpenHvBatterySafety && (
                  <button
                    type="button"
                    onClick={() => onOpenHvBatterySafety(vehicle)}
                    data-testid="hv-battery-safety-shortcut-btn"
                    className="w-full py-2.5 px-4 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <BatteryCharging className="w-4 h-4" />
                    <span>AZS & BDYP Elektromobil/Hibrid HV İzolyasiya (R100), SOH% & AMB Yaşıl Kredit</span>
                  </button>
                )}
              </div>

              {/* Seller Information */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div 
                    className={`flex items-center gap-3 ${onOpenDealership ? 'cursor-pointer group' : ''}`}
                    onClick={() => onOpenDealership && onOpenDealership(vehicle.seller)}
                  >
                    <Avatar 
                      initials={vehicle.seller.name.charAt(0)} 
                      src={vehicle.seller.avatarUrl}
                      alt={vehicle.seller.name}
                      size="md"
                      className="border border-blue-500/40 text-blue-400 bg-blue-600/20 group-hover:bg-blue-600/40 transition-colors"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">{vehicle.seller.name}</h4>
                        {vehicle.seller.verifiedIdentity && (
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400">
                        {vehicle.seller.type === 'official_dealer'
                          ? 'Rəsmi Diler'
                          : vehicle.seller.type === 'autocenter'
                          ? 'Avtosalon'
                          : 'Şəxsi satıcı'} • {vehicle.seller.memberSinceYear}-ci ildən
                      </p>
                      {vehicle.seller.responseTimeMinutes !== undefined && (
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            ~{vehicle.seller.responseTimeMinutes} dəq cavab sürəti
                          </span>
                          {vehicle.seller.responseRate && (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                              Göstərici: {Math.round(vehicle.seller.responseRate * 100)}%
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-amber-400">★ {vehicle.seller.rating}</div>
                    <span className="text-[10px] text-slate-500">{vehicle.seller.reviewsCount} rəy</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="flex bg-blue-600 rounded-xl overflow-hidden shadow-lg shadow-blue-600/20 group/phone">
                    <a
                      href={`tel:${vehicle.seller.phone}`}
                      className="flex-1 flex items-center justify-center gap-2 py-3 px-3 hover:bg-blue-500 text-white text-sm font-semibold transition-all"
                    >
                      <Phone className="w-4 h-4" />
                      <span>{vehicle.seller.phone}</span>
                    </a>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        copyPhone(vehicle.seller.phone);
                      }}
                      className="px-3 bg-blue-700/50 hover:bg-blue-500 text-white transition-colors border-l border-blue-500/30 flex items-center justify-center"
                      title="Nömrəni kopyala"
                    >
                      {copiedPhone === vehicle.seller.phone ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                  {vehicle.seller.whatsapp && (
                    <a
                      href={`https://wa.me/${vehicle.seller.whatsapp}?text=${encodeURIComponent(`Salam, AutoNext-dəki ${vehicle.title} elanı ilə bağlı yazıram.`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold transition-all shadow-lg shadow-emerald-600/20"
                    >
                      <MessageCircle className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Specs Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">İl</span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>{vehicle.year}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Yürüş</span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                <GaugeIcon className="w-4 h-4 text-emerald-400" />
                <span>{vehicle.mileageKm.toLocaleString()} km</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Mühərrik</span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                <Settings className="w-4 h-4 text-amber-400" />
                <span>{vehicle.engineVolumeLiters > 0 ? `${vehicle.engineVolumeLiters}L` : 'EV'}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Güc</span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-white">
                <GaugeIcon className="w-4 h-4 text-purple-400" />
                <span>{vehicle.powerHp} a.g.</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Yanacaq</span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-white capitalize">
                <Fuel className="w-4 h-4 text-red-400" />
                <span>{vehicle.fuelType}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Ötürücü</span>
              <div className="flex items-center gap-1.5 text-sm font-bold text-white uppercase">
                <Compass className="w-4 h-4 text-cyan-400" />
                <span>{vehicle.drivetrain}</span>
              </div>
            </div>
          </div>

          {/* Interactive Inspection & Damage Map */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-blue-400" />
                <h3 className="font-bold text-white text-base">Rəqəmsal Ekspertiza & Zədə Xəritəsi</h3>
              </div>
              <span className="text-xs text-slate-400">Detallara klik edərək rəng/dəyişmə vəziyyətinə baxın</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
              {vehicle.damageReport.map((part) => {
                const isSelected = selectedDamagePart === part.partId;
                const isClean = part.severity === 'none';
                const isPainted = part.severity === 'cosmetic_paint';

                return (
                  <button
                    key={part.partId}
                    type="button"
                    onClick={() => setSelectedDamagePart(isSelected ? null : part.partId)}
                    className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-500/20 bg-slate-800'
                        : isClean
                        ? 'border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10'
                        : isPainted
                        ? 'border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10'
                        : 'border-red-500/30 bg-red-500/5 hover:bg-red-500/10'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-slate-200">{part.partName}</span>
                      {isClean ? (
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {isClean ? 'Zavod rəngi' : isPainted ? 'Kosmetik rəng' : 'Dəyişilib'}
                    </span>
                  </button>
                );
              })}
            </div>

            {damagePartDetails && (
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 flex items-center justify-between">
                <div>
                  <strong className="text-blue-400">{damagePartDetails.partName}: </strong>
                  <span>{damagePartDetails.notes || 'Qəza qeydə alınmayıb. Zavod vəziyyətindədir.'}</span>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded">
                  {damagePartDetails.severity}
                </span>
              </div>
            )}
          </div>

          {/* Price Depreciation & Resale Trajectory Forecast */}
          <PriceDepreciationChart vehicle={vehicle} currency={currency} lang={lang} />

          {/* Vehicle Market Price Distribution */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3" data-testid="market-price-distribution">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-emerald-400" />
                <h3 className="font-bold text-white text-sm sm:text-base">Bazar Qiymət Paylanması & Təhlili</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AI Market Analizi
                </span>
              </div>
              <div className="text-xs text-slate-400">
                Orta bazar qiyməti: <strong className="text-white">{formatPrice(vehicle.valuation.avgMarketPriceAzn, currency)}</strong>
              </div>
            </div>
            <p className="text-xs text-slate-400">
              Eyni model və il kateqoriyasındakı aktiv elanların qiymət diapazonu. Yaşıl xüsusi nişan cari avtomobilin mövqeyini göstərir.
            </p>
            <div className="pt-2">
              <BarChart
                data={priceDistributionData}
                height={170}
                showGrid
                showValues
                showLabels
                valueFormatter={(val) => `${val} elan`}
                referenceLines={[
                  {
                    value: Math.round(
                      priceDistributionData.reduce((acc, p) => acc + p.value, 0) /
                        (priceDistributionData.length || 1)
                    ),
                    label: 'Orta sıxlıq',
                    color: '#f59e0b',
                  },
                ]}
              />
            </div>
          </div>

          {/* Description */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
            <h3 className="font-bold text-white text-base">Əlavə Məlumat</h3>
            <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
              {vehicle.description}
            </p>
          </div>

          {/* Features Checklist */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
            <h3 className="font-bold text-white text-base">Təchizat və Funksiyalar</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {vehicle.features.map((feature, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
