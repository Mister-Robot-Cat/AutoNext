import React, { useState } from 'react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import { formatPrice, TRANSLATIONS } from '../utils/i18n';
import { FairPriceBadge } from './FairPriceBadge';
import { 
  X, 
  Phone, 
  MessageCircle, 
  ShieldCheck, 
  Calendar, 
  Gauge, 
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
  FileCheck
} from 'lucide-react';

interface CarDetailModalProps {
  vehicle: Vehicle | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
  onOpenLoanForCar: (vehicle: Vehicle) => void;
  onOpenVinHistory: (vehicle: Vehicle) => void;
}

export const CarDetailModal: React.FC<CarDetailModalProps> = ({
  vehicle,
  currency,
  lang,
  onClose,
  onOpenLoanForCar,
  onOpenVinHistory,
}) => {
  if (!vehicle) return null;
  const t = TRANSLATIONS[lang];

  const [activeImage, setActiveImage] = useState(0);
  const [selectedDamagePart, setSelectedDamagePart] = useState<string | null>(null);

  const damagePartDetails = vehicle.damageReport.find((p) => p.partId === selectedDamagePart);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
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
            <p className="text-xs text-slate-400 mt-0.5">
              VIN: <span className="font-mono text-slate-300 font-semibold">{vehicle.vin}</span> • {vehicle.city} • Elan #{vehicle.id}
            </p>
          </div>

          <div className="flex items-center gap-2">
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
              <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800">
                <img
                  src={vehicle.images[activeImage] || vehicle.images[0]}
                  alt={vehicle.title}
                  className="w-full h-full object-cover"
                />

                {vehicle.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setActiveImage((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length)}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setActiveImage((prev) => (prev + 1) % vehicle.images.length)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-slate-950/70 hover:bg-slate-900 text-white"
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
                <div className="p-3 rounded-xl bg-blue-950/30 border border-blue-800/40 text-xs text-blue-200 flex items-start gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-emerald-400">Bazar Analitikası: </span>
                    Bakı üzrə orta qiymət {formatPrice(vehicle.valuation.avgMarketPriceAzn, currency)} təşkil edir.
                    Bu avtomobil bazardan <strong>{Math.abs(vehicle.valuation.percentageDiff)}%</strong> sərfəlidir.
                  </div>
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
              </div>

              {/* Seller Information */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-lg">
                      {vehicle.seller.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{vehicle.seller.name}</h4>
                      <p className="text-xs text-slate-400">
                        {vehicle.seller.type === 'official_dealer'
                          ? 'Rəsmi Diler'
                          : vehicle.seller.type === 'autocenter'
                          ? 'Avtosalon'
                          : 'Şəxsi satıcı'} • {vehicle.seller.memberSinceYear}-ci ildən
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-xs font-bold text-amber-400">★ {vehicle.seller.rating}</div>
                    <span className="text-[10px] text-slate-500">{vehicle.seller.reviewsCount} rəy</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:${vehicle.seller.phone}`}
                    className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-all shadow-lg shadow-blue-600/20"
                  >
                    <Phone className="w-4 h-4" />
                    <span>Zəng et</span>
                  </a>
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
                <Gauge className="w-4 h-4 text-emerald-400" />
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
                <Gauge className="w-4 h-4 text-purple-400" />
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
