import React, { useState, useEffect, useRef } from 'react';
import {
  Siren,
  ShieldAlert,
  Volume2,
  VolumeX,
  FileCheck2,
  AlertTriangle,
  Building2,
  Car,
  CheckCircle2,
  XCircle,
  Copy,
  Printer,
  Radio,
  Sliders,
  Search,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  OperativeCategory,
  SignalColor,
  SirenTone,
  SignalAuditInput,
  DinPermitRecord,
} from '../types/specialSignal';
import {
  auditSignalLegality,
  calculateYieldingFine,
  generateDinPermit,
  TONE_CONFIGS,
} from '../utils/specialSignalCompliance';
import {
  MOCK_SIGNAL_PROFILES,
  MOCK_SIREN_HARDWARE,
  MOCK_YIELDING_SCENARIOS,
  MOCK_DIN_PACKAGES,
  MOCK_DIN_LABORATORIES,
  MOCK_SAMPLE_PERMITS,
} from '../data/mockSpecialSignalData';

interface SpecialSignalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialVehicle?: {
    make?: string;
    model?: string;
    year?: number;
    vin?: string;
    plateNumber?: string;
  };
}

type TabType = 'audit' | 'simulator' | 'scenarios' | 'centers' | 'permit';

export const SpecialSignalModal: React.FC<SpecialSignalModalProps> = ({
  isOpen,
  onClose,
  initialVehicle,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('audit');

  // Audit state
  const [vehiclePlate, setVehiclePlate] = useState(initialVehicle?.plateNumber || '99-YP-401');
  const [vehicleModel, setVehicleModel] = useState(
    initialVehicle ? `${initialVehicle.make} ${initialVehicle.model}` : 'BMW 530i xDrive YPX'
  );
  const [vin, setVin] = useState(initialVehicle?.vin || 'WBA53AG09NFP10482');
  const [operativeCategory, setOperativeCategory] = useState<OperativeCategory>('police_bdyp');
  const [signalColor, setSignalColor] = useState<SignalColor>('blue_red');
  const [hasAudioSiren, setHasAudioSiren] = useState(true);
  const [sirenDecibels, setSirenDecibels] = useState(122);
  const [hasOfficialDinPermit, setHasOfficialDinPermit] = useState(true);
  const [isStrobeHiddenUnderGrille, setIsStrobeHiddenUnderGrille] = useState(false);

  // Sound simulator state
  const [activeTone, setActiveTone] = useState<SirenTone>('off');
  const [volume, setVolume] = useState(0.2); // safe initial volume
  const [isMuted, setIsMuted] = useState(false);
  const [activeStrobeColor, setActiveStrobeColor] = useState<SignalColor>('blue_red');
  const [strobeFlashState, setStrobeFlashState] = useState(0);

  // AudioContext refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);

  // Yielding scenario state
  const [selectedScenarioId, setSelectedScenarioId] = useState(MOCK_YIELDING_SCENARIOS[0].id);
  const [civilianYielded, setCivilianYielded] = useState(true);

  // Permit state
  const [permitsList, setPermitsList] = useState<DinPermitRecord[]>(MOCK_SAMPLE_PERMITS);
  const [activePermit, setActivePermit] = useState<DinPermitRecord>(MOCK_SAMPLE_PERMITS[0]);
  const [searchPermitQuery, setSearchPermitQuery] = useState('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [bookingSuccessMsg, setBookingSuccessMsg] = useState<string | null>(null);

  // Stop synthetic audio
  const stopAudio = () => {
    try {
      if (osc1Ref.current) {
        osc1Ref.current.stop();
        osc1Ref.current.disconnect();
        osc1Ref.current = null;
      }
      if (osc2Ref.current) {
        osc2Ref.current.stop();
        osc2Ref.current.disconnect();
        osc2Ref.current = null;
      }
      if (lfoRef.current) {
        lfoRef.current.stop();
        lfoRef.current.disconnect();
        lfoRef.current = null;
      }
      if (lfoGainRef.current) {
        lfoGainRef.current.disconnect();
        lfoGainRef.current = null;
      }
      if (gainNodeRef.current) {
        gainNodeRef.current.disconnect();
        gainNodeRef.current = null;
      }
    } catch {
      // safe cleanup
    }
  };

  // Play synthetic tone using Web Audio API
  const playTone = (tone: SirenTone) => {
    stopAudio();
    if (tone === 'off' || isMuted) {
      setActiveTone('off');
      return;
    }

    try {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) {
        setActiveTone(tone);
        return;
      }

      if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
        audioCtxRef.current = new AudioCtxClass();
      }

      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume * 0.15, ctx.currentTime);
      masterGain.connect(ctx.destination);
      gainNodeRef.current = masterGain;

      const cfg = TONE_CONFIGS[tone];
      if (!cfg) return;

      if (tone === 'wail' || tone === 'yelp') {
        const osc = ctx.createOscillator();
        osc.type = cfg.oscillatorType;
        const midFreq = (cfg.baseFreq + cfg.peakFreq) / 2;
        const depth = (cfg.peakFreq - cfg.baseFreq) / 2;
        osc.frequency.setValueAtTime(midFreq, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.type = 'sawtooth';
        lfo.frequency.setValueAtTime(cfg.rateHz, ctx.currentTime);

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(depth, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        osc.connect(masterGain);
        osc.start();
        lfo.start();

        osc1Ref.current = osc;
        lfoRef.current = lfo;
        lfoGainRef.current = lfoGain;
      } else if (tone === 'hi_lo') {
        const osc = ctx.createOscillator();
        osc.type = 'square';
        osc.frequency.setValueAtTime(cfg.baseFreq, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.type = 'square';
        lfo.frequency.setValueAtTime(1.5, ctx.currentTime);

        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(160, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(osc.frequency);

        osc.connect(masterGain);
        osc.start();
        lfo.start();

        osc1Ref.current = osc;
        lfoRef.current = lfo;
        lfoGainRef.current = lfoGain;
      } else if (tone === 'horn') {
        const osc1 = ctx.createOscillator();
        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(370, ctx.currentTime);

        const osc2 = ctx.createOscillator();
        osc2.type = 'square';
        osc2.frequency.setValueAtTime(440, ctx.currentTime);

        osc1.connect(masterGain);
        osc2.connect(masterGain);

        osc1.start();
        osc2.start();

        osc1Ref.current = osc1;
        osc2Ref.current = osc2;
      }

      setActiveTone(tone);
    } catch {
      setActiveTone(tone);
    }
  };

  // Adjust volume live
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(
        isMuted ? 0 : volume * 0.15,
        audioCtxRef.current.currentTime
      );
    }
  }, [volume, isMuted]);

  // Clean up on unmount or modal close
  useEffect(() => {
    if (!isOpen) {
      stopAudio();
      setActiveTone('off');
    }
    return () => {
      stopAudio();
    };
  }, [isOpen]);

  // Strobe beacon flash interval
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setStrobeFlashState((prev) => (prev + 1) % 4);
    }, 120);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  // Run audit calculation
  const auditInput: SignalAuditInput = {
    vehiclePlate,
    vehicleModel,
    operativeCategory,
    signalColor,
    hasAudioSiren,
    sirenDecibels,
    hasOfficialDinPermit,
    isStrobeHiddenUnderGrille,
  };
  const auditResult = auditSignalLegality(auditInput);

  // Selected scenario calculation
  const selectedScenario =
    MOCK_YIELDING_SCENARIOS.find((s) => s.id === selectedScenarioId) || MOCK_YIELDING_SCENARIOS[0];
  const yieldingSanction = calculateYieldingFine(civilianYielded);

  // Apply profile preset
  const handleApplyProfile = (profileId: string) => {
    const profile = MOCK_SIGNAL_PROFILES.find((p) => p.id === profileId);
    if (!profile) return;
    setVehiclePlate(profile.samplePlate);
    setVehicleModel(profile.vehicleModel);
    setOperativeCategory(profile.category);
    setSignalColor(profile.signalColor);
    setHasAudioSiren(profile.allowedSoundSignals);
    setSirenDecibels(profile.maxDecibels > 0 ? profile.maxDecibels : 120);
    setHasOfficialDinPermit(profile.category !== 'civilian_unauthorized');
    setIsStrobeHiddenUnderGrille(profile.category === 'civilian_unauthorized');
    setActiveStrobeColor(profile.signalColor);
  };

  // Generate new permit
  const handleGeneratePermit = () => {
    const newPermit = generateDinPermit({
      vehiclePlate,
      vin,
      vehicleModel,
      agencyNameAz:
        operativeCategory === 'police_bdyp'
          ? 'Azərbaycan Respublikası Daxili İşlər Nazirliyi (DİN BDYP)'
          : operativeCategory === 'medical_fhn'
          ? 'TƏBİB və Bakı Şəhər Təcili Tibbi Yardım Stansiyası'
          : operativeCategory === 'municipal_service'
          ? 'Azərbaycan Avtomobil Yolları Dövlət Agentliyi (AAYDA)'
          : 'Mərkəzi Bank Zirehli İnkasasiya İdarəsi',
      category: operativeCategory,
      authorizedColors: [signalColor],
      maxSoundDecibels: hasAudioSiren ? sirenDecibels : 0,
    });
    setPermitsList([newPermit, ...permitsList]);
    setActivePermit(newPermit);
    setActiveTab('permit');
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredPermits = permitsList.filter(
    (p) =>
      p.permitNumber.toLowerCase().includes(searchPermitQuery.toLowerCase()) ||
      p.vehiclePlate.toLowerCase().includes(searchPermitQuery.toLowerCase()) ||
      p.agencyNameAz.toLowerCase().includes(searchPermitQuery.toLowerCase())
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col my-auto max-h-[92vh]">
        {/* MODAL HEADER */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white flex items-center justify-between border-b border-indigo-800/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center shadow-inner">
              <Siren className="w-6 h-6 text-blue-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-wider font-semibold px-2.5 py-0.5 rounded-full bg-blue-500/30 text-blue-200 border border-blue-400/30">
                  DİN & BDYP Rəsmi Nəzarət
                </span>
                <span className="text-xs text-indigo-200 font-mono">YHQ Maddə 48 & İXM 342.9</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5">
                Xüsusi Sayrışan Mayak və Siren («Miqalka») Portalı
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Bağla"
            data-testid="close-modal-btn"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all focus:outline-none"
          >
            ✕
          </button>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-4 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('audit')}
            data-testid="tab-audit"
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'audit'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            1. Qanunilik & Cərimə Auditoru
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            data-testid="tab-simulator"
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'simulator'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Radio className="w-4 h-4" />
            2. Canlı Mayak & Siren Stendi
          </button>
          <button
            onClick={() => setActiveTab('scenarios')}
            data-testid="tab-scenarios"
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'scenarios'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Sliders className="w-4 h-4" />
            3. Hərəkət Üstünlüyü & İXM 327.3
          </button>
          <button
            onClick={() => setActiveTab('centers')}
            data-testid="tab-centers"
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'centers'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-4 h-4" />
            4. DİN & AZS Laboratoriyaları
          </button>
          <button
            onClick={() => setActiveTab('permit')}
            data-testid="tab-permit"
            className={`flex items-center gap-2 py-3 px-4 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
              activeTab === 'permit'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            5. Rəsmi DİN-OPR-2026 İcazə Qəbzi
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* TAB 1: AUDIT & SANCTION AUDITOR */}
          {activeTab === 'audit' && (
            <div className="space-y-6">
              {/* Presets Bar */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                  Xidməti & Mülki Nəqliyyat Nümunələri (Presets)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                  {MOCK_SIGNAL_PROFILES.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleApplyProfile(p.id)}
                      data-testid={`preset-${p.id}`}
                      className={`text-left p-2.5 rounded-xl border text-xs transition-all ${
                        operativeCategory === p.category && vehiclePlate === p.samplePlate
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/30 dark:border-blue-400 font-semibold text-blue-900 dark:text-blue-100 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold truncate">{p.samplePlate}</div>
                      <div className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                        {p.nameAz.split(' ')[0]} {p.nameAz.split(' ')[1]}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Configuration Form & Audit Card */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Car className="w-4 h-4 text-blue-500" />
                    Avtomobil və Xüsusi Siqnal Parametrləri
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Dövlət Qeydiyyat Nişanı:
                      </label>
                      <input
                        type="text"
                        value={vehiclePlate}
                        onChange={(e) => setVehiclePlate(e.target.value)}
                        data-testid="input-vehicle-plate"
                        className="w-full px-3 py-2 rounded-xl text-sm font-mono uppercase bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Avtomobil Modeli:
                      </label>
                      <input
                        type="text"
                        value={vehicleModel}
                        onChange={(e) => setVehicleModel(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                      Nəqliyyat Kateqoriyası:
                    </label>
                    <select
                      value={operativeCategory}
                      onChange={(e) => setOperativeCategory(e.target.value as OperativeCategory)}
                      data-testid="select-category"
                      className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                      <option value="police_bdyp">DİN Polis / BDYP Yol Patrul Xidməti (Göy-Qırmızı)</option>
                      <option value="medical_fhn">Təcili Tibbi Yardım (103) & FHN Yanğınsöndürmə (Göy)</option>
                      <option value="municipal_service">AAYDA Yol Təmiri & Qəza-Evakuator (Sarı/Narıncı)</option>
                      <option value="cash_transit">Zirehli Bank İnkasasiya Xidməti (Sarı)</option>
                      <option value="civilian_unauthorized">Qanunsuz Mülki Avtomobil (Flaşor / Siren Qadağandır)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Sayrışan Mayak Rəngi:
                      </label>
                      <select
                        value={signalColor}
                        onChange={(e) => {
                          const col = e.target.value as SignalColor;
                          setSignalColor(col);
                          setActiveStrobeColor(col);
                        }}
                        data-testid="select-color"
                        className="w-full px-3 py-2 rounded-xl text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="blue_red">Göy və Qırmızı (Polis/BDYP)</option>
                        <option value="blue">Təmiz Göy (Ambulans / FHN)</option>
                        <option value="amber">Sarı / Narıncı (Kommunal / Evakuator)</option>
                        <option value="white_strobe">Ağ / Qarışıq Flaşor (Mülki Qanunsuz)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">
                        Siren Səs Şiddəti: {sirenDecibels} dBA (Norma: ≤124)
                      </label>
                      <input
                        type="range"
                        min={90}
                        max={135}
                        step={1}
                        value={sirenDecibels}
                        onChange={(e) => setSirenDecibels(Number(e.target.value))}
                        disabled={!hasAudioSiren}
                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600 disabled:opacity-40"
                      />
                    </div>
                  </div>

                  {/* Checkbox Toggles */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                    <label className="flex items-center gap-2.5 text-xs text-slate-800 dark:text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasAudioSiren}
                        onChange={(e) => setHasAudioSiren(e.target.checked)}
                        data-testid="checkbox-audio-siren"
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                      />
                      <span>Çoxavazlı elektron səs siqnalı (Siren / Horn) quraşdırılıb</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-slate-800 dark:text-slate-200 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasOfficialDinPermit}
                        onChange={(e) => setHasOfficialDinPermit(e.target.checked)}
                        data-testid="checkbox-din-permit"
                        className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-600 focus:ring-blue-500"
                      />
                      <span>Rəsmi DİN-OPR icazə vəsiqəsi və Texpasportda qeyd mövcuddur</span>
                    </label>

                    <label className="flex items-center gap-2.5 text-xs text-red-600 dark:text-red-400 cursor-pointer font-medium">
                      <input
                        type="checkbox"
                        checked={isStrobeHiddenUnderGrille}
                        onChange={(e) => setIsStrobeHiddenUnderGrille(e.target.checked)}
                        data-testid="checkbox-grille-strobe"
                        className="w-4 h-4 rounded text-red-600 border-slate-300 dark:border-slate-600 focus:ring-red-500"
                      />
                      <span>Radiator barmaqlığı arxasında gizli LED flaşor / stroboskop blokları var</span>
                    </label>
                  </div>
                </div>

                {/* Audit Result Card */}
                <div className="lg:col-span-5 flex flex-col justify-between p-5 rounded-2xl border transition-all shadow-sm bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Dövlət Yol Polisi İmtahan Nəticəsi
                      </span>
                      {auditResult.isCompliant ? (
                        <span
                          data-testid="badge-compliant"
                          className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1 border border-emerald-300/40"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Tam Qanunidir
                        </span>
                      ) : (
                        <span
                          data-testid="badge-prohibited"
                          className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1 border border-rose-300/40"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          {auditResult.legalityLevel === 'prohibited_civilian'
                            ? 'Qanunsuz Quraşdırma'
                            : 'Uyğunsuzluq'}
                        </span>
                      )}
                    </div>

                    <div>
                      <h4
                        data-testid="audit-result-title"
                        className="text-base font-bold text-slate-900 dark:text-white"
                      >
                        {auditResult.statusTitleAz}
                      </h4>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {auditResult.statusDescriptionAz}
                      </p>
                    </div>

                    {/* Sanction Metrics */}
                    <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                        <div className="text-[11px] text-slate-500">İXM Cərimə Məbləği:</div>
                        <div
                          data-testid="fine-amount"
                          className={`text-lg font-black ${
                            auditResult.fineAmountAzn > 0
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {auditResult.fineAmountAzn > 0 ? `${auditResult.fineAmountAzn} ₼` : '0 ₼ (Yoxdur)'}
                        </div>
                      </div>

                      <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl">
                        <div className="text-[11px] text-slate-500">Avadanlığın Müsadirəsi:</div>
                        <div
                          data-testid="confiscation-risk"
                          className={`text-sm font-bold ${
                            auditResult.confiscationRisk
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {auditResult.confiscationRisk ? 'Məcburi Müsadirə' : 'Təhlükə Yoxdur'}
                        </div>
                      </div>
                    </div>

                    {auditResult.immediateImpoundRisk && (
                      <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300/40 flex items-start gap-2 text-xs text-amber-800 dark:text-amber-300">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                        <span>
                          <strong>İXM Maddə 96.1.4:</strong> Xüsusi səs və işıq cihazları sökülənədək
                          avtomobil müvəqqəti mühafizə olunan cərimə meydançasına göndərilir.
                        </span>
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        Tətbiq Edilən Qanun Maddələri:
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {auditResult.applicableArticles.map((art, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-mono"
                          >
                            {art}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2">
                    <button
                      onClick={handleGeneratePermit}
                      data-testid="btn-generate-permit"
                      className="flex-1 py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <FileCheck2 className="w-4 h-4" />
                      DİN İcazəsi Hazırla
                    </button>
                    <button
                      onClick={() => setActiveTab('simulator')}
                      className="py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                    >
                      <Radio className="w-4 h-4" />
                      Canlı Sınaq
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE BEACON & SIREN SIMULATOR */}
          {activeTab === 'simulator' && (
            <div className="space-y-6">
              {/* STROBE LIGHT BAR VISUALIZER */}
              <div className="p-6 rounded-2xl bg-slate-950 text-white border border-slate-800 shadow-xl flex flex-col items-center justify-center space-y-4">
                <div className="text-xs font-mono text-slate-400 uppercase tracking-widest flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  LED Sayrışan Mayak Blok Simulyatoru (Strobe Lightbar)
                </div>

                {/* Strobe Bar Container */}
                <div
                  data-testid="strobe-lightbar-container"
                  className="w-full max-w-xl h-24 rounded-2xl bg-slate-900 border-2 border-slate-700 p-2 flex items-center justify-between gap-2 shadow-2xl relative overflow-hidden"
                >
                  {/* Left Strobe Pods */}
                  <div className="flex-1 h-full flex gap-1">
                    {[0, 1, 2].map((i) => {
                      const isLeftActive =
                        activeStrobeColor === 'blue_red'
                          ? strobeFlashState < 2
                          : activeStrobeColor === 'blue'
                          ? strobeFlashState % 2 === 0
                          : activeStrobeColor === 'amber'
                          ? strobeFlashState % 2 === 0
                          : strobeFlashState === 0;

                      let colorClass = 'bg-slate-800 border-slate-700';
                      if (isLeftActive) {
                        if (activeStrobeColor === 'blue_red' || activeStrobeColor === 'blue') {
                          colorClass =
                            'bg-blue-500 border-blue-300 shadow-[0_0_30px_rgba(59,130,246,0.9)] animate-pulse';
                        } else if (activeStrobeColor === 'amber') {
                          colorClass =
                            'bg-amber-500 border-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.9)] animate-pulse';
                        } else {
                          colorClass =
                            'bg-white border-slate-200 shadow-[0_0_30px_rgba(255,255,255,0.9)] animate-pulse';
                        }
                      }

                      return (
                        <div
                          key={`left-${i}`}
                          className={`flex-1 rounded-xl border transition-all duration-75 ${colorClass}`}
                        />
                      );
                    })}
                  </div>

                  {/* Center Speaker Grille */}
                  <div className="w-16 h-full rounded-xl bg-slate-800/90 border border-slate-700 flex flex-col items-center justify-center gap-1 px-1">
                    <div className="w-full h-1 bg-slate-700 rounded-full" />
                    <div className="w-full h-1 bg-slate-700 rounded-full" />
                    <div className="w-full h-1 bg-slate-700 rounded-full" />
                    <Siren className="w-4 h-4 text-slate-500 mt-1" />
                  </div>

                  {/* Right Strobe Pods */}
                  <div className="flex-1 h-full flex gap-1">
                    {[0, 1, 2].map((i) => {
                      const isRightActive =
                        activeStrobeColor === 'blue_red'
                          ? strobeFlashState >= 2
                          : activeStrobeColor === 'blue'
                          ? strobeFlashState % 2 !== 0
                          : activeStrobeColor === 'amber'
                          ? strobeFlashState % 2 !== 0
                          : strobeFlashState === 2;

                      let colorClass = 'bg-slate-800 border-slate-700';
                      if (isRightActive) {
                        if (activeStrobeColor === 'blue_red') {
                          colorClass =
                            'bg-red-500 border-red-300 shadow-[0_0_30px_rgba(239,68,68,0.9)] animate-pulse';
                        } else if (activeStrobeColor === 'blue') {
                          colorClass =
                            'bg-blue-500 border-blue-300 shadow-[0_0_30px_rgba(59,130,246,0.9)] animate-pulse';
                        } else if (activeStrobeColor === 'amber') {
                          colorClass =
                            'bg-amber-500 border-amber-300 shadow-[0_0_30px_rgba(245,158,11,0.9)] animate-pulse';
                        } else {
                          colorClass =
                            'bg-white border-slate-200 shadow-[0_0_30px_rgba(255,255,255,0.9)] animate-pulse';
                        }
                      }

                      return (
                        <div
                          key={`right-${i}`}
                          className={`flex-1 rounded-xl border transition-all duration-75 ${colorClass}`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Strobe Color Selector */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <button
                    onClick={() => setActiveStrobeColor('blue_red')}
                    data-testid="color-btn-blue_red"
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      activeStrobeColor === 'blue_red'
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    Göy-Qırmızı (Polis)
                  </button>
                  <button
                    onClick={() => setActiveStrobeColor('blue')}
                    data-testid="color-btn-blue"
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      activeStrobeColor === 'blue'
                        ? 'bg-blue-600 text-white border-blue-400 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    Mavi (103 & FHN)
                  </button>
                  <button
                    onClick={() => setActiveStrobeColor('amber')}
                    data-testid="color-btn-amber"
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      activeStrobeColor === 'amber'
                        ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    Sarı (AAYDA / Evakuator)
                  </button>
                  <button
                    onClick={() => setActiveStrobeColor('white_strobe')}
                    data-testid="color-btn-white"
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      activeStrobeColor === 'white_strobe'
                        ? 'bg-white text-slate-900 border-slate-300 shadow-md'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    Ağ Flaşor (Mülki Qadağan)
                  </button>
                </div>
              </div>

              {/* SYNTHETIC SIREN AUDIO CONTROLLER */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-5 h-5 text-blue-600" />
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                      Elektron Siren Səs Sintezatoru (Web Audio API)
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setIsMuted(!isMuted)}
                      className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                      aria-label={isMuted ? 'Səsi Aç' : 'Səsi Kəs'}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4 text-blue-500" />}
                    </button>

                    <div className="flex items-center gap-2 w-32">
                      <span className="text-[10px] text-slate-500">Səs:</span>
                      <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.05}
                        value={volume}
                        onChange={(e) => setVolume(Number(e.target.value))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Tone Buttons */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {(['wail', 'yelp', 'hi_lo', 'horn', 'off'] as SirenTone[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => playTone(t)}
                      data-testid={`tone-btn-${t}`}
                      className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center justify-center gap-1.5 transition-all ${
                        activeTone === t
                          ? t === 'off'
                            ? 'bg-slate-200 text-slate-800 border-slate-400 dark:bg-slate-700 dark:text-white'
                            : 'bg-blue-600 text-white border-blue-500 shadow-md animate-pulse'
                          : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {t === 'wail' && 'WAIL (Yavaş)'}
                      {t === 'yelp' && 'YELP (Sürətli)'}
                      {t === 'hi_lo' && 'HI-LO (Avropa)'}
                      {t === 'horn' && 'HORN (Kryakalka)'}
                      {t === 'off' && 'SÖNDÜR (OFF)'}
                      <span className="text-[10px] font-normal opacity-80">
                        {t === 'off' ? 'Səssiz rejim' : `${TONE_CONFIGS[t]?.baseFreq || 0} Hz`}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Active tone details */}
                {activeTone !== 'off' && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 rounded-xl text-xs text-blue-900 dark:text-blue-200 flex items-center justify-between">
                    <div>
                      <strong>Aktiv Siqnal Rejimi:</strong> {TONE_CONFIGS[activeTone].descriptionAz}
                    </div>
                    <div className="text-[11px] font-mono font-bold text-blue-700 dark:text-blue-300">
                      Ölçülən: ~{sirenDecibels} dBA @ 2m
                    </div>
                  </div>
                )}
              </div>

              {/* HARDWARE SPECIFICATIONS TABLE */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  DİN & AZS Akkreditasiyalı Siren Modelləri
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {MOCK_SIREN_HARDWARE.map((hw) => (
                    <div
                      key={hw.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/80 space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-slate-900 dark:text-white">
                          {hw.modelName}
                        </span>
                        {hw.approvedByAZS ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-semibold">
                            AZS Təsdiqli
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-semibold">
                            Qadağandır
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500">{hw.manufacturer}</div>
                      <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-700">
                        <span>Güc: {hw.maxOutputWatts}W</span>
                        <span className="font-mono font-bold">{hw.decibelRating} dBA</span>
                      </div>
                      <div className="text-[11px] text-slate-500 leading-tight">{hw.notesAz}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: RIGHT OF WAY & YIELDING SCENARIOS */}
          {activeTab === 'scenarios' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Scenario List */}
                <div className="lg:col-span-6 space-y-3">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
                    Yol Hərəkəti Vəziyyətləri (YHQ Maddə 48 & İXM 327.3)
                  </label>
                  {MOCK_YIELDING_SCENARIOS.map((sc) => (
                    <button
                      key={sc.id}
                      onClick={() => setSelectedScenarioId(sc.id)}
                      data-testid={`scenario-btn-${sc.id}`}
                      className={`w-full text-left p-3.5 rounded-2xl border text-xs transition-all space-y-1 ${
                        selectedScenarioId === sc.id
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-900/30 text-blue-900 dark:text-blue-100 font-semibold shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-sm text-slate-900 dark:text-white flex items-center justify-between">
                        <span>{sc.titleAz}</span>
                        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Operativ Nəqliyyat: {sc.operativeVehicleType}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Scenario Details & Sanction Card */}
                <div className="lg:col-span-6 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex flex-col justify-between space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      <Sliders className="w-4 h-4" />
                      Qayda və Sürücü Davranış Tələbi
                    </div>

                    <h4 className="text-base font-bold text-slate-900 dark:text-white">
                      {selectedScenario.titleAz}
                    </h4>

                    <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
                      <div className="text-[11px] font-semibold text-slate-500">Məcburi Sürücü Hərəkəti:</div>
                      <div className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                        {selectedScenario.civilianActionRequiredAz}
                      </div>
                    </div>

                    {/* Yield Toggle */}
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                      <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        Sürücü Yol Verdimi?
                      </span>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setCivilianYielded(true)}
                          data-testid="btn-yield-yes"
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                            civilianYielded
                              ? 'bg-emerald-600 text-white border-emerald-500'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300'
                          }`}
                        >
                          Bəli, Dəhliz Açıldı
                        </button>
                        <button
                          onClick={() => setCivilianYielded(false)}
                          data-testid="btn-yield-no"
                          className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${
                            !civilianYielded
                              ? 'bg-rose-600 text-white border-rose-500'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300'
                          }`}
                        >
                          Xeyr, Maneə Yaradıldı
                        </button>
                      </div>
                    </div>

                    {/* Liability Metrics */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-[11px] text-slate-500">Məsuliyyət Cəriməsi:</div>
                        <div
                          data-testid="scenario-fine"
                          className={`text-xl font-black ${
                            yieldingSanction.fineAzn > 0 ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {yieldingSanction.fineAzn > 0 ? `${yieldingSanction.fineAzn} ₼` : '0 ₼'}
                        </div>
                      </div>

                      <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                        <div className="text-[11px] text-slate-500">Cərimə Balı:</div>
                        <div
                          data-testid="scenario-points"
                          className={`text-xl font-black ${
                            yieldingSanction.penaltyPoints > 0 ? 'text-rose-600' : 'text-emerald-600'
                          }`}
                        >
                          {yieldingSanction.penaltyPoints > 0
                            ? `${yieldingSanction.penaltyPoints} Bal`
                            : '0 Bal'}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-600 dark:text-slate-300">
                      <strong>Hüquqi Əsas:</strong> {yieldingSanction.article} — {yieldingSanction.descriptionAz}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ACCREDITED LABORATORIES & SERVICE PACKAGES */}
          {activeTab === 'centers' && (
            <div className="space-y-6">
              {/* Packages */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  DİN & AZS Xüsusi İcazə və Akustika Xidmət Paketləri
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {MOCK_DIN_PACKAGES.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex flex-col justify-between space-y-3"
                    >
                      <div className="space-y-1">
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {pkg.titleAz}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          {pkg.descriptionAz}
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                        <span className="text-xs text-slate-500">Müddət: {pkg.durationAz}</span>
                        <span className="text-base font-bold text-blue-600 dark:text-blue-400">
                          {pkg.feeAzn} ₼
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Laboratories Radar */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Dövlət İmtahan & Akustik Sınaq Məntəqələri
                </h4>

                {bookingSuccessMsg && (
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300/40 rounded-xl text-xs text-emerald-800 dark:text-emerald-200 flex items-center justify-between">
                    <span>{bookingSuccessMsg}</span>
                    <button
                      onClick={() => setBookingSuccessMsg(null)}
                      className="text-emerald-700 font-bold"
                    >
                      ✕
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {MOCK_DIN_LABORATORIES.map((lab) => (
                    <div
                      key={lab.id}
                      className="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {lab.nameAz}
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-semibold shrink-0">
                          {lab.city}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 dark:text-slate-300">{lab.addressAz}</div>
                      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                        <span>Tel: {lab.phone}</span>
                        <span>{lab.hoursAz}</span>
                      </div>
                      <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-700">
                        <div className="flex gap-2 text-[10px]">
                          {lab.hasAcousticChamber && (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              ✓ Akustik Kamera
                            </span>
                          )}
                          {lab.hasPhotometricLab && (
                            <span className="text-blue-600 dark:text-blue-400 font-semibold">
                              ✓ İşıq Lüxmetr
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            setBookingSuccessMsg(
                              `«${lab.nameAz}» məntəqəsinə baxış və sınaq növbəsi təsdiqləndi. SMS göndərildi.`
                            )
                          }
                          data-testid={`btn-book-${lab.id}`}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-all"
                        >
                          Növbə Yazıl
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL DIN-OPR-2026 CERTIFICATE */}
          {activeTab === 'permit' && (
            <div className="space-y-6">
              {/* Search & Filter bar for permits */}
              <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchPermitQuery}
                    onChange={(e) => setSearchPermitQuery(e.target.value)}
                    placeholder="Qeydiyyat nömrəsi və ya nömrəni axtar..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => handleCopyCode(activePermit.permitNumber)}
                    className="flex-1 sm:flex-none py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedCode ? 'Kopyalandı!' : 'İcazə Nömrəsini Kopyala'}
                  </button>
                  <button
                    onClick={handlePrint}
                    className="flex-1 sm:flex-none py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    Çap Et
                  </button>
                </div>
              </div>

              {/* Certificate Canvas */}
              <div
                data-testid="official-din-permit-card"
                className="p-6 sm:p-8 rounded-3xl bg-gradient-to-b from-slate-50 to-white dark:from-slate-900 dark:to-slate-950 border-2 border-indigo-500/30 shadow-2xl relative overflow-hidden"
              >
                {/* Background Watermark Coat of Arms */}
                <div className="absolute right-4 top-4 text-slate-200/20 dark:text-slate-700/10 pointer-events-none font-black text-8xl select-none">
                  DİN
                </div>

                <div className="space-y-6 relative z-10">
                  {/* Certificate Top Header */}
                  <div className="border-b-2 border-indigo-900/30 dark:border-indigo-400/30 pb-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-indigo-900 text-white flex items-center justify-center shadow-md font-bold text-lg border border-indigo-500">
                        DİN
                      </div>
                      <div>
                        <div className="text-xs uppercase font-extrabold tracking-wider text-indigo-700 dark:text-indigo-400">
                          Azərbaycan Respublikası Daxili İşlər Nazirliyi
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white">
                          XÜSUSİ SƏS VƏ SAYRIŞAN İŞIQ SİQNALI İCAZƏ VƏRƏQƏSİ
                        </h3>
                        <div className="text-xs font-mono text-slate-500">
                          Qeydiyyat Kodu: {activePermit.permitNumber}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
                        {activePermit.hologramUid}
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 justify-center sm:justify-end">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Rəsmi DİN Reyestrində Aktivdir
                      </div>
                    </div>
                  </div>

                  {/* Certificate Grid Data */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500">Dövlət Qeydiyyat Nişanı:</span>
                      <div className="font-mono font-bold text-sm text-slate-900 dark:text-white mt-0.5">
                        {activePermit.vehiclePlate}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500">Nəqliyyat Modeli:</span>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                        {activePermit.vehicleModel}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500">VIN Şassi Kodu:</span>
                      <div className="font-mono font-bold text-slate-900 dark:text-white mt-0.5">
                        {activePermit.vin}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500">Kateqoriya:</span>
                      <div className="font-bold text-indigo-600 dark:text-indigo-400 mt-0.5 uppercase">
                        {activePermit.category}
                      </div>
                    </div>

                    <div className="col-span-2">
                      <span className="text-slate-500">Aid Olduğu Dövlət Orqanı / Qurum:</span>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                        {activePermit.agencyNameAz}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500">İcazəli Mayak Rəngi:</span>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5 uppercase">
                        {activePermit.authorizedColors.join(' + ')}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500">Maksimal Səs Şiddəti:</span>
                      <div className="font-bold font-mono text-slate-900 dark:text-white mt-0.5">
                        {activePermit.maxSoundDecibels} dBA @ 2m
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500">Verilmə Tarixi:</span>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                        {activePermit.issueDate}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500">Etibarlılıq Müddəti:</span>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                        {activePermit.expiryDate} (2 İl)
                      </div>
                    </div>

                    <div className="col-span-2">
                      <span className="text-slate-500">Təsdiq Edən Rəsmi Şəxs:</span>
                      <div className="font-bold text-slate-900 dark:text-white mt-0.5">
                        {activePermit.chiefInspectorAz}
                      </div>
                    </div>
                  </div>

                  {/* QR Security Strip & Legal Footnote */}
                  <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 bg-slate-900 p-1.5 rounded-xl border border-slate-700 flex items-center justify-center shrink-0">
                        {/* QR Code Visual Simulation */}
                        <div className="grid grid-cols-4 gap-0.5 w-full h-full">
                          {Array.from({ length: 16 }).map((_, i) => (
                            <div
                              key={i}
                              className={`${
                                (i * 7 + 3) % 2 === 0 ? 'bg-white' : 'bg-transparent'
                              } rounded-[1px]`}
                            />
                          ))}
                        </div>
                      </div>
                      <div className="space-y-0.5 text-[11px]">
                        <div className="font-mono font-bold text-slate-700 dark:text-slate-300">
                          {activePermit.securityHash}
                        </div>
                        <div>DİN AsanPay & YPX Elektron Məlumat Şəbəkəsi İnteqrasiyası</div>
                      </div>
                    </div>

                    <div className="text-[11px] text-right text-slate-400 max-w-sm">
                      Bu sənəd «Yol hərəkəti haqqında» Qanunun 48-ci maddəsinə uyğun olaraq xüsusi səs və
                      sayrışan işıq cihazlarının qanuniliyini təsdiq edir.
                    </div>
                  </div>
                </div>
              </div>

              {/* Other sample permits */}
              {filteredPermits.length > 1 && (
                <div className="space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Qeydiyyatda Olan Digər Xüsusi İcazələr
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {filteredPermits.map((p) => (
                      <button
                        key={p.permitNumber}
                        onClick={() => setActivePermit(p)}
                        className={`text-left p-3 rounded-xl border text-xs transition-all ${
                          activePermit.permitNumber === p.permitNumber
                            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold'
                            : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span>{p.vehiclePlate}</span>
                          <span className="font-mono text-[10px] opacity-75">{p.permitNumber}</span>
                        </div>
                        <div className="text-[11px] truncate opacity-80 mt-1">{p.agencyNameAz}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-blue-600" />
            <span>Azərbaycan Respublikası DİN BDYP və Standartlaşdırma İnstitutu (AZS)</span>
          </div>
          <button
            onClick={onClose}
            data-testid="footer-close-btn"
            className="py-1.5 px-4 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-semibold transition-all"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};
