import React from 'react';
import { Currency, Language, Vehicle } from '../types/vehicle';
import { TRANSLATIONS } from '../utils/i18n';
import { 
  Car, 
  Sparkles, 
  Calculator, 
  Layers, 
  PlusCircle, 
  Heart,
  Sun,
  Moon,
  Zap,
  CircleParking,
  Fuel,
  FileCheck,
  Globe,
  Wrench,
  Recycle,
  ShieldAlert,
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
  Truck,
  Crosshair,
  Siren,
  Gavel,
  Compass,
  ReceiptText,
  ShieldCheck,
  Leaf,
  Briefcase,
  KeyRound
} from 'lucide-react';

interface NavbarProps {
  currency: Currency;
  setCurrency: (c: Currency) => void;
  lang: Language;
  setLang: (l: Language) => void;
  theme: 'light' | 'dark' | 'system';
  onToggleTheme: () => void;
  comparedVehicles: Vehicle[];
  favoritesCount: number;
  isFavoritesFilterActive: boolean;
  onToggleFavoritesFilter: () => void;
  onOpenCompare: () => void;
  onOpenCalculator: () => void;
  onOpenAiAdvisor: () => void;
  onOpenCreateListing: () => void;
  onOpenEvCharging?: () => void;
  onOpenParking?: () => void;
  onOpenFuelStations?: () => void;
  onOpenEuroprotocol?: () => void;
  onOpenGreenCard?: () => void;
  onOpenTaxiCompliance?: () => void;
  onOpenTuningCompliance?: () => void;
  onOpenScrappage?: () => void;
  onOpenImpoundLot?: () => void;
  onOpenSpecialTraffic?: () => void;
  onOpenDriverLicense?: () => void;
  onOpenTireCompliance?: () => void;
  onOpenHeadlightCompliance?: () => void;
  onOpenPassengerSafety?: () => void;
  onOpenEmissionsCompliance?: () => void;
  onOpenBrakeSteering?: () => void;
  onOpenVisibilityHorn?: () => void;
  onOpenForensicPlate?: () => void;
  onOpenBodyworkAdvertising?: () => void;
  onOpenTachographWorkRest?: () => void;
  onOpenHvBatterySafety?: () => void;
  onOpenSuspensionChassis?: () => void;
  onOpenDriverMedical?: () => void;
  onOpenDrivingSchool?: () => void;
  onOpenAdrCompliance?: () => void;
  onOpenOversizePermit?: () => void;
  onOpenAccidentForensics?: () => void;
  onOpenSpecialSignal?: () => void;
  onOpenVehicleAuction?: () => void;
  onOpenCustomsTransit?: () => void;
  onOpenKarabakhPermit?: () => void;
  onOpenVehicleTax?: () => void;
  onOpenBonusMalus?: () => void;
  onOpenEcoSticker?: () => void;
  onOpenLeasing?: () => void;
  onOpenRental?: () => void;
  onOpenAdas?: () => void;
  onOpenSalvage?: () => void;
  onOpenFreight?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currency,
  setCurrency,
  lang,
  setLang,
  theme,
  onToggleTheme,
  comparedVehicles,
  favoritesCount,
  isFavoritesFilterActive,
  onToggleFavoritesFilter,
  onOpenCompare,
  onOpenCalculator,
  onOpenAiAdvisor,
  onOpenCreateListing,
  onOpenEvCharging,
  onOpenParking,
  onOpenFuelStations,
  onOpenEuroprotocol,
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
  onOpenKarabakhPermit,
  onOpenVehicleTax,
  onOpenBonusMalus,
  onOpenEcoSticker,
  onOpenLeasing,
  onOpenRental,
  onOpenAdas,
  onOpenSalvage,
  onOpenFreight,
}) => {
  const t = TRANSLATIONS[lang];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-blue-500/25 flex items-center justify-center">
            <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Car className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-black tracking-tight text-white">
                Auto<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Next</span>
              </span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-500/10 text-blue-400 border border-blue-500/30 rounded">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">Smart Auto Marketplace AZ</p>
          </div>
        </div>

        {/* Feature Actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Fuel Station Radar Button */}
          {onOpenFuelStations && (
            <button
              onClick={onOpenFuelStations}
              data-testid="navbar-fuel-stations-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="SOCAR & Azpetrol Yanacaq Radarı və Tarif Şurası"
            >
              <Fuel className="w-4 h-4 text-amber-400" />
              <span className="hidden xl:inline">Yanacaq Radarı</span>
            </button>
          )}

          {/* AzParking Radar Button */}
          {onOpenParking && (
            <button
              onClick={onOpenParking}
              data-testid="navbar-parking-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="AYNA AzParking Dövlət Radarı"
            >
              <CircleParking className="w-4 h-4 text-sky-400" />
              <span className="hidden xl:inline">AzParking</span>
            </button>
          )}

          {/* EV Charging Network Button */}
          {onOpenEvCharging && (
            <button
              onClick={onOpenEvCharging}
              data-testid="navbar-ev-charging-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="Azərişıq & TokBaku EV Şəbəkəsi"
            >
              <Zap className="w-4 h-4 text-emerald-400" />
              <span className="hidden xl:inline">EV Şəbəkə</span>
            </button>
          )}

          {/* Europrotocol Portal Button */}
          {onOpenEuroprotocol && (
            <button
              onClick={onOpenEuroprotocol}
              data-testid="navbar-europrotocol-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="İSB & BDYP Rəsmi Avroprotokol Sistemi"
            >
              <FileCheck className="w-4 h-4 text-teal-400" />
              <span className="hidden xl:inline">Avroprotokol</span>
            </button>
          )}

          {/* Green Card & Cross-Border Button */}
          {onOpenGreenCard && (
            <button
              onClick={onOpenGreenCard}
              data-testid="navbar-green-card-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="İSB Beynəlxalq Yaşıl Kart & Sərhəd Keçid Radarı"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span className="hidden xl:inline">Yaşıl Kart</span>
            </button>
          )}

          {/* AYNA Taxi Compliance Button */}
          {onOpenTaxiCompliance && (
            <button
              onClick={onOpenTaxiCompliance}
              data-testid="navbar-taxi-compliance-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="AYNA Taksi Buraxılış Portalı & Standartlar"
            >
              <Car className="w-4 h-4 text-amber-400" />
              <span className="hidden xl:inline">AYNA Taksi</span>
            </button>
          )}

          {/* BDYP Constructive Tuning & Autogas Button */}
          {onOpenTuningCompliance && (
            <button
              onClick={onOpenTuningCompliance}
              data-testid="navbar-tuning-compliance-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="BDYP & AZS Tüninq, Qazbalon (LPG/CNG) və Konstruktiv Dəyişiklik Portalı"
            >
              <Wrench className="w-4 h-4 text-orange-400" />
              <span className="hidden xl:inline">Tüninq & Qaz</span>
            </button>
          )}

          {/* Təmiz Şəhər ASC Vehicle Scrappage & Voucher Button */}
          {onOpenScrappage && (
            <button
              onClick={onOpenScrappage}
              data-testid="navbar-scrappage-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="Təmiz Şəhər ASC — Köhnə Avtomobillərin Utilizasiyası və Güzəşt Vauçeri Portalı"
            >
              <Recycle className="w-4 h-4 text-emerald-400" />
              <span className="hidden xl:inline">Utilizasiya</span>
            </button>
          )}

          {/* BDYP & AYNA Impound Lot & Towing Release Button */}
          {onOpenImpoundLot && (
            <button
              onClick={onOpenImpoundLot}
              data-testid="navbar-impound-lot-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="BDYP & AYNA Cərimə Meydançası Axtarışı, Evakuasiya Yoxlaması və E-Buraxılış Portalı"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="hidden xl:inline">Cərimə Meydançası</span>
            </button>
          )}

          {/* AYNA Bus Lane & Baku Special Traffic Regime Button */}
          {onOpenSpecialTraffic && (
            <button
              onClick={onOpenSpecialTraffic}
              data-testid="navbar-special-traffic-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="AYNA Avtobus Zolağı (İXM 327.1-1) & Bakı Giriş E-Buraxılış Portalı"
            >
              <Bus className="w-4 h-4 text-sky-400" />
              <span className="hidden xl:inline">BUS Zolaq & E-Giriş</span>
            </button>
          )}

          {/* BDYP Driver's License Category (B/BE) & Exam Portal Button */}
          {onOpenDriverLicense && (
            <button
              onClick={onOpenDriverLicense}
              data-testid="navbar-driver-license-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="BDYP & ASAN Sürücülük Vəsiqəsi, Kateqoriya (B/BE) və İmtahan Portalı"
            >
              <Award className="w-4 h-4 text-indigo-400" />
              <span className="hidden xl:inline">Sürücülük Vəsiqəsi</span>
            </button>
          )}

          {/* BDYP Tire Standards, Tread Depth & Mountain Winter Readiness Button */}
          {onOpenTireCompliance && (
            <button
              onClick={onOpenTireCompliance}
              data-testid="navbar-tire-compliance-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="BDYP Şin Standartları (YHQ Əlavə 1), Protektor & Qış Dağ Keçidi Portalı"
            >
              <Disc className="w-4 h-4 text-cyan-400" />
              <span className="hidden xl:inline">Şin & Qış Rejimi</span>
            </button>
          )}

          {/* BDYP Headlight Standards, Xenon/LED & Regloscope Stand Button */}
          {onOpenHeadlightCompliance && (
            <button
              onClick={onOpenHeadlightCompliance}
              data-testid="navbar-headlight-compliance-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="BDYP Xarici İşıq Cihazları, Ksenon/LED Qanunilik (İXM 342.2-1) & Fara Reqloskop Stendi"
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span className="hidden xl:inline">Fara & Ksenon/LED</span>
            </button>
          )}

          {/* BDYP & FHN Emergency Safety Kit, Child Seat (ISOFIX) & Passenger Compliance Button */}
          {onOpenPassengerSafety && (
            <button
              onClick={onOpenPassengerSafety}
              data-testid="navbar-passenger-safety-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="BDYP & FHN Qəza Təchizatı (Odluq, Tibbi Çanta) və Uşaq Avtokreslosu (İSOFIX) Portalı"
            >
              <HeartPulse className="w-4 h-4 text-rose-400" />
              <span className="hidden xl:inline">Odluq & İSOFIX</span>
            </button>
          )}

          {/* BDYP & ETSN Exhaust Emissions, Gas Analyzer & Catalyst/DPF Button */}
          {onOpenEmissionsCompliance && (
            <button
              onClick={onOpenEmissionsCompliance}
              data-testid="navbar-emissions-compliance-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="BDYP & ETSN «Təmiz Hava» Ekoloji Nəzarət, Qazanalizator (İXM 342.5) & Katalizator/DPF Portalı"
            >
              <Wind className="w-4 h-4 text-emerald-400" />
              <span className="hidden xl:inline">Təmiz Hava & Katalizator</span>
            </button>
          )}

          {/* BDYP Braking System & Steering Mechanism Stand Button */}
          {onOpenBrakeSteering && (
            <button
              onClick={onOpenBrakeSteering}
              data-testid="navbar-brake-steering-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="BDYP Tormoz Sistemi & Sükan Lüftometr Stendi (YHQ Əlavə 1 Bölmə I-II & İXM 342.2)"
            >
              <Disc className="w-4 h-4 text-red-400" />
              <span className="hidden xl:inline">Tormoz & Sükan</span>
            </button>
          )}

          {/* BDYP Driver Visibility, Windshield, Wipers & Acoustic Horn ("FIFA") Button */}
          {onOpenVisibilityHorn && (
            <button
              onClick={onOpenVisibilityHorn}
              data-testid="navbar-visibility-horn-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="BDYP Görünüş, Alın Şüşəsi, Şüşəsilən & Akustik Siqnal (FİFA Qadağası — YHQ Əlavə 1 Bölmə IV/VII)"
            >
              <Eye className="w-4 h-4 text-sky-400" />
              <span className="hidden xl:inline">Şüşə & FİFA Siqnal</span>
            </button>
          )}

          {/* BDYP Engine/VIN Forensic, DQN Readability (IXM 342.7) & SRS Airbag Button */}
          {onOpenForensicPlate && (
            <button
              onClick={onOpenForensicPlate}
              data-testid="navbar-forensic-plate-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="BDYP Mühərrik/VIN Kriminalistik Ekspertiza, DQN 20m Oxunuş (İXM 342.7) & SRS Airbag Stendi"
            >
              <Fingerprint className="w-4 h-4 text-indigo-400" />
              <span className="hidden xl:inline">Mühərrik № & DQN</span>
            </button>
          )}

          {/* BDYP & ADRA Exterior Bodywork, Vinyl Wrap, Advertising & Farkop Button */}
          {onOpenBodyworkAdvertising && (
            <button
              onClick={onOpenBodyworkAdvertising}
              data-testid="navbar-bodywork-advertising-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-fuchsia-500/10 hover:bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="BDYP & ADRA Kuzov Rəngi/Vinil (YHQ Maddə 27), Nəqliyyat Reklamı (İXM 342.1.8) & Farkop/Bufer Portalı"
            >
              <Palette className="w-4 h-4 text-fuchsia-400" />
              <span className="hidden xl:inline">Rəng, Vinil & Reklam</span>
            </button>
          )}

          {/* AYNA & BDYP Digital Tachograph, Driver Work/Rest Regime (AETR) & E-Ugur Waybill Button */}
          {onOpenTachographWorkRest && (
            <button
              onClick={onOpenTachographWorkRest}
              data-testid="navbar-tachograph-work-rest-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="AYNA & BDYP Rəqəmsal Taxoqraf, Sürücü İş-İstirahət Rejimi (NK №73 / AETR) & E-Uğur Yol Vərəqəsi Portalı"
            >
              <Timer className="w-4 h-4 text-indigo-400" />
              <span className="hidden xl:inline">Taxoqraf & AETR</span>
            </button>
          )}

          {/* AZS, BDYP & FHN EV/Hybrid High-Voltage Insulation (R100), SOH% & Green Privilege Button */}
          {onOpenHvBatterySafety && (
            <button
              onClick={onOpenHvBatterySafety}
              data-testid="navbar-hv-battery-safety-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="AZS, BDYP & FHN Elektromobil/Hibrid Yüksək Gərginlik (UNECE R100 ≥500 Ω/V), Batareya SOH% & AMB Yaşıl Kredit Portalı"
            >
              <BatteryCharging className="w-4 h-4 text-teal-400" />
              <span className="hidden xl:inline">HV SOH% & R100</span>
            </button>
          )}

          {/* BDYP & AZS Suspension, EUSAMA & Chassis 3D Alignment Button */}
          {onOpenSuspensionChassis && (
            <button
              onClick={onOpenSuspensionChassis}
              data-testid="navbar-suspension-chassis-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="BDYP & AZS Asqı, Amortizator (EUSAMA), Qanunsuz Peredok & Hunter 3D Razval Portalı"
            >
              <Activity className="w-4 h-4 text-amber-400" />
              <span className="hidden xl:inline">Asqı & Şassi</span>
            </button>
          )}

          {/* Səhiyyə Nazirliyi & BDYP Driver Medical Examination Button */}
          {onOpenDriverMedical && (
            <button
              onClick={onOpenDriverMedical}
              data-testid="navbar-driver-medical-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="Səhiyyə Nazirliyi, BDYP & ASAN Sürücülük Tibbi Müayinəsi (Forma AZS-083/e), Rabkin Rəng Korluğu & Alkotest Toksikologiya Portalı"
            >
              <Stethoscope className="w-4 h-4 text-emerald-400" />
              <span className="hidden xl:inline">Tibbi Arayış 083/e</span>
            </button>
          )}

          {/* BDYP & Elm Nazirliyi Driving School & Practical Exam Button */}
          {onOpenDrivingSchool && (
            <button
              onClick={onOpenDrivingSchool}
              data-testid="navbar-driving-school-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="BDYP & Elm və Təhsil Nazirliyi Sürücülük Məktəbləri Reyestri, Avtodrom (Estakada) & 100-Bal Şəhər İmtahanı Portalı"
            >
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span className="hidden xl:inline">Avtoməktəb & İmtahan</span>
            </button>
          )}

          {/* FHN & BDYP ADR Dangerous Goods Transport Button */}
          {onOpenAdrCompliance && (
            <button
              onClick={onOpenAdrCompliance}
              data-testid="navbar-adr-compliance-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="FHN, BDYP & AZS Təhlükəli Yüklərin Daşınması (ADR), Narıncı Kemler Lövhəsi & Rəsmi Xüsusi İcazə Portalı"
            >
              <Flame className="w-4 h-4 text-amber-400" />
              <span className="hidden xl:inline">ADR Təhlükəli Yüklər</span>
            </button>
          )}

          {/* AAYDA & BDYP Oversize and Heavy Axle Transport Permitting Button */}
          {onOpenOversizePermit && (
            <button
              onClick={onOpenOversizePermit}
              data-testid="navbar-oversize-permit-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 text-orange-400 border border-orange-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="AAYDA & BDYP İriqabaritli və Ağırçəkili Yüklərin Daşınması (NK № 104), Körpü Mühəndisliyi & Elektron Xüsusi İcazə Portalı"
            >
              <Truck className="w-4 h-4 text-orange-400" />
              <span className="hidden xl:inline">İriqabaritli Yüklər</span>
            </button>
          )}

          {/* BDYP & Ədliyyə Nazirliyi YNH Məhkəmə Avtotexniki Ekspertizası Button */}
          {onOpenAccidentForensics && (
            <button
              onClick={onOpenAccidentForensics}
              data-testid="navbar-accident-forensics-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="BDYP & Ədliyyə Nazirliyi YNH Məhkəmə Avtotexniki Ekspertizası (v=√(254·μ·S)), Qəza Tormoz İzi və Məsuliyyət Portalı"
            >
              <Crosshair className="w-4 h-4 text-red-400" />
              <span className="hidden xl:inline">YNH Ekspertizası</span>
            </button>
          )}

          {/* DİN & BDYP Xüsusi Sayrışan Mayak və Siren («Miqalka») Button */}
          {onOpenSpecialSignal && (
            <button
              onClick={onOpenSpecialSignal}
              data-testid="navbar-special-signal-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="DİN & BDYP Xüsusi Sayrışan Mayak, Siren («Miqalka») YHQ Maddə 48 & İXM 342.9 Qanunilik Portalı"
            >
              <Siren className="w-4 h-4 text-blue-400" />
              <span className="hidden xl:inline">Sayrışan Mayak & Siren</span>
            </button>
          )}

          {/* Əmlak Məsələləri Dövlət Xidməti & Məhkəmə İcraçıları Dövlət Hərracı Button */}
          {onOpenVehicleAuction && (
            <button
              onClick={onOpenVehicleAuction}
              data-testid="navbar-vehicle-auction-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="Dövlət Əmlakı və Müsadirə Olunmuş Nəqliyyat Vasitələrinin Rəsmi Elektron Hərrac Portalı (e-herrac.emlak.gov.az)"
            >
              <Gavel className="w-4 h-4 text-amber-400" />
              <span className="hidden xl:inline">Dövlət Hərracı</span>
            </button>
          )}

          {/* DGK & BDYP Müvəqqəti İdxal & Tranzit Button */}
          {onOpenCustomsTransit && (
            <button
              onClick={onOpenCustomsTransit}
              data-testid="navbar-customs-transit-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="Dövlət Gömrük Komitəsi & BDYP Xarici Qeydiyyatlı Avtomobillərin Müvəqqəti İdxal & Tranzit Portalı (Gömrük Məcəlləsi Maddə 258/259)"
            >
              <Globe className="w-4 h-4 text-emerald-400" />
              <span className="hidden xl:inline">Müvəqqəti İdxal (DGK)</span>
            </button>
          )}

          {/* RİNN, DİN & ANAMA Yolumuz Qarabağa (e-yol.az) Button */}
          {onOpenKarabakhPermit && (
            <button
              onClick={onOpenKarabakhPermit}
              data-testid="navbar-karabakh-permit-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-500/10 hover:bg-teal-500/20 text-teal-400 border border-teal-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="Yolumuz Qarabağa (e-yol.az) Fərdi Avtomobillə Səfər İcazəsi Portalı"
            >
              <Compass className="w-4 h-4 text-teal-400" />
              <span className="hidden xl:inline">Yolumuz Qarabağa</span>
            </button>
          )}

          {/* DVX Avtomobil Vergi Portalı & E-Qaimə Button */}
          {onOpenVehicleTax && (
            <button
              onClick={onOpenVehicleTax}
              data-testid="navbar-vehicle-tax-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="Dövlət Vergi Xidməti (DVX) Avtomobil Vergi Portalı, Yol Vergisi & E-Qaimə Sistemi"
            >
              <ReceiptText className="w-4 h-4 text-emerald-400" />
              <span className="hidden xl:inline">DVX Vergi & E-Qaimə</span>
            </button>
          )}

          {/* AMB & İSB Bonus-Malus Reyestri Button */}
          {onOpenBonusMalus && (
            <button
              onClick={onOpenBonusMalus}
              data-testid="navbar-bonus-malus-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="AMB & İSB İcbari Sığorta 14 Sinifli Bonus-Malus Reyestri və Qəza Tarixçəsi Portalı"
            >
              <ShieldCheck className="w-4 h-4 text-blue-400" />
              <span className="hidden xl:inline">Bonus-Malus İSB</span>
            </button>
          )}

          {/* ETSN & BDYP Yaşıl Bakı LEZ & Eko-Stiker Portalı Button */}
          {onOpenEcoSticker && (
            <button
              onClick={onOpenEcoSticker}
              data-testid="navbar-eco-sticker-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="ETSN & BDYP 'Yaşıl Bakı' Aşağı Emissiyalı Ekoloji Zonalar (LEZ) & Eko-Stiker Portalı"
            >
              <Leaf className="w-4 h-4 text-emerald-400" />
              <span className="hidden xl:inline">Eko-Stiker LEZ</span>
            </button>
          )}

          {/* AMB & ALA Avtomobil Lizinqi & Maliyyə İcarəsi Portalı Button */}
          {onOpenLeasing && (
            <button
              onClick={onOpenLeasing}
              data-testid="navbar-leasing-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600/10 hover:bg-teal-600/20 text-teal-400 border border-teal-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="AMB & ALA Rəsmi Avtomobil Lizinqi və Maliyyə İcarəsi Portalı"
            >
              <Briefcase className="w-4 h-4 text-teal-400" />
              <span className="hidden xl:inline">Lizinq Portalı</span>
            </button>
          )}

          {/* ACRA & BDYP Avtomobil İcarəsi və Rent-a-Car Portalı Button */}
          {onOpenRental && (
            <button
              onClick={onOpenRental}
              data-testid="navbar-rental-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-600/10 hover:bg-sky-600/20 text-sky-400 border border-sky-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="Dövlət Turizm Agentliyi & BDYP Rəsmi Rent-a-Car və Avtomobil İcarəsi Portalı"
            >
              <KeyRound className="w-4 h-4 text-sky-400" />
              <span className="hidden xl:inline">Rent-a-Car</span>
            </button>
          )}

          {/* RİNN, AYNA, AZS & BDYP Rəsmi ADAS Sensor & Kamera Kalibrasiyası Portalı Button */}
          {onOpenAdas && (
            <button
              onClick={onOpenAdas}
              data-testid="navbar-adas-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 border border-blue-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="RİNN, AYNA, AZS & BDYP Rəsmi ADAS Sensor & Kamera Kalibrasiyası Portalı"
            >
              <Crosshair className="w-4 h-4 text-blue-400" />
              <span className="hidden xl:inline">ADAS Kalibrasiya</span>
            </button>
          )}

          {/* AMB, İSB & BDYP Rəsmi Konstruktiv Məhv («Total Loss») & Salvage Bərpa Portalı Button */}
          {onOpenSalvage && (
            <button
              onClick={onOpenSalvage}
              data-testid="navbar-salvage-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600/10 hover:bg-rose-600/20 text-rose-400 border border-rose-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="AMB, İSB & BDYP Rəsmi Konstruktiv Məhv («Total Loss») və Salvage Bərpa Portalı"
            >
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span className="hidden xl:inline">Total Loss / Salvage</span>
            </button>
          )}

          {/* RİNN, AYNA & ABADA Beynəlxalq Yük Daşımaları & E-CMR Portalı Button */}
          {onOpenFreight && (
            <button
              onClick={onOpenFreight}
              data-testid="navbar-freight-btn"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 text-xs sm:text-sm font-medium transition-all cursor-pointer shadow-sm"
              title="RİNN, AYNA & ABADA Beynəlxalq Yük Daşımaları & E-CMR Portalı"
            >
              <Truck className="w-4 h-4 text-indigo-400" />
              <span className="hidden xl:inline">Beynəlxalq Daşıma (E-CMR)</span>
            </button>
          )}

          {/* AI Advisor Button */}
          <button
            onClick={onOpenAiAdvisor}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-500/15 to-indigo-500/15 hover:from-purple-500/25 hover:to-indigo-500/25 text-purple-300 border border-purple-500/30 text-xs sm:text-sm font-medium transition-all shadow-sm group"
          >
            <Sparkles className="w-4 h-4 text-purple-400 group-hover:rotate-12 transition-transform" />
            <span className="hidden md:inline">AI Advisor</span>
          </button>

          {/* Loan Calculator Button */}
          <button
            onClick={onOpenCalculator}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs sm:text-sm font-medium transition-all"
          >
            <Calculator className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">{t.creditCalculator}</span>
          </button>

          {/* Comparison Trigger */}
          <button
            onClick={onOpenCompare}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
              comparedVehicles.length > 0
                ? 'bg-blue-600/15 border-blue-500/50 text-blue-400'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4 text-blue-400" />
            <span className="hidden md:inline">{t.compare}</span>
            {comparedVehicles.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-blue-500 text-white">
                {comparedVehicles.length}
              </span>
            )}
          </button>

          {/* Favorites (Watchlist) Trigger */}
          <button
            onClick={onToggleFavoritesFilter}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs sm:text-sm font-medium transition-all ${
              isFavoritesFilterActive
                ? 'bg-rose-500/20 border-rose-500/50 text-rose-400 shadow-sm shadow-rose-500/20'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-rose-400'
            }`}
            title="Bəyənilən avtomobillər"
          >
            <Heart className={`w-4 h-4 ${favoritesCount > 0 ? 'text-rose-400 fill-rose-500/30' : 'text-slate-400'}`} />
            <span className="hidden lg:inline">Seçilmişlər</span>
            {favoritesCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-rose-500 text-white">
                {favoritesCount}
              </span>
            )}
          </button>

          {/* Currency Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            {(['AZN', 'USD', 'EUR'] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-2 py-1 rounded-lg font-medium transition-all ${
                  currency === c
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {c === 'AZN' ? '₼' : c === 'USD' ? '$' : '€'}
              </button>
            ))}
          </div>

          {/* Theme Toggle */}
          <button
            onClick={onToggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-amber-400 hover:border-amber-500/30 transition-all"
            title={lang === 'az' ? 'MTvzunu dTyiY' : lang === 'en' ? 'Toggle theme' : 'D!D<DD1D,,O ,DD<C'}
          >
            {theme === 'dark' ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
          </button>

          {/* Language Switcher */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs">
            {(['az', 'ru', 'en'] as Language[]).map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 rounded-lg font-medium uppercase transition-all ${
                  lang === l
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {l}
              </button>
            ))}
          </div>

          {/* Post Car Ad Button */}
          <button
            onClick={onOpenCreateListing}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white text-xs sm:text-sm font-semibold transition-all shadow-md shadow-blue-500/20 active:scale-95"
          >
            <PlusCircle className="w-4 h-4" />
            <span className="hidden sm:inline">{t.postAd}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
