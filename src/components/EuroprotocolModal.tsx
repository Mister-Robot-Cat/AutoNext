import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  X,
  Copy,
  Check,
  FileText,
  Car,
  QrCode,
  Calendar,
  Clock,
  MapPin,
  HelpCircle,
  Sparkles,
  PhoneCall,
  Scale,
  Send,
  Wrench,
  CheckSquare,
  Square,
  ChevronRight,
  Info,
} from 'lucide-react';
import { Currency, Vehicle } from '../types/vehicle';
import {
  AccidentScenarioId,
  DamageDegree,
  DamagePartId,
  DamageSelection,
  EuroprotocolEligibilityCriteria,
  FaultAllocation,
  PartyDetails,
  VehicleRole,
} from '../types/europrotocol';
import {
  calculateEuroprotocolPayout,
  calculateVehicleTotalDamage,
  findScenarioById,
  formatAzerbaijanPlate,
  generateProtocolNumber,
  generateSecurityHash,
  getInsuranceHotline,
  validateEuroprotocolEligibility,
} from '../utils/europrotocol';
import {
  AZERBAIJAN_INSURERS,
  DAMAGE_CATALOG,
  EUROPROTOCOL_SCENARIOS,
  SAMPLE_ACTIVE_CLAIMS,
  STATUTORY_EUROPROTOCOL_LIMIT_AZN,
} from '../data/mockEuroprotocolData';
import { formatPrice } from '../utils/i18n';

export interface EuroprotocolModalProps {
  isOpen: boolean;
  vehicle: Vehicle | null;
  currency: Currency;
  lang: 'az' | 'en' | 'ru';
  onClose: () => void;
}

type TabType = 'eligibility' | 'scenario' | 'damages' | 'parties' | 'protocol';

export const EuroprotocolModal: React.FC<EuroprotocolModalProps> = ({
  isOpen,
  vehicle,
  currency,
  lang,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('eligibility');
  const [copiedProtocol, setCopiedProtocol] = useState(false);
  const [isSubmittedToIsb, setIsSubmittedToIsb] = useState(false);

  // Criteria checks
  const [criteria, setCriteria] = useState<EuroprotocolEligibilityCriteria>({
    twoVehiclesOnly: true,
    noInjuriesOrCasualties: true,
    validCompulsoryInsuranceBoth: true,
    noThirdPartyPropertyDamage: true,
    mutualAgreementOnFault: true,
    estimatedUnderLimit: true,
  });

  // Accident circumstances
  const [selectedScenarioId, setSelectedScenarioId] = useState<AccidentScenarioId>('rear_end');
  const [faultAllocation, setFaultAllocation] = useState<FaultAllocation>('partyA_100');
  const [district, setDistrict] = useState('Nəsimi rayonu');
  const [streetAddress, setStreetAddress] = useState('Tbilisi prospekti 49');
  const [weather, setWeather] = useState<'clear' | 'rainy' | 'foggy' | 'snowy'>('clear');
  const [roadSurface, setRoadSurface] = useState<'dry' | 'wet' | 'slippery'>('dry');

  // Parties details
  const [partyA, setPartyA] = useState<PartyDetails>({
    role: 'partyA',
    driverFullName: 'Məmmədov Rauf Eldar oğlu',
    driverLicense: '02-AA-492019',
    driverPhone: '+994 50 491 88 22',
    plateNumber: '99-BK-412',
    make: 'Toyota',
    model: 'Prius',
    year: 2014,
    vin: 'JTDKN36U0B1294821',
    insuranceCompany: 'PAŞA Sığorta ASC',
    policyNumber: 'ICB-PA-2026-99120',
    damages: [
      { partId: 'front_bumper', degree: 'scratch' },
      { partId: 'radiator_grille', degree: 'dent' },
    ],
  });

  const [partyB, setPartyB] = useState<PartyDetails>(() => {
    if (vehicle) {
      return {
        role: 'partyB',
        driverFullName: 'Quliyeva Nərmin Əhməd qızı',
        driverLicense: '01-AB-193820',
        driverPhone: '+994 55 832 11 00',
        plateNumber: vehicle.plateNumber || '77-TC-904',
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        vin: vehicle.vin,
        insuranceCompany: 'Qala Sığorta ASC',
        policyNumber: 'ICB-QA-2026-44018',
        damages: [
          { partId: 'rear_bumper', degree: 'dent' },
          { partId: 'rear_taillight_right', degree: 'scratch' },
        ],
      };
    }
    return {
      role: 'partyB',
      driverFullName: 'Quliyeva Nərmin Əhməd qızı',
      driverLicense: '01-AB-193820',
      driverPhone: '+994 55 832 11 00',
      plateNumber: '77-TC-904',
      make: 'Hyundai',
      model: 'Elantra',
      year: 2021,
      vin: 'KMHD84LF7JU293810',
      insuranceCompany: 'Qala Sığorta ASC',
      policyNumber: 'ICB-QA-2026-44018',
      damages: [
        { partId: 'rear_bumper', degree: 'dent' },
        { partId: 'rear_taillight_right', degree: 'scratch' },
      ],
    };
  });

  // Selected party for damage editing
  const [damageActiveParty, setDamageActiveParty] = useState<VehicleRole>('partyB');

  // Protocol state
  const [protocolNumber] = useState<string>(() => generateProtocolNumber());
  const [createdAt] = useState<string>(() => new Date().toISOString().slice(0, 10));
  const [createdTime] = useState<string>(() => new Date().toTimeString().slice(0, 5));

  // Calculations
  const calculation = useMemo(() => {
    return calculateEuroprotocolPayout({
      partyA,
      partyB,
      faultAllocation,
      currency,
    });
  }, [partyA, partyB, faultAllocation, currency]);

  // Eligibility validation
  const eligibility = useMemo(() => {
    const victimDamage =
      calculation.claimantParty === 'partyB'
        ? calculation.partyBDamageAzn
        : calculation.partyADamageAzn;
    return validateEuroprotocolEligibility(criteria, victimDamage);
  }, [criteria, calculation]);

  const securityHash = useMemo(() => {
    return generateSecurityHash(protocolNumber, partyA.plateNumber, partyB.plateNumber);
  }, [protocolNumber, partyA.plateNumber, partyB.plateNumber]);

  const selectedScenario = useMemo(() => {
    return findScenarioById(selectedScenarioId) || EUROPROTOCOL_SCENARIOS[0];
  }, [selectedScenarioId]);

  if (!isOpen) return null;

  // Toggle damage part on active vehicle
  const handleToggleDamagePart = (partId: DamagePartId, degree: DamageDegree) => {
    const targetParty = damageActiveParty === 'partyA' ? partyA : partyB;
    const existingIndex = targetParty.damages.findIndex((d) => d.partId === partId);

    let updatedDamages: DamageSelection[];
    if (existingIndex >= 0) {
      if (targetParty.damages[existingIndex].degree === degree) {
        // Remove if clicking the same degree
        updatedDamages = targetParty.damages.filter((d) => d.partId !== partId);
      } else {
        // Update degree
        updatedDamages = targetParty.damages.map((d) =>
          d.partId === partId ? { ...d, degree } : d
        );
      }
    } else {
      updatedDamages = [...targetParty.damages, { partId, degree }];
    }

    if (damageActiveParty === 'partyA') {
      setPartyA({ ...partyA, damages: updatedDamages });
    } else {
      setPartyB({ ...partyB, damages: updatedDamages });
    }
  };

  // Quick autofill preset
  const handleAutofillPreset = (sampleIndex = 0) => {
    const sample = SAMPLE_ACTIVE_CLAIMS[sampleIndex] || SAMPLE_ACTIVE_CLAIMS[0];
    setSelectedScenarioId(sample.scenarioId);
    setFaultAllocation(sample.faultAllocation);
    setDistrict(sample.location.district);
    setStreetAddress(sample.location.street);
    setPartyA(sample.partyA);
    setPartyB(sample.partyB);
    setCriteria({
      twoVehiclesOnly: true,
      noInjuriesOrCasualties: true,
      validCompulsoryInsuranceBoth: true,
      noThirdPartyPropertyDamage: true,
      mutualAgreementOnFault: true,
      estimatedUnderLimit: true,
    });
    setIsSubmittedToIsb(false);
  };

  const handleCopyProtocol = () => {
    const text = `
---------------------------------------------------------
RƏSMİ ELEKTRON AVROPROTOKOL BİLDİRİŞİ
Azərbaycan Respublikası İcbari Sığorta Bürosu (İSB) & BDYP
Protokol №: ${protocolNumber}
Tarix: ${createdAt} ${createdTime}
Ünvan: ${district}, ${streetAddress}
---------------------------------------------------------
TƏRƏF A (Təqsirkar):
  Sürücü: ${partyA.driverFullName}
  Vəsiqə: ${partyA.driverLicense} | Tel: ${partyA.driverPhone}
  N/V: ${partyA.make} ${partyA.model} (${partyA.year}) - ${partyA.plateNumber}
  Sığortaçı: ${partyA.insuranceCompany} (${partyA.policyNumber})
  Zərər məbləği: ${calculation.partyADamageAzn} AZN

TƏRƏF B (Zərərçəkən):
  Sürücü: ${partyB.driverFullName}
  Vəsiqə: ${partyB.driverLicense} | Tel: ${partyB.driverPhone}
  N/V: ${partyB.make} ${partyB.model} (${partyB.year}) - ${partyB.plateNumber}
  Sığortaçı: ${partyB.insuranceCompany} (${partyB.policyNumber})
  Zərər məbləği: ${calculation.partyBDamageAzn} AZN
---------------------------------------------------------
QƏZA SXEMİ: ${selectedScenario.title.az}
HÜQUQİ ƏSAS: ${selectedScenario.legalArticle}
TƏSDİQ EDİLƏN SIĞORTA TƏZMİNATI: ${calculation.payablePayoutAzn} AZN (${formatPrice(calculation.payablePayoutAzn, currency)})
ÖDƏMƏ MÜDDƏTİ: 7 iş günü
TƏHLÜKƏSİZLİK KODU: ${securityHash}
STATUS: İSB Sisteminə qəbul edildi
---------------------------------------------------------
    `.trim();

    navigator.clipboard.writeText(text);
    setCopiedProtocol(true);
    setTimeout(() => setCopiedProtocol(false), 2500);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6"
      data-testid="europrotocol-modal"
    >
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base sm:text-lg font-black tracking-tight text-white">
                  İSB & BDYP Rəsmi Avroprotokol Sistemi
                </span>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-md">
                  Maddə 53-1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Polis gözləmədən 1,000 AZN-dək sığorta təzminatının rəsmiləşdirilməsi
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleAutofillPreset(0)}
              data-testid="autofill-test-btn"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-medium transition-all cursor-pointer"
              title="Test üçün nümunə qəzanı yükləyin"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Nümunə Doldur</span>
            </button>
            <button
              onClick={onClose}
              data-testid="close-modal-btn"
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 px-6 pt-3 pb-2 bg-slate-950/60 border-b border-slate-800/80 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('eligibility')}
            data-testid="tab-eligibility-btn"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'eligibility'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-emerald-400" />
            <span>1. Qanuni Şərtlər</span>
            {eligibility.isEligible ? (
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            ) : (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('scenario')}
            data-testid="tab-scenario-btn"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'scenario'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Scale className="w-4 h-4 text-emerald-400" />
            <span>2. Qəza Sxemi & Təqsir</span>
          </button>

          <button
            onClick={() => setActiveTab('damages')}
            data-testid="tab-damages-btn"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'damages'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Wrench className="w-4 h-4 text-emerald-400" />
            <span>3. Zədələr ({calculation.totalDamageAzn} ₼)</span>
          </button>

          <button
            onClick={() => setActiveTab('parties')}
            data-testid="tab-parties-btn"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'parties'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Car className="w-4 h-4 text-emerald-400" />
            <span>4. Tərəflər & Sığorta</span>
          </button>

          <button
            onClick={() => setActiveTab('protocol')}
            data-testid="tab-protocol-btn"
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'protocol'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>5. Elektron Protokol</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: ELIGIBILITY & STATUTORY CRITERIA */}
          {activeTab === 'eligibility' && (
            <div className="space-y-6">
              {/* Status Banner */}
              <div
                data-testid="eligibility-status-banner"
                className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                  eligibility.isEligible
                    ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200'
                    : 'bg-amber-500/10 border-amber-500/40 text-amber-200'
                }`}
              >
                <div className="flex items-start gap-3">
                  {eligibility.isEligible ? (
                    <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <AlertTriangle className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-white">
                      {eligibility.isEligible
                        ? 'AVROPROTOKOL ÜÇÜN TAM UYĞUNDUR!'
                        : 'DİQQƏT: Avroprotokol şərtləri ödənmir'}
                    </h3>
                    <p className="text-xs sm:text-sm mt-1 text-slate-300 leading-relaxed">
                      {eligibility.isEligible
                        ? 'DYP polisini gözləməyə və yolda tıxac yaratmağa ehtiyac yoxdur. Avtomobillərin mövqeyini 4 bucaqdan şəkilləndirdikdən sonra hərəkət hissəsini azad edib protokolu elektron tərtib edə bilərsiniz.'
                        : 'Qanunvericiliyin tələbinə əsasən, aşağıdakı maneələr aradan qaldırılmadıqda mütləq BDYP (902) naryadı çağırılmalıdır:'}
                    </p>

                    {!eligibility.isEligible && (
                      <ul className="mt-3 space-y-1.5 text-xs text-amber-300 font-medium">
                        {eligibility.reasons.map((r, i) => (
                          <li key={i} className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                            <span>{r.az}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </div>

              {/* Statutory Criteria Toggles */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Maddə 53-1 üzrə 6 Məcburi Şərt:
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={criteria.twoVehiclesOnly}
                      onChange={(e) =>
                        setCriteria({ ...criteria, twoVehiclesOnly: e.target.checked })
                      }
                      className="mt-1 w-4 h-4 rounded text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-white">
                        Yalnız 2 Nəqliyyat Vasitəsi İştirak Edir
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Zəncirvari və ya 3+ avtomobil toqquşması deyil
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={criteria.noInjuriesOrCasualties}
                      onChange={(e) =>
                        setCriteria({ ...criteria, noInjuriesOrCasualties: e.target.checked })
                      }
                      className="mt-1 w-4 h-4 rounded text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-white">
                        Xəsarət və Sağlamlığa Zərər Yoxdur
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Sürücülər və sərnişinlər xəsarət almayıb
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={criteria.validCompulsoryInsuranceBoth}
                      onChange={(e) =>
                        setCriteria({
                          ...criteria,
                          validCompulsoryInsuranceBoth: e.target.checked,
                        })
                      }
                      className="mt-1 w-4 h-4 rounded text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-white">
                        Hər İki Tərəfin Qüvvədə Olan İcbari Sığortası Var
                      </div>
                      <div className="text-[11px] text-slate-400">
                        İSB bazasında sığorta şəhadətnamələri aktivdir
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={criteria.noThirdPartyPropertyDamage}
                      onChange={(e) =>
                        setCriteria({
                          ...criteria,
                          noThirdPartyPropertyDamage: e.target.checked,
                        })
                      }
                      className="mt-1 w-4 h-4 rounded text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-white">
                        Üçüncü Şəxslərin Əmlakına Ziyan Dəyməyib
                      </div>
                      <div className="text-[11px] text-slate-400">
                        İşıq dirəyi, yol hasarı və ya 3-cü maşın zədələnməyib
                      </div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all">
                    <input
                      type="checkbox"
                      checked={criteria.mutualAgreementOnFault}
                      onChange={(e) =>
                        setCriteria({ ...criteria, mutualAgreementOnFault: e.target.checked })
                      }
                      className="mt-1 w-4 h-4 rounded text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-white">
                        Hadisənin Şəraitində Tərəflər Tam Razıdır
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Təqsirkar tərəf öz günahını etiraf edir və mübahisə yoxdur
                      </div>
                    </div>
                  </label>

                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-white">
                        Zərər Qanuni 1,000 AZN Həddi Daxilindədir
                      </div>
                      <div className="text-[11px] text-slate-400">
                        Cari qiymətləndirmə: {calculation.payablePayoutAzn} AZN / 1,000 AZN
                      </div>
                    </div>
                    {calculation.isEligibleDamageLimit ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <AlertTriangle className="w-5 h-5 text-amber-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Emergency Hotline Helplines */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">İcbari Sığorta Bürosu</div>
                    <div className="text-sm font-bold text-white">1540 / *0007</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">BDYP Qəza Növbətçi</div>
                    <div className="text-sm font-bold text-white">902</div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
                    <PhoneCall className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Təcili Tibbi Yardım</div>
                    <div className="text-sm font-bold text-white">103</div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setActiveTab('scenario')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  <span>Növbəti: Qəza Sxemini Seçin</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ACCIDENT SCENARIO & LIABILITY */}
          {activeTab === 'scenario' && (
            <div className="space-y-6">
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Standart Yol-Nəqliyyat Hadisəsi Sxemi:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {EUROPROTOCOL_SCENARIOS.map((sc) => (
                    <div
                      key={sc.id}
                      onClick={() => {
                        setSelectedScenarioId(sc.id);
                        setFaultAllocation(sc.defaultFault);
                      }}
                      data-testid={`scenario-item-${sc.id}`}
                      className={`p-4 rounded-2xl border text-left cursor-pointer transition-all ${
                        selectedScenarioId === sc.id
                          ? 'bg-emerald-500/10 border-emerald-500 text-white shadow-md'
                          : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          {sc.code}
                        </span>
                        <span className="text-[11px] font-mono text-emerald-400">
                          {sc.legalArticle}
                        </span>
                      </div>
                      <h5 className="text-sm font-bold text-white mt-2">{sc.title.az}</h5>
                      <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {sc.description.az}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Fault Allocation */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Tərəflərin Razılaşdırılmış Təqsirkarlıq Dərəcəsi:
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setFaultAllocation('partyA_100')}
                    data-testid="fault-partyA_100-btn"
                    className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                      faultAllocation === 'partyA_100'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-sm">Tərəf A 100% Təqsirkardır</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Tərəf B tam zərərçəkəndir
                    </div>
                  </button>

                  <button
                    onClick={() => setFaultAllocation('partyB_100')}
                    data-testid="fault-partyB_100-btn"
                    className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                      faultAllocation === 'partyB_100'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-sm">Tərəf B 100% Təqsirkardır</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Tərəf A tam zərərçəkəndir
                    </div>
                  </button>

                  <button
                    onClick={() => setFaultAllocation('mutual_50_50')}
                    data-testid="fault-mutual_50_50-btn"
                    className={`p-3.5 rounded-xl border text-center transition-all cursor-pointer ${
                      faultAllocation === 'mutual_50_50'
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="text-sm">Qarşılıqlı Təqsir (50% / 50%)</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Hər iki sürücüdə qayda pozuntusu
                    </div>
                  </button>
                </div>
              </div>

              {/* Location & Conditions */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Hadisə Yeri və Şəraiti:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Şəhər / Rayon:
                    </label>
                    <input
                      type="text"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Küçə / Prospekt:
                    </label>
                    <input
                      type="text"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Hava Şəraiti:
                    </label>
                    <select
                      value={weather}
                      onChange={(e) => setWeather(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    >
                      <option value="clear">Açıq / Günəşli</option>
                      <option value="rainy">Yağışlı</option>
                      <option value="foggy">Dumanlı</option>
                      <option value="snowy">Qarlı</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Yol Səthi:
                    </label>
                    <select
                      value={roadSurface}
                      onChange={(e) => setRoadSurface(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    >
                      <option value="dry">Quru asfalt</option>
                      <option value="wet">Yaş / Su yığılması</option>
                      <option value="slippery">Sürüşkən / Buzlu</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setActiveTab('eligibility')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Geri
                </button>
                <button
                  onClick={() => setActiveTab('damages')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  <span>Növbəti: Zədələri Qeyd Edin</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DAMAGE ESTIMATION & PARTS CATALOGUE */}
          {activeTab === 'damages' && (
            <div className="space-y-6">
              {/* Vehicle Switcher & Damage Totals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={() => setDamageActiveParty('partyA')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    damageActiveParty === 'partyA'
                      ? 'bg-emerald-500/10 border-emerald-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">
                      TƏRƏF A (Təqsirkar)
                    </span>
                    <span className="text-sm font-black text-white font-mono">
                      {calculation.partyADamageAzn} ₼
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {partyA.make} {partyA.model} ({partyA.plateNumber})
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {partyA.damages.length} zədələnmiş detal
                  </div>
                </button>

                <button
                  onClick={() => setDamageActiveParty('partyB')}
                  className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                    damageActiveParty === 'partyB'
                      ? 'bg-emerald-500/10 border-emerald-500 shadow-md'
                      : 'bg-slate-950/60 border-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-400">
                      TƏRƏF B (Zərərçəkən)
                    </span>
                    <span className="text-sm font-black text-emerald-400 font-mono">
                      {calculation.partyBDamageAzn} ₼
                    </span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {partyB.make} {partyB.model} ({partyB.plateNumber})
                  </div>
                  <div className="text-xs text-slate-400 mt-1">
                    {partyB.damages.length} zədələnmiş detal
                  </div>
                </button>
              </div>

              {/* Statutory Limit Meter */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="font-semibold text-slate-300">
                    Zərərçəkənin Təmir Xərci vs Qanuni 1,000 AZN Həddi:
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      calculation.isEligibleDamageLimit ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {calculation.partyBDamageAzn} AZN / {STATUTORY_EUROPROTOCOL_LIMIT_AZN} AZN
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${
                      calculation.partyBDamageAzn <= 800
                        ? 'bg-emerald-500'
                        : calculation.partyBDamageAzn <= 1000
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (calculation.partyBDamageAzn / STATUTORY_EUROPROTOCOL_LIMIT_AZN) * 100
                      )}%`,
                    }}
                  />
                </div>
                {!calculation.isEligibleDamageLimit && (
                  <p className="text-xs text-rose-400 mt-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>
                      Zərər 1,000 AZN həddini {calculation.excessUncoveredAzn} AZN aşır. Qanunla
                      yalnız 1,000 AZN sığorta tərəfindən ödənilir, qalan məbləğ nağd ödənməli və ya
                      BDYP çağırılmalıdır.
                    </span>
                  </p>
                )}
              </div>

              {/* Damaged Parts Selector */}
              <div>
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  {damageActiveParty === 'partyA' ? 'Tərəf A' : 'Tərəf B'} üçün Zədəli Detalları
                  Seçin:
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {DAMAGE_CATALOG.map((item) => {
                    const currentTarget = damageActiveParty === 'partyA' ? partyA : partyB;
                    const damage = currentTarget.damages.find((d) => d.partId === item.partId);

                    return (
                      <div
                        key={item.partId}
                        className={`p-3 rounded-2xl border transition-all ${
                          damage
                            ? 'bg-emerald-500/10 border-emerald-500/60 text-white'
                            : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold">{item.name.az}</span>
                          {damage && (
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">
                              Seçilib
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-1.5 mt-2.5">
                          <button
                            type="button"
                            onClick={() => handleToggleDamagePart(item.partId, 'scratch')}
                            className={`px-1.5 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                              damage?.degree === 'scratch'
                                ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            Cızıq ({item.costs.scratch}₼)
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleDamagePart(item.partId, 'dent')}
                            className={`px-1.5 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                              damage?.degree === 'dent'
                                ? 'bg-amber-500 border-amber-400 text-slate-950 font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            Əzilmə ({item.costs.dent}₼)
                          </button>

                          <button
                            type="button"
                            onClick={() => handleToggleDamagePart(item.partId, 'replace')}
                            className={`px-1.5 py-1 rounded-lg text-[10px] font-semibold border transition-all cursor-pointer ${
                              damage?.degree === 'replace'
                                ? 'bg-rose-500 border-rose-400 text-white font-bold'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                            }`}
                          >
                            Dəyişmə ({item.costs.replace}₼)
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setActiveTab('scenario')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Geri
                </button>
                <button
                  onClick={() => setActiveTab('parties')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  <span>Növbəti: Tərəflər və Sığorta</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 4: PARTIES & INSURANCE POLICIES */}
          {activeTab === 'parties' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Party A */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                      TƏRƏF A (Təqsirkar)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Sürücülük Vəsiqəsi
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Sürücünün S.A.A:
                    </label>
                    <input
                      type="text"
                      value={partyA.driverFullName}
                      onChange={(e) => setPartyA({ ...partyA, driverFullName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Vəsiqə Seriyası:
                      </label>
                      <input
                        type="text"
                        value={partyA.driverLicense}
                        onChange={(e) => setPartyA({ ...partyA, driverLicense: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Əlaqə Telefonu:
                      </label>
                      <input
                        type="text"
                        value={partyA.driverPhone}
                        onChange={(e) => setPartyA({ ...partyA, driverPhone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Dövlət Qeydiyyat Nişanı:
                      </label>
                      <input
                        type="text"
                        value={partyA.plateNumber}
                        onChange={(e) =>
                          setPartyA({
                            ...partyA,
                            plateNumber: formatAzerbaijanPlate(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Marka / Model:
                      </label>
                      <input
                        type="text"
                        value={`${partyA.make} ${partyA.model}`}
                        onChange={(e) => {
                          const parts = e.target.value.split(' ');
                          setPartyA({ ...partyA, make: parts[0] || '', model: parts.slice(1).join(' ') || '' });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      İcbari Sığorta Şirkəti:
                    </label>
                    <select
                      value={partyA.insuranceCompany}
                      onChange={(e) => setPartyA({ ...partyA, insuranceCompany: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    >
                      {AZERBAIJAN_INSURERS.map((ins) => (
                        <option key={ins.id} value={ins.name}>
                          {ins.name} ({ins.hotline})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Sığorta Polis Nömrəsi:
                    </label>
                    <input
                      type="text"
                      value={partyA.policyNumber}
                      onChange={(e) => setPartyA({ ...partyA, policyNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono uppercase"
                    />
                  </div>
                </div>

                {/* Party B */}
                <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                      TƏRƏF B (Zərərçəkən)
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Təzminat Alan Tərəf
                    </span>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Sürücünün S.A.A:
                    </label>
                    <input
                      type="text"
                      value={partyB.driverFullName}
                      onChange={(e) => setPartyB({ ...partyB, driverFullName: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Vəsiqə Seriyası:
                      </label>
                      <input
                        type="text"
                        value={partyB.driverLicense}
                        onChange={(e) => setPartyB({ ...partyB, driverLicense: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white uppercase font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Əlaqə Telefonu:
                      </label>
                      <input
                        type="text"
                        value={partyB.driverPhone}
                        onChange={(e) => setPartyB({ ...partyB, driverPhone: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Dövlət Qeydiyyat Nişanı:
                      </label>
                      <input
                        type="text"
                        value={partyB.plateNumber}
                        onChange={(e) =>
                          setPartyB({
                            ...partyB,
                            plateNumber: formatAzerbaijanPlate(e.target.value),
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                        Marka / Model:
                      </label>
                      <input
                        type="text"
                        value={`${partyB.make} ${partyB.model}`}
                        onChange={(e) => {
                          const parts = e.target.value.split(' ');
                          setPartyB({ ...partyB, make: parts[0] || '', model: parts.slice(1).join(' ') || '' });
                        }}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      İcbari Sığorta Şirkəti:
                    </label>
                    <select
                      value={partyB.insuranceCompany}
                      onChange={(e) => setPartyB({ ...partyB, insuranceCompany: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white"
                    >
                      {AZERBAIJAN_INSURERS.map((ins) => (
                        <option key={ins.id} value={ins.name}>
                          {ins.name} ({ins.hotline})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                      Sığorta Polis Nömrəsi:
                    </label>
                    <input
                      type="text"
                      value={partyB.policyNumber}
                      onChange={(e) => setPartyB({ ...partyB, policyNumber: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between pt-2">
                <button
                  onClick={() => setActiveTab('damages')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Geri
                </button>
                <button
                  onClick={() => setActiveTab('protocol')}
                  data-testid="generate-protocol-btn"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                >
                  <span>Protokolu Hazırla və Tərtib Et</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL ELECTRONIC PROTOCOL VOUCHER */}
          {activeTab === 'protocol' && (
            <div className="space-y-6">
              {/* Submission Banner */}
              {isSubmittedToIsb ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-300 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                    <div>
                      <div className="text-sm font-bold text-white">
                        Avroprotokol İSB və Sığortaçı Şirkətə Uğurla Göndərildi!
                      </div>
                      <div className="text-xs text-emerald-300">
                        Qeydiyyat nömrəsi: {protocolNumber} | Ödəniş müddəti: 7 iş günü
                      </div>
                    </div>
                  </div>
                  <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 font-bold">
                    Təsdiqləndi
                  </span>
                </div>
              ) : null}

              {/* Official Electronic Protocol Card */}
              <div className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl relative overflow-hidden font-sans">
                {/* Watermark / Badge */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                    RƏSMİ E-SƏNƏD
                  </span>
                </div>

                {/* Header */}
                <div className="text-center border-b border-slate-800/80 pb-6 mb-6">
                  <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Azərbaycan Respublikası İcbari Sığorta Bürosu & DİN BDYP
                  </div>
                  <h3 className="text-lg sm:text-xl font-black text-white mt-1">
                    SADƏLƏŞDİRİLMİŞ YOL-NƏQLİYYAT HADİSƏSİ BİLDİRİŞİ (AVROPROTOKOL)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    «İcbari sığortalar haqqında» Qanunun 53-1-ci maddəsinə uyğun olaraq elektron
                    qaydada tərtib olunmuşdur
                  </p>

                  <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-4 text-xs font-mono text-slate-300">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-500">Protokol №:</span>
                      <span className="font-bold text-emerald-400">{protocolNumber}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{createdAt}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{createdTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {district}, {streetAddress}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Grid Parties */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6 border-b border-slate-800/80">
                  {/* Party A Box */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="font-bold text-amber-400 uppercase">TƏRƏF A (Təqsirkar)</span>
                      <span className="font-mono text-slate-400">100% Məsuliyyət</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sürücü:</span>
                      <span className="font-bold text-white">{partyA.driverFullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vəsiqə:</span>
                      <span className="font-mono text-white">{partyA.driverLicense}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">N/V:</span>
                      <span className="font-bold text-white">
                        {partyA.make} {partyA.model} ({partyA.year})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dövlət Nişanı:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {partyA.plateNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sığortaçı:</span>
                      <span className="text-slate-200">{partyA.insuranceCompany}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Polis №:</span>
                      <span className="font-mono text-slate-300">{partyA.policyNumber}</span>
                    </div>
                  </div>

                  {/* Party B Box */}
                  <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-1.5">
                      <span className="font-bold text-emerald-400 uppercase">
                        TƏRƏF B (Zərərçəkən)
                      </span>
                      <span className="font-mono text-emerald-400">Təzminat Alan</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sürücü:</span>
                      <span className="font-bold text-white">{partyB.driverFullName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Vəsiqə:</span>
                      <span className="font-mono text-white">{partyB.driverLicense}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">N/V:</span>
                      <span className="font-bold text-white">
                        {partyB.make} {partyB.model} ({partyB.year})
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Dövlət Nişanı:</span>
                      <span className="font-mono font-bold text-emerald-400">
                        {partyB.plateNumber}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sığortaçı:</span>
                      <span className="text-slate-200">{partyB.insuranceCompany}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Polis №:</span>
                      <span className="font-mono text-slate-300">{partyB.policyNumber}</span>
                    </div>
                  </div>
                </div>

                {/* Payout & Legal Terms */}
                <div className="py-6 border-b border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div>
                    <div className="text-xs text-slate-400">
                      Təsdiq Edilmiş Sığorta Təzminatı (Zərərçəkən Tərəf B):
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-white mt-1">
                      {calculation.payablePayoutAzn} AZN{' '}
                      <span className="text-sm font-normal text-slate-400">
                        ({formatPrice(calculation.payablePayoutAzn, currency)})
                      </span>
                    </div>
                    <div className="text-xs text-emerald-400 mt-1 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Ödəyici: {calculation.payingInsurer} (7 iş günü ərzində tam ödəniş)
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-3">
                    <QrCode className="w-12 h-12 text-slate-200 shrink-0" />
                    <div className="text-[11px] text-slate-400 font-mono">
                      <div>KOD: {securityHash}</div>
                      <div>İSB BAZA İMZASI: AKTİV</div>
                      <div className="text-[10px] text-emerald-400">VERİFİKASİYA TAMDIR</div>
                    </div>
                  </div>
                </div>

                {/* Legal Footnote */}
                <p className="text-[11px] text-slate-400 mt-4 leading-relaxed italic">
                  {calculation.legalNote.az}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('parties')}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
                >
                  Geri
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyProtocol}
                    data-testid="copy-protocol-btn"
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs sm:text-sm font-semibold transition-all cursor-pointer"
                  >
                    {copiedProtocol ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-400" />
                        <span className="text-emerald-400">Kopyalandı!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Protokolu Kopyala</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setIsSubmittedToIsb(true)}
                    data-testid="submit-isb-btn"
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs sm:text-sm font-semibold transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
                  >
                    <Send className="w-4 h-4" />
                    <span>İSB Portala Göndər</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
