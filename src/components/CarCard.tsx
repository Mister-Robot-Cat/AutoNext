import React, { useState } from 'react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import { formatPrice, TRANSLATIONS } from '../utils/i18n';
import { FairPriceBadge } from './FairPriceBadge';
import { 
  Fuel, 
  Gauge, 
  MapPin, 
  ShieldCheck, 
  Check, 
  Plus, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart
} from 'lucide-react';

interface CarCardProps {
  vehicle: Vehicle;
  currency: Currency;
  lang: Language;
  isCompared: boolean;
  isFavorite?: boolean;
  onToggleCompare: (vehicle: Vehicle) => void;
  onToggleFavorite?: (vehicle: Vehicle) => void;
  onSelect: (vehicle: Vehicle) => void;
}

export const CarCard: React.FC<CarCardProps> = ({
  vehicle,
  currency,
  lang,
  isCompared,
  isFavorite = false,
  onToggleCompare,
  onToggleFavorite,
  onSelect,
}) => {
  const t = TRANSLATIONS[lang];
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % vehicle.images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + vehicle.images.length) % vehicle.images.length);
  };

  return (
    <div 
      onClick={() => onSelect(vehicle)}
      className="group relative bg-slate-900/80 border border-slate-800/80 hover:border-blue-500/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col cursor-pointer"
    >
      {/* Image Gallery Container */}
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
        <img
          src={vehicle.images[currentImageIndex] || vehicle.images[0]}
          alt={vehicle.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/30 pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
          <div className="flex flex-wrap items-center gap-1.5 pointer-events-auto">
            {vehicle.isFeatured && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-md flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                VIP
              </span>
            )}
            {vehicle.isVerified && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-500/80 text-white backdrop-blur-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            {onToggleFavorite && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(vehicle);
                }}
                className={`pointer-events-auto p-1.5 rounded-xl backdrop-blur-md border transition-all ${
                  isFavorite
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 shadow-md shadow-rose-500/20'
                    : 'bg-slate-900/70 text-slate-300 border-slate-700 hover:text-rose-400 hover:bg-slate-800'
                }`}
                title={isFavorite ? 'Bəyənilənlərdən çıxar' : 'Bəyənilənlərə əlavə et'}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
              </button>
            )}

            {/* Compare toggle button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onToggleCompare(vehicle);
              }}
              className={`pointer-events-auto p-1.5 rounded-xl backdrop-blur-md border transition-all ${
                isCompared
                  ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-500/30'
                  : 'bg-slate-900/70 text-slate-300 border-slate-700 hover:bg-slate-800'
              }`}
              title={isCompared ? t.removeFromCompare : t.addToCompare}
            >
              {isCompared ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Image Slider Controls */}
        {vehicle.images.length > 1 && (
          <div className="absolute inset-y-0 inset-x-2 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={prevImage}
              className="p-1 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-all shadow-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextImage}
              className="p-1 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white transition-all shadow-md"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Image Dots */}
        {vehicle.images.length > 1 && (
          <div className="absolute bottom-2.5 left-0 right-0 flex justify-center gap-1 pointer-events-none">
            {vehicle.images.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentImageIndex ? 'w-4 bg-white' : 'w-1.5 bg-white/40'
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Price & Valuation */}
          <div className="flex items-start justify-between gap-2 mb-2">
            <div>
              <span className="text-2xl font-black text-white tracking-tight">
                {formatPrice(vehicle.priceAzn, currency)}
              </span>
              {currency !== 'AZN' && (
                <span className="block text-xs text-slate-400">
                  ≈ {formatPrice(vehicle.priceAzn, 'AZN')}
                </span>
              )}
            </div>
            <FairPriceBadge valuation={vehicle.valuation} lang={lang} size="sm" />
          </div>

          {/* Title & Generation */}
          <h3 className="font-semibold text-slate-100 group-hover:text-blue-400 transition-colors line-clamp-1 text-base">
            {vehicle.title}
          </h3>

          <p className="text-xs text-slate-400 mb-3">
            {vehicle.year} • {vehicle.mileageKm.toLocaleString()} km • {vehicle.city}
          </p>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 gap-2 py-2.5 border-y border-slate-800/80 text-xs text-slate-300">
            <div className="flex items-center gap-1.5">
              <Gauge className="w-3.5 h-3.5 text-slate-400" />
              <span>{vehicle.engineVolumeLiters > 0 ? `${vehicle.engineVolumeLiters}L • ${vehicle.powerHp} a.g.` : `${vehicle.powerHp} a.g. (EV)`}</span>
            </div>
            <div className="flex items-center gap-1.5 capitalize">
              <Fuel className="w-3.5 h-3.5 text-slate-400" />
              <span>{vehicle.fuelType}</span>
            </div>
          </div>
        </div>

        {/* Footer: Seller & Badges */}
        <div className="mt-3 pt-2 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5 truncate max-w-[65%]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
            <span className="truncate">{vehicle.seller.name}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-400 group-hover:text-blue-400 transition-colors">
            <Eye className="w-3.5 h-3.5" />
            <span>{vehicle.viewsCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
