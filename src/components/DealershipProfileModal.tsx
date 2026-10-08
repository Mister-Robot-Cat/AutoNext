import React, { useMemo } from 'react';
import { SellerInfo, Vehicle, Currency, Language } from '../types/vehicle';
import { MOCK_VEHICLES } from '../data/mockVehicles';
import { CarCard } from './CarCard';
import { X, ShieldCheck, MapPin, Calendar, Star, Clock, Phone, MessageCircle, BadgeCheck } from 'lucide-react';
import { useScrollLock } from '../hooks/useScrollLock';
import { useKeyPress } from '../hooks/useKeyPress';
import { useCopyToClipboard } from '../hooks/useCopyToClipboard';
import { Copy, Check } from 'lucide-react';

interface DealershipProfileModalProps {
  seller: SellerInfo | null;
  currency: Currency;
  lang: Language;
  onClose: () => void;
  onSelectVehicle: (v: Vehicle) => void;
  // Pass these if we want interactivity
  favoriteIds?: string[];
  comparedVehicleIds?: string[];
  onToggleFavorite?: (vehicle: Vehicle) => void;
  onToggleCompare?: (vehicle: Vehicle) => void;
}

export function DealershipProfileModal({ 
  seller, 
  currency, 
  lang, 
  onClose, 
  onSelectVehicle,
  favoriteIds = [],
  comparedVehicleIds = [],
  onToggleFavorite = () => {},
  onToggleCompare = () => {}
}: DealershipProfileModalProps) {
  useScrollLock(!!seller);
  useKeyPress('Escape', onClose);
  const [copiedPhone, copyPhone] = useCopyToClipboard();

  const dealerVehicles = useMemo(() => {
    return seller ? MOCK_VEHICLES.filter(v => v.seller.id === seller.id) : [];
  }, [seller?.id]);

  if (!seller) return null;

  const isOfficial = seller.type === 'official_dealer' || seller.type === 'autocenter';

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Cover */}
        <div className="h-32 sm:h-48 bg-gradient-to-r from-blue-900 via-slate-800 to-indigo-900 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl bg-black/40 hover:bg-black/60 text-white backdrop-blur-md transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="px-4 sm:px-8 pb-6 border-b border-slate-800 relative bg-slate-900 flex-shrink-0">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 -mt-12 sm:-mt-16 mb-4">
            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl bg-slate-800 border-4 border-slate-900 shadow-xl flex-shrink-0 overflow-hidden flex items-center justify-center relative">
              {seller.avatarUrl ? (
                <img src={seller.avatarUrl} alt={seller.name} className="w-full h-full object-cover" />
              ) : (
                <span className="text-4xl sm:text-5xl font-black text-slate-600">
                  {seller.name.charAt(0)}
                </span>
              )}
              {seller.verifiedIdentity && (
                <div className="absolute -bottom-1 -right-1 bg-blue-500 rounded-full p-1 border-2 border-slate-900">
                  <ShieldCheck className="w-4 h-4 text-white" />
                </div>
              )}
            </div>

            <div className="pt-2 sm:pt-16 flex-1">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black text-white flex items-center gap-2">
                    {seller.name}
                    {isOfficial && (
                      <BadgeCheck className="w-5 h-5 text-blue-400" />
                    )}
                  </h2>
                  <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" /> {seller.city}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> AutoNext üzvü: {seller.memberSinceYear}
                    </span>
                    <span className="flex items-center gap-1 text-emerald-400">
                      <Star className="w-3.5 h-3.5 fill-current" /> {seller.rating} ({seller.reviewsCount} rəy)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {seller.whatsapp && (
                    <a
                      href={`https://wa.me/${seller.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600 hover:text-white border border-emerald-600/30 transition-all font-semibold text-sm flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" /> WhatsApp
                    </a>
                  )}
                  <div className="flex bg-blue-600 rounded-xl overflow-hidden shadow-lg shadow-blue-600/20">
                    <a
                      href={`tel:${seller.phone.replace(/\s/g, '')}`}
                      className="px-4 py-2 hover:bg-blue-500 text-white transition-all font-semibold text-sm flex items-center gap-2"
                    >
                      <Phone className="w-4 h-4" /> Zəng Et
                    </a>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        copyPhone(seller.phone);
                      }}
                      className="px-3 bg-blue-700/50 hover:bg-blue-500 text-white transition-colors border-l border-blue-500/30 flex items-center justify-center"
                      title="Nömrəni kopyala"
                    >
                      {copiedPhone === seller.phone ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Status</span>
              <div className="font-bold text-white text-sm capitalize">
                {seller.type === 'official_dealer' ? 'Rəsmi Diler' : seller.type === 'autocenter' ? 'Avtosalon' : 'Şəxsi'}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Aktiv Elanlar</span>
              <div className="font-bold text-white text-sm">
                {dealerVehicles.length}
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Cavabvermə Müddəti</span>
              <div className="flex items-center gap-1.5 font-bold text-white text-sm">
                <Clock className="w-4 h-4 text-amber-400" />
                ~{seller.responseTimeMinutes || 15} dəq
              </div>
            </div>
            <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase text-slate-500 font-bold block mb-1">Cavablandırma Göstəricisi</span>
              <div className="font-bold text-white text-sm text-emerald-400">
                {((seller.responseRate || 0.98) * 100).toFixed(0)}%
              </div>
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        <div className="p-4 sm:p-6 bg-slate-950 flex-1 overflow-y-auto min-h-[300px]">
          <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
            Satışdakı Avtomobilləri
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs">{dealerVehicles.length}</span>
          </h3>
          
          {dealerVehicles.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {dealerVehicles.map(car => (
                <CarCard
                  key={car.id}
                  vehicle={car}
                  currency={currency}
                  lang={lang}
                  isCompared={comparedVehicleIds.includes(car.id)}
                  isFavorite={favoriteIds.includes(car.id)}
                  onToggleFavorite={onToggleFavorite}
                  onToggleCompare={onToggleCompare}
                  onSelect={onSelectVehicle}
                />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-500">
              Aktiv elan yoxdur.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
