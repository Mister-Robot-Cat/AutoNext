import React, { useState, useEffect, useId } from 'react';
import {
  Gavel,
  Car,
  Search,
  ShieldCheck,
  FileText,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MapPin,
  DollarSign,
  Calculator,
  Printer,
  Copy,
  Check,
  Filter,
  ArrowRight,
  User,
  Phone,
  X,
  Award,
  Calendar,
  Sparkles,
} from 'lucide-react';
import {
  AuctionLot,
  AuctionLotCategory,
  AuctionCurrency,
  AuctionWinnerProtocol,
  calculateAuctionFinancials,
  validateBid,
  generateBotCounterBid,
  formatAuctionMoney,
  generateAuctionWinnerProtocol,
} from '../utils/vehicleAuction';
import {
  MOCK_AUCTION_LOTS,
  MOCK_INSPECTION_SITES,
  MOCK_VERIFIABLE_PROTOCOLS,
} from '../data/mockVehicleAuctionData';

interface VehicleAuctionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialLotId?: string;
  userFullName?: string;
  userFin?: string;
}

export const VehicleAuctionModal: React.FC<VehicleAuctionModalProps> = ({
  isOpen,
  onClose,
  initialLotId,
  userFullName = 'Rəşad Namiq oğlu Əliyev',
  userFin = '7KA89B2',
}) => {
  const [activeTab, setActiveTab] = useState<
    'live' | 'catalog' | 'calculator' | 'protocol' | 'sites'
  >('live');

  // Search & Filter state
  const [lots, setLots] = useState<AuctionLot[]>(MOCK_AUCTION_LOTS);
  const [selectedLotId, setSelectedLotId] = useState<string>(
    initialLotId || MOCK_AUCTION_LOTS[0].id
  );
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Live Auction State
  const selectedLot = lots.find((l) => l.id === selectedLotId) || lots[0];
  const [customBidInput, setCustomBidInput] = useState<string>('');
  const [bidError, setBidError] = useState<string | null>(null);
  const [countdownSeconds, setCountdownSeconds] = useState<number>(35);
  const [isHammerActive, setIsHammerActive] = useState<boolean>(false);
  const [lastBidderIsUser, setLastBidderIsUser] = useState<boolean>(false);
  const [isBotThinking, setIsBotThinking] = useState<boolean>(false);

  // Financial Calculator State
  const [calcStartingPrice, setCalcStartingPrice] = useState<number>(selectedLot.startingPriceAZN);
  const [calcTargetBid, setCalcTargetBid] = useState<number>(selectedLot.currentBidAZN);
  const [calcCurrency, setCalcCurrency] = useState<AuctionCurrency>('AZN');

  // Protocol State
  const [activeProtocol, setActiveProtocol] = useState<AuctionWinnerProtocol | null>(null);
  const [verifySearchInput, setVerifySearchInput] = useState<string>('');
  const [verifyResult, setVerifyResult] = useState<AuctionWinnerProtocol | null>(null);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  // Unique accessible IDs
  const searchInputId = useId();
  const categoryFilterId = useId();
  const customBidInputId = useId();
  const calcStartingPriceId = useId();
  const calcTargetBidId = useId();
  const verifySearchInputId = useId();

  // Reset or update lot when initialLotId changes
  useEffect(() => {
    if (initialLotId) {
      setSelectedLotId(initialLotId);
      const found = lots.find((l) => l.id === initialLotId);
      if (found) {
        setCalcStartingPrice(found.startingPriceAZN);
        setCalcTargetBid(found.currentBidAZN);
      }
    }
  }, [initialLotId, lots]);

  // Sync calculator with active lot
  useEffect(() => {
    setCalcStartingPrice(selectedLot.startingPriceAZN);
    setCalcTargetBid(selectedLot.currentBidAZN);
    setCustomBidInput((selectedLot.currentBidAZN + selectedLot.minStepAZN).toString());
    setBidError(null);
  }, [selectedLotId]);

  // Live timer countdown
  useEffect(() => {
    if (!isOpen || activeTab !== 'live') return;

    const timer = setInterval(() => {
      setCountdownSeconds((prev) => {
        if (prev <= 1) {
          return 30; // reset loop for simulation realism
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, activeTab]);

  if (!isOpen) return null;

  // Filtered lots for Catalog tab
  const filteredLots = lots.filter((lot) => {
    const matchesCat = categoryFilter === 'all' || lot.category === categoryFilter;
    const matchesQuery =
      searchQuery.trim() === '' ||
      lot.titleAz.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.lotNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.plateNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  // Handle user placing a bid in Live Auction tab
  const handlePlaceBid = (bidAmount: number) => {
    const validation = validateBid(bidAmount, selectedLot.currentBidAZN, selectedLot.minStepAZN);
    if (!validation.isValid) {
      setBidError(validation.errorAz || 'Xəta baş verdi');
      return;
    }

    setBidError(null);
    setIsHammerActive(true);
    setTimeout(() => setIsHammerActive(false), 500);

    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];

    const newBid = {
      id: `bid-user-${Date.now()}`,
      bidderId: 'user-current',
      bidderName: `${userFullName} (Siz)`,
      amountAZN: bidAmount,
      timestamp: timeStr,
      isUser: true,
    };

    const updatedLots = lots.map((l) => {
      if (l.id === selectedLot.id) {
        return {
          ...l,
          currentBidAZN: bidAmount,
          bidsHistory: [newBid, ...l.bidsHistory],
        };
      }
      return l;
    });

    setLots(updatedLots);
    setLastBidderIsUser(true);
    setCountdownSeconds(30);
    setCustomBidInput((bidAmount + selectedLot.minStepAZN).toString());

    // Trigger simulated bot counter-bid after 1.8s
    setIsBotThinking(true);
    setTimeout(() => {
      setIsBotThinking(false);
      const botResponse = generateBotCounterBid(
        bidAmount,
        selectedLot.minStepAZN,
        selectedLot.startingPriceAZN * 1.5 // 50% max lot appreciation ceiling
      );

      if (botResponse.shouldBid) {
        const botBid = {
          id: `bid-bot-${Date.now()}`,
          bidderId: `bot-${Date.now()}`,
          bidderName: botResponse.botName,
          amountAZN: botResponse.nextBidAZN,
          timestamp: new Date().toTimeString().split(' ')[0],
          isUser: false,
        };

        setLots((currentLots) =>
          currentLots.map((l) => {
            if (l.id === selectedLot.id) {
              return {
                ...l,
                currentBidAZN: botResponse.nextBidAZN,
                bidsHistory: [botBid, ...l.bidsHistory],
              };
            }
            return l;
          })
        );
        setLastBidderIsUser(false);
        setCountdownSeconds(30);
        setCustomBidInput((botResponse.nextBidAZN + selectedLot.minStepAZN).toString());
      }
    }, 1800);
  };

  // Finalize / Award lot to user
  const handleFinalizeAndAward = () => {
    const protocol = generateAuctionWinnerProtocol(
      selectedLot,
      userFullName,
      userFin,
      '+994 (50) 412-89-90',
      selectedLot.currentBidAZN
    );

    setActiveProtocol(protocol);
    setActiveTab('protocol');
  };

  // Financial calculations
  const financials = calculateAuctionFinancials(calcStartingPrice, calcTargetBid, calcCurrency);

  // Copy protocol
  const handleCopyProtocol = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Handle Protocol Registry search
  const handleVerifySearch = () => {
    const trimmed = verifySearchInput.trim().toUpperCase();
    if (activeProtocol && activeProtocol.protocolNumber.toUpperCase() === trimmed) {
      setVerifyResult(activeProtocol);
    } else if (MOCK_VERIFIABLE_PROTOCOLS[trimmed]) {
      setVerifyResult(MOCK_VERIFIABLE_PROTOCOLS[trimmed]);
    } else {
      setVerifyResult(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="auction-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto"
    >
      <div className="relative w-full max-w-5xl bg-slate-900 border border-amber-500/30 rounded-2xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Gavel className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  e-herrac.emlak.gov.az
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Rəsmi Dövlət Hərrac Portalı
                </span>
              </div>
              <h2 id="auction-modal-title" className="text-xl font-bold text-white tracking-wide">
                Dövlət Əmlakı və Müsadirə Olunmuş Nəqliyyat Hərracı
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-colors"
            title="Bağla"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 bg-slate-950/50 px-6 gap-2 overflow-x-auto py-2">
          <button
            onClick={() => setActiveTab('live')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 ${
              activeTab === 'live'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Gavel className="w-4 h-4 text-amber-400" />
            Canlı Hərrac Zalı
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 ${
              activeTab === 'catalog'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Car className="w-4 h-4" />
            Hərrac Kataloqu ({lots.length})
          </button>

          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 ${
              activeTab === 'calculator'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Calculator className="w-4 h-4" />
            Maliyyə & Beh Hesablayıcısı
          </button>

          <button
            onClick={() => setActiveTab('protocol')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 ${
              activeTab === 'protocol'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            Hərrac Qalibi Protokolu
            {activeProtocol && (
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('sites')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all shrink-0 ${
              activeTab === 'sites'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <MapPin className="w-4 h-4" />
            Baxış Meydançaları & Qaydalar
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-900/60">
          {/* TAB 1: LIVE AUCTION SIMULATOR */}
          {activeTab === 'live' && (
            <div className="space-y-6">
              {/* Lot selector bar */}
              <div className="flex items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700/60">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Canlı Lot Seçimi:</span>
                  <div className="flex gap-2 flex-wrap">
                    {lots
                      .filter((l) => l.status === 'live')
                      .map((lot) => (
                        <button
                          key={lot.id}
                          onClick={() => setSelectedLotId(lot.id)}
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                            lot.id === selectedLot.id
                              ? 'bg-amber-500 text-slate-950 font-semibold'
                              : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                          }`}
                        >
                          {lot.lotNumber}: {lot.titleAz.split(' ')[0]} {lot.titleAz.split(' ')[1]}
                        </button>
                      ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-700">
                  <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                  <span className="text-xs text-slate-400">Çəkic Vurma Müddəti:</span>
                  <span
                    className={`font-mono text-sm font-bold ${
                      countdownSeconds <= 10 ? 'text-red-400 animate-bounce' : 'text-amber-400'
                    }`}
                  >
                    00:{countdownSeconds.toString().padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Main Auction Stage Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left: Vehicle Card & Telemetry (7 cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="relative rounded-2xl overflow-hidden border border-slate-700 bg-slate-800/40 group">
                    <img
                      src={selectedLot.imageUrl}
                      alt={selectedLot.titleAz}
                      className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 flex gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-500 text-slate-950 shadow-md">
                        {selectedLot.lotNumber}
                      </span>
                      <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-900/80 backdrop-blur-md text-amber-300 border border-amber-500/30">
                        {selectedLot.categoryLabelAz}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-3 right-3 bg-slate-950/80 backdrop-blur-md p-3 rounded-xl border border-slate-700/60 flex items-center justify-between">
                      <div>
                        <div className="text-xs text-slate-400">Dövlət Qeydiyyat Nişanı</div>
                        <div className="font-mono font-bold text-white text-sm">
                          {selectedLot.plateNumber}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-400">Müsadirə Əsası</div>
                        <div className="text-xs text-slate-200 font-medium">
                          {selectedLot.sourceAuthorityAz}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle Details Overview */}
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-3">
                    <h3 className="text-base font-bold text-white">{selectedLot.titleAz}</h3>

                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400 block">Buraxılış İli</span>
                        <span className="font-semibold text-slate-200">{selectedLot.year}</span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400 block">Yürüş</span>
                        <span className="font-semibold text-slate-200">
                          {selectedLot.mileageKm.toLocaleString('az-AZ')} km
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
                        <span className="text-slate-400 block">Vəziyyət Qiyməti</span>
                        <span className="font-semibold text-amber-400">
                          {selectedLot.conditionScore}/10 bal
                        </span>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 bg-amber-500/10 border border-amber-500/20 p-2.5 rounded-lg">
                      <span className="font-semibold text-amber-300 block mb-0.5">
                        Ekspertiza Qeydi:
                      </span>
                      {selectedLot.defectSummaryAz}
                    </div>
                  </div>
                </div>

                {/* Right: Bidding Stand & Live Activity (5 cols) */}
                <div className="lg:col-span-5 flex flex-col space-y-4">
                  {/* Current Bid Display */}
                  <div className="bg-gradient-to-br from-slate-800/90 to-slate-900 p-5 rounded-2xl border border-amber-500/30 text-center relative overflow-hidden">
                    <div className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">
                      Cari Ən Yüksək Təklif
                    </div>
                    <div
                      className={`text-3xl font-extrabold text-amber-400 font-mono tracking-tight transition-transform ${
                        isHammerActive ? 'scale-110' : ''
                      }`}
                    >
                      {formatAuctionMoney(selectedLot.currentBidAZN, 'AZN')}
                    </div>

                    <div className="mt-2 text-xs text-slate-400 flex items-center justify-center gap-3">
                      <span>İlkin qiymət: {formatAuctionMoney(selectedLot.startingPriceAZN, 'AZN')}</span>
                      <span>•</span>
                      <span>Min. addım: +{selectedLot.minStepAZN} AZN</span>
                    </div>

                    {lastBidderIsUser ? (
                      <div className="mt-3 py-1 px-3 bg-emerald-500/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-xs font-semibold inline-flex items-center gap-1.5">
                        <Award className="w-3.5 h-3.5" /> Ən yüksək təklif sizdədir!
                      </div>
                    ) : (
                      <div className="mt-3 py-1 px-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs inline-flex items-center gap-1.5">
                        {isBotThinking ? (
                          <>
                            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                            Digər iştirakçılar qiymət qaldırır...
                          </>
                        ) : (
                          'Təklifinizi göndərin və hərraca qoşulun'
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bidding Action Buttons */}
                  <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-3">
                    <div className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                      <span>Sürətli Təklif Düymələri</span>
                      <span className="text-slate-400 text-[11px]">Depozit: 5% Beh ödənilib</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() =>
                          handlePlaceBid(selectedLot.currentBidAZN + selectedLot.minStepAZN)
                        }
                        className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Gavel className="w-3.5 h-3.5" /> +1 Addım (+{selectedLot.minStepAZN} ₼)
                      </button>

                      <button
                        onClick={() =>
                          handlePlaceBid(selectedLot.currentBidAZN + selectedLot.minStepAZN * 2)
                        }
                        className="py-2.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Gavel className="w-3.5 h-3.5" /> +2 Addım (+{selectedLot.minStepAZN * 2} ₼)
                      </button>
                    </div>

                    {/* Custom Bid Input */}
                    <div className="pt-1">
                      <label htmlFor={customBidInputId} className="sr-only">Xüsusi Məbləğ Daxil Edin</label>
                      <div className="flex gap-2">
                        <input
                          id={customBidInputId}
                          type="number"
                          value={customBidInput}
                          onChange={(e) => setCustomBidInput(e.target.value)}
                          placeholder="Xüsusi məbləğ daxil edin"
                          className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-mono"
                        />
                        <button
                          onClick={() => handlePlaceBid(Number(customBidInput))}
                          className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md transition-all shrink-0"
                        >
                          Təklif Et
                        </button>
                      </div>
                      {bidError && (
                        <div className="text-[11px] text-red-400 mt-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> {bidError}
                        </div>
                      )}
                    </div>

                    {/* Award & Finalize Hammer button */}
                    <div className="pt-2">
                      <button
                        onClick={handleFinalizeAndAward}
                        disabled={!lastBidderIsUser}
                        className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                          lastBidderIsUser
                            ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30 cursor-pointer animate-pulse'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        }`}
                      >
                        <Gavel className="w-4 h-4" />
                        {lastBidderIsUser
                          ? 'Hərracı Tamamla & Protokolu Çap Et (Satıldı!)'
                          : 'Ən yüksək təklif verildikdən sonra protokola keçin'}
                      </button>
                    </div>
                  </div>

                  {/* Live Bids History Feed */}
                  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700/60 flex-1 flex flex-col min-h-[160px]">
                    <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center justify-between">
                      <span>Canlı Təkliflər Lenti</span>
                      <span className="text-[11px] text-slate-400">
                        {selectedLot.bidsHistory.length} təklif qeydə alınıb
                      </span>
                    </div>

                    <div className="space-y-2 overflow-y-auto max-h-40 pr-1 text-xs">
                      {selectedLot.bidsHistory.map((bid) => (
                        <div
                          key={bid.id}
                          className={`flex items-center justify-between p-2 rounded-lg border ${
                            bid.isUser
                              ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                              : 'bg-slate-900/50 border-slate-800 text-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {bid.isUser ? (
                              <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            ) : (
                              <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            )}
                            <span className="font-medium">{bid.bidderName}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold">
                              {formatAuctionMoney(bid.amountAZN, 'AZN')}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {bid.timestamp}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUCTION CATALOG */}
          {activeTab === 'catalog' && (
            <div className="space-y-6">
              {/* Filter and Search Bar */}
              <div className="flex flex-col md:flex-row gap-3 items-center justify-between bg-slate-800/50 p-3 rounded-xl border border-slate-700">
                <div className="relative w-full md:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <label htmlFor={searchInputId} className="sr-only">Hərrac lotlarını axtar</label>
                  <input
                    id={searchInputId}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Marka, model və ya LOT nömrəsi..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="flex gap-2 w-full md:w-auto overflow-x-auto">
                  <label htmlFor={categoryFilterId} className="sr-only">Müsadirə kateqoriyası</label>
                  <select
                    id={categoryFilterId}
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-700 text-xs rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="all">Bütün Kateqoriyalar</option>
                    <option value="state_surplus">Dövlət Balansı</option>
                    <option value="court_enforcement">Məhkəmə İcraçıları</option>
                    <option value="customs_confiscated">Gömrük Müsadirəsi</option>
                    <option value="bank_repossession">Bank Girovu</option>
                  </select>
                </div>
              </div>

              {/* Grid of Lot Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredLots.map((lot) => (
                  <div
                    key={lot.id}
                    className="bg-slate-800/40 border border-slate-700/60 rounded-2xl overflow-hidden hover:border-amber-500/40 transition-all flex flex-col group"
                  >
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={lot.imageUrl}
                        alt={lot.titleAz}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                        <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-amber-500 text-slate-950">
                          {lot.lotNumber}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold text-white ${
                            lot.status === 'live'
                              ? 'bg-red-500'
                              : lot.status === 'upcoming'
                              ? 'bg-blue-600'
                              : 'bg-slate-600'
                          }`}
                        >
                          {lot.status === 'live'
                            ? 'CANLI'
                            : lot.status === 'upcoming'
                            ? 'YAXINLAŞAN'
                            : 'BİTMİŞ'}
                        </span>
                      </div>

                      <div className="absolute bottom-2 right-2 px-2 py-1 bg-slate-900/90 backdrop-blur-md rounded-lg text-[11px] text-amber-300 font-medium border border-slate-700">
                        {lot.year} • {lot.mileageKm.toLocaleString('az-AZ')} km
                      </div>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <div className="text-[11px] text-amber-400 font-semibold mb-0.5">
                          {lot.categoryLabelAz}
                        </div>
                        <h4 className="text-sm font-bold text-white line-clamp-1">{lot.titleAz}</h4>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                          {lot.defectSummaryAz}
                        </p>
                      </div>

                      <div className="pt-2 border-t border-slate-700/50 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">İlkin Qiymət:</span>
                          <span className="font-bold text-white font-mono">
                            {formatAuctionMoney(lot.startingPriceAZN, 'AZN')}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs">
                          <span className="text-slate-400">Beh (5% zəmanət):</span>
                          <span className="font-semibold text-amber-300 font-mono">
                            {formatAuctionMoney(lot.guaranteeDepositAZN, 'AZN')}
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedLotId(lot.id);
                            setActiveTab('live');
                          }}
                          className="w-full mt-2 py-2 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                        >
                          Hərrac Zalına Keç <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FINANCIAL & GUARANTEE DEPOSIT CALCULATOR */}
          {activeTab === 'calculator' && (
            <div className="space-y-6 max-w-4xl mx-auto">
              <div className="text-center space-y-1">
                <h3 className="text-lg font-bold text-white">
                  Dövlət Hərracı Maliyyə & 5% Beh Kalkulyatoru
                </h3>
                <p className="text-xs text-slate-400">
                  AR Nazirlər Kabinetinin Hərrac Qaydalarına və Vergi Məcəlləsinə uyğun rəsmi hesablamalar
                </p>
              </div>

              {/* Calculator Inputs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-slate-800/40 p-5 rounded-2xl border border-slate-700/60">
                <div>
                  <label htmlFor={calcStartingPriceId} className="block text-xs font-semibold text-slate-300 mb-1.5">
                    İlkin Hərrac Qiyməti (AZN)
                  </label>
                  <input
                    id={calcStartingPriceId}
                    type="number"
                    value={calcStartingPrice}
                    onChange={(e) => setCalcStartingPrice(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Lot üzrə elan edilmiş start qiyməti
                  </span>
                </div>

                <div>
                  <label htmlFor={calcTargetBidId} className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Planlaşdırılan Uduş Qiyməti (AZN)
                  </label>
                  <input
                    id={calcTargetBidId}
                    type="number"
                    value={calcTargetBid}
                    onChange={(e) => setCalcTargetBid(Number(e.target.value))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500 font-mono"
                  />
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Hərrac çəkicinin vurulduğu son təklif
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                    Valyuta Seçimi
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['AZN', 'USD', 'EUR'] as AuctionCurrency[]).map((cur) => (
                      <button
                        key={cur}
                        type="button"
                        onClick={() => setCalcCurrency(cur)}
                        className={`py-2 rounded-xl text-xs font-bold transition-colors ${
                          calcCurrency === cur
                            ? 'bg-amber-500 text-slate-950 font-bold'
                            : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {cur}
                      </button>
                    ))}
                  </div>
                  <span className="text-[11px] text-slate-400 mt-1 block">
                    Mərkəzi Bankın rəsmi məzənnəsi ilə
                  </span>
                </div>
              </div>

              {/* Calculated Outputs Cards */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/40 p-4 rounded-xl border border-amber-500/30">
                  <div className="text-xs text-amber-400 font-semibold mb-1">
                    5% Beh (İştirak Zəmanəti)
                  </div>
                  <div className="text-xl font-bold text-white font-mono">
                    {formatAuctionMoney(financials.amountInSelectedCurrency.guaranteeDeposit, calcCurrency)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Hərracdan öncə xəzinəyə ödənilən geri qaytarılan məbləğ
                  </div>
                </div>

                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                  <div className="text-xs text-slate-300 font-semibold mb-1">
                    Platforma Komissiyası (0.5%)
                  </div>
                  <div className="text-xl font-bold text-slate-200 font-mono">
                    {formatAuctionMoney(financials.amountInSelectedCurrency.operatorCommission, calcCurrency)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Əmlak Xidməti rəsmi operator xidmət haqqı
                  </div>
                </div>

                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                  <div className="text-xs text-slate-300 font-semibold mb-1">
                    10 Günlük Qalıq Ödəniş
                  </div>
                  <div className="text-xl font-bold text-slate-200 font-mono">
                    {formatAuctionMoney(financials.amountInSelectedCurrency.remainingBalance, calcCurrency)}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1">
                    Qalib elan edildikdən sonra 10 bank günü ərzində
                  </div>
                </div>

                <div className="bg-gradient-to-br from-amber-500/20 to-slate-900 p-4 rounded-xl border border-amber-500/40">
                  <div className="text-xs text-amber-300 font-bold mb-1">
                    Cəmi Yekun Məbləğ
                  </div>
                  <div className="text-xl font-extrabold text-amber-400 font-mono">
                    {formatAuctionMoney(financials.amountInSelectedCurrency.totalCost, calcCurrency)}
                  </div>
                  <div className="text-[11px] text-slate-300 mt-1">
                    ƏDV və bütün dövlət rüsumları daxil
                  </div>
                </div>
              </div>

              {/* Legal Guidelines Alert */}
              <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl text-xs text-slate-300 space-y-2">
                <div className="font-bold text-amber-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Qalib Şəxsin Hüquqi Öhdəlikləri və Beh Təminatı:
                </div>
                <ul className="list-disc list-inside space-y-1 text-slate-400 text-[11px]">
                  <li>
                    Hərracda uduş əldə etməyən digər iştirakçıların ödədiyi 5% beh məbləği 3 iş günü ərzində bank hesablarına tam geri qaytarılır.
                  </li>
                  <li>
                    Qalib şəxs 10 bank günü ərzində qalıq məbləği ödəməzsə, beh dövlət büdcəsinə keçirilir və nəticələr ləğv edilir.
                  </li>
                  <li>
                    Hərrac Protokolu əsasında BDYP-də texpasport yenilənərkən əvvəlki sahibin bütün bank ipotekaları və cərimə həbsləri avtomatik silinir.
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* TAB 4: OFFICIAL WINNER PROTOCOL & VERIFICATION */}
          {activeTab === 'protocol' && (
            <div className="space-y-6 max-w-3xl mx-auto">
              {/* Protocol Search / Verification Bar */}
              <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="w-full sm:flex-1 relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <label htmlFor={verifySearchInputId} className="sr-only">Hərrac protokol nömrəsi</label>
                  <input
                    id={verifySearchInputId}
                    type="text"
                    value={verifySearchInput}
                    onChange={(e) => setVerifySearchInput(e.target.value)}
                    placeholder="Məsələn: ƏMLAK-HRC-2026-84912"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white uppercase font-mono focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  onClick={handleVerifySearch}
                  className="w-full sm:w-auto px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" /> Vahid Bazada Yoxla
                </button>
              </div>

              {/* Display Protocol: Active or Verified */}
              {(() => {
                const protocolToDisplay = verifyResult || activeProtocol;

                if (!protocolToDisplay) {
                  return (
                    <div className="text-center py-12 bg-slate-800/30 rounded-2xl border border-dashed border-slate-700 p-8">
                      <FileText className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                      <h4 className="text-base font-bold text-white mb-1">
                        Aktiv Hərrac Protokolu Mövcud Deyil
                      </h4>
                      <p className="text-xs text-slate-400 max-w-md mx-auto mb-4">
                        Canlı hərrac zalında qalib elan edildikdə və ya yuxarıdakı axtarış sahəsində mövcud protokol nömrəsi yoxlanıldıqda rəsmi dövlət sənədi burada nümayiş etdiriləcəkdir.
                      </p>
                      <button
                        onClick={() => {
                          setVerifySearchInput('ƏMLAK-HRC-2026-84912');
                          setVerifyResult(MOCK_VERIFIABLE_PROTOCOLS['ƏMLAK-HRC-2026-84912']);
                        }}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5"
                      >
                        Nümunə Protokolu Göstər (ƏMLAK-HRC-2026-84912)
                      </button>
                    </div>
                  );
                }

                return (
                  <div className="bg-slate-950 border-2 border-amber-500/40 rounded-2xl p-6 shadow-2xl relative space-y-5 print:bg-white print:text-black">
                    {/* Official Document Header */}
                    <div className="text-center border-b border-slate-800 pb-4">
                      <div className="flex items-center justify-center gap-2 mb-1">
                        <span className="text-xl">🇦🇿</span>
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                          Azərbaycan Respublikası İqtisadiyyat Nazirliyi
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 font-semibold">
                        Əmlak Məsələləri Dövlət Xidməti • Hərracların Təşkili Mərkəzi
                      </div>
                      <h3 className="text-lg font-black text-white mt-2 tracking-wide">
                        ELEKTRON HƏRRAC QALİBİ QƏRAR PROTOKOLU
                      </h3>
                      <div className="font-mono text-xs text-amber-300 mt-1">
                        № {protocolToDisplay.protocolNumber}
                      </div>
                    </div>

                    {/* Protocol Details Table */}
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Hərrac Lot Nömrəsi:</span>
                        <span className="font-bold text-white font-mono">
                          {protocolToDisplay.lotNumber}
                        </span>
                      </div>

                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Tərtib Tarixi:</span>
                        <span className="font-bold text-white font-mono">
                          {protocolToDisplay.issuedAt}
                        </span>
                      </div>

                      <div className="col-span-2 bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Nəqliyyat Vasitəsi:</span>
                        <span className="font-bold text-white text-sm">
                          {protocolToDisplay.vehicleTitle}
                        </span>
                        <div className="flex gap-4 mt-1 text-[11px] text-slate-300 font-mono">
                          <span>VIN: {protocolToDisplay.vin}</span>
                          <span>DQN: {protocolToDisplay.plateNumber}</span>
                        </div>
                      </div>

                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Hərrac Qalibi:</span>
                        <span className="font-bold text-white">
                          {protocolToDisplay.winnerFullName}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          FİN: {protocolToDisplay.winnerFin}
                        </span>
                      </div>

                      <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                        <span className="text-slate-400 block text-[11px]">Qalib Gələn Qiymət:</span>
                        <span className="font-extrabold text-amber-400 font-mono text-sm">
                          {formatAuctionMoney(protocolToDisplay.winningBidAZN, 'AZN')}
                        </span>
                        <span className="text-[11px] text-emerald-400 block mt-0.5">
                          Beh ödənilib: {formatAuctionMoney(protocolToDisplay.guaranteeDepositPaidAZN, 'AZN')}
                        </span>
                      </div>
                    </div>

                    {/* BDYP Police Instruction Box */}
                    <div className="bg-amber-500/10 border border-amber-500/30 p-3.5 rounded-xl text-[11px] text-amber-200 leading-relaxed">
                      <span className="font-bold block mb-1 text-amber-300 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        BDYP Qeydiyyat-İmtahan Şöbəsi üçün Rəsmi Əsas:
                      </span>
                      {protocolToDisplay.bdypClearanceNoteAz}
                    </div>

                    {/* Security Checksum and QR verification */}
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px]">
                      <div>
                        <div className="text-slate-400">Rəqəmsal İmzalanma Kodu:</div>
                        <div className="font-mono font-bold text-slate-200">
                          {protocolToDisplay.securityChecksum}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleCopyProtocol(protocolToDisplay.protocolNumber)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium flex items-center gap-1 transition-colors"
                        >
                          {isCopied ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" /> Kopyalandı
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" /> Nömrəni Kopyala
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => window.print()}
                          className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-lg flex items-center gap-1 transition-colors"
                        >
                          <Printer className="w-3.5 h-3.5" /> Çap Et
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB 5: PHYSICAL INSPECTION SITES & LEGAL BASIS */}
          {activeTab === 'sites' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-bold text-white mb-1">
                  Rəsmi Baxış Meydançaları və Saxlanma Anbarları
                </h3>
                <p className="text-xs text-slate-400">
                  Hərracdan əvvəl avtomobilləri yerində texniki baxışdan keçirmək üçün rəsmi ünvanlar
                </p>
              </div>

              {/* Sites Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {MOCK_INSPECTION_SITES.map((site) => (
                  <div
                    key={site.id}
                    className="bg-slate-800/40 p-4 rounded-xl border border-slate-700/60 space-y-3"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                          {site.region}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1.5">{site.nameAz}</h4>
                      </div>
                      <span className="text-xs text-slate-400 font-medium">
                        {site.totalLotsCount} lot saxlanılır
                      </span>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-300">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{site.address}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{site.contactPhone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                        <span>{site.visitingHours}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Statutory Legal Foundation Sections */}
              <div className="bg-slate-800/30 p-5 rounded-2xl border border-slate-700/60 space-y-4">
                <h4 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Hərrac Qanunvericiliyi və Alıcı Zəmanətləri
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="font-bold text-amber-300 block mb-1">
                      1. "İcra haqqında" AR Qanunu (Maddə 52):
                    </span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Məhkəmə icraçıları tərəfindən borclar müqabilində müsadirə olunmuş əmlaklar açıq elektron hərracda satıldıqdan sonra əvvəlki sahibin bütün borc tələbləri dayandırılır. Alıcı əmlakı tam təmiz hüquqi statusla əldə edir.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="font-bold text-amber-300 block mb-1">
                      2. Gömrük Məcəlləsi (Maddələr 245-250):
                    </span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Dövlət Gömrük Komitəsi tərəfindən qaçaqmalçılıq və ya rəsmiləşdirilmə müddəti keçmiş mallar dövlət nəfinə müsadirə edildikdən sonra alıcı əlavə gömrük rüsumu və aksiz vergisi ödəmədən texpasport ala bilir.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="font-bold text-amber-300 block mb-1">
                      3. Dövlət Əmlakının Özəlləşdirilməsi:
                    </span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Dövlət qurumlarının balansından çıxarılan nəqliyyat vasitələri Nazirlər Kabinetinin təsdiq etdiyi rəsmi qiymətləndirmə aktı əsasında hərraca çıxarılır və 5% ilkin zəmanət behi tələb olunur.
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <span className="font-bold text-amber-300 block mb-1">
                      4. BDYP Qeydiyyat Sadələşdirilməsi:
                    </span>
                    <p className="text-slate-400 text-[11px] leading-relaxed">
                      Hərrac qalibi protokolunun QR-kodu BDYP-nin "Siqnal" mərkəzi informasiya sistemi ilə inteqrasiya olunub və ASAN Xidmət və ya Qeydiyyat-İmtahan Şöbəsində 30 dəqiqə ərzində yeni texpasport və nömrə təqdim olunur.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Vahid Elektron Hərrac Sistemi Aktivdir</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors"
          >
            Bağla
          </button>
        </div>
      </div>
    </div>
  );
};
