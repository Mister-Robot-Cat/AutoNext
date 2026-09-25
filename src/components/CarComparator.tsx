import React from 'react';
import { Vehicle, Currency, Language } from '../types/vehicle';
import { formatPrice, TRANSLATIONS } from '../utils/i18n';
import { X, Check, Minus, Plus, Trophy, Layers } from 'lucide-react';

interface CarComparatorProps {
  vehicles: Vehicle[];
  currency: Currency;
  lang: Language;
  onRemoveVehicle: (id: string) => void;
  onClose: () => void;
  onSelectVehicle: (v: Vehicle) => void;
}

export const CarComparator: React.FC<CarComparatorProps> = ({
  vehicles,
  currency,
  lang,
  onRemoveVehicle,
  onClose,
  onSelectVehicle,
}) => {
  const t = TRANSLATIONS[lang];

  if (vehicles.length === 0) return null;

  // Compute best specs among compared cars
  const minPrice = Math.min(...vehicles.map((v) => v.priceAzn));
  const maxPower = Math.max(...vehicles.map((v) => v.powerHp));
  const minMileage = Math.min(...vehicles.map((v) => v.mileageKm));
  const minFuel = Math.min(...vehicles.filter((v) => v.fuelConsumptionLPer100Km > 0).map((v) => v.fuelConsumptionLPer100Km));

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-6xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/60 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-600/20 text-blue-400">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white">Avtomobillərin Canlı Müqayisəsi</h2>
              <p className="text-xs text-slate-400">
                Turbo.az-dan fərqli olaraq xüsusiyyətləri yan-yana müqayisə edin və ən üstün variantı seçin
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Matrix Table */}
        <div className="p-4 sm:p-6 overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="w-48 text-left text-xs font-bold text-slate-400 uppercase tracking-wider p-3">
                  Xüsusiyyət
                </th>
                {vehicles.map((v) => (
                  <th key={v.id} className="min-w-[220px] p-3 text-left">
                    <div className="relative group bg-slate-950/80 p-3 rounded-2xl border border-slate-800">
                      <button
                        onClick={() => onRemoveVehicle(v.id)}
                        className="absolute top-2 right-2 p-1 rounded-full bg-slate-800 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                        title="Müqayisədən çıxar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>

                      <img
                        src={v.images[0]}
                        alt={v.title}
                        className="w-full h-28 object-cover rounded-xl mb-2"
                      />
                      <h4 className="font-bold text-white text-sm line-clamp-1">{v.title}</h4>
                      <p className="text-xs text-slate-400">{v.year} • {v.city}</p>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="text-sm divide-y divide-slate-800/80">
              {/* Price row */}
              <tr className="hover:bg-slate-800/20">
                <td className="p-3 font-semibold text-slate-400">Qiymət</td>
                {vehicles.map((v) => {
                  const isBest = v.priceAzn === minPrice && vehicles.length > 1;
                  return (
                    <td key={v.id} className="p-3">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-black text-base ${isBest ? 'text-emerald-400' : 'text-white'}`}>
                          {formatPrice(v.priceAzn, currency)}
                        </span>
                        {isBest && (
                          <span title="Ən münasib qiymət">
                            <Trophy className="w-4 h-4 text-emerald-400" />
                          </span>
                        )}
                      </div>
                    </td>
                  );
                })}
              </tr>

              {/* AI Valuation */}
              <tr className="hover:bg-slate-800/20">
                <td className="p-3 font-semibold text-slate-400">AI Bazar Təhlili</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3">
                    <span className="text-xs font-semibold text-blue-400">
                      {Math.abs(v.valuation.percentageDiff)}% {v.valuation.percentageDiff <= 0 ? 'sərfəli' : 'baha'}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Mileage */}
              <tr className="hover:bg-slate-800/20">
                <td className="p-3 font-semibold text-slate-400">Yürüş</td>
                {vehicles.map((v) => {
                  const isBest = v.mileageKm === minMileage && vehicles.length > 1;
                  return (
                    <td key={v.id} className="p-3">
                      <span className={`font-medium ${isBest ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                        {v.mileageKm.toLocaleString()} km
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Engine & Power */}
              <tr className="hover:bg-slate-800/20">
                <td className="p-3 font-semibold text-slate-400">Mühərrik & Güc</td>
                {vehicles.map((v) => {
                  const isBest = v.powerHp === maxPower && vehicles.length > 1;
                  return (
                    <td key={v.id} className="p-3">
                      <span className={`font-medium ${isBest ? 'text-purple-400 font-bold' : 'text-slate-300'}`}>
                        {v.engineVolumeLiters > 0 ? `${v.engineVolumeLiters}L` : 'EV'} • {v.powerHp} a.g.
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Fuel consumption */}
              <tr className="hover:bg-slate-800/20">
                <td className="p-3 font-semibold text-slate-400">Sərfiyyat (100 km)</td>
                {vehicles.map((v) => {
                  const isBest = v.fuelConsumptionLPer100Km === minFuel && vehicles.length > 1;
                  return (
                    <td key={v.id} className="p-3">
                      <span className={`font-medium ${isBest ? 'text-emerald-400 font-bold' : 'text-slate-300'}`}>
                        {v.fuelConsumptionLPer100Km === 0 ? '0 L (Elektrik)' : `${v.fuelConsumptionLPer100Km} L`}
                      </span>
                    </td>
                  );
                })}
              </tr>

              {/* Transmission */}
              <tr className="hover:bg-slate-800/20">
                <td className="p-3 font-semibold text-slate-400">Sürətlər qutusu</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3 text-slate-300 capitalize">
                    {v.transmission}
                  </td>
                ))}
              </tr>

              {/* Drivetrain */}
              <tr className="hover:bg-slate-800/20">
                <td className="p-3 font-semibold text-slate-400">Ötürücü</td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3 text-slate-300 uppercase">
                    {v.drivetrain}
                  </td>
                ))}
              </tr>

              {/* Damage & Paint Status */}
              <tr className="hover:bg-slate-800/20">
                <td className="p-3 font-semibold text-slate-400">Zədə / Rəng</td>
                {vehicles.map((v) => {
                  const damagedParts = v.damageReport.filter((p) => p.severity !== 'none');
                  return (
                    <td key={v.id} className="p-3">
                      {damagedParts.length === 0 ? (
                        <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Bezkraska (Zavod)
                        </span>
                      ) : (
                        <span className="text-xs text-amber-400">
                          {damagedParts.length} detalda kosmetik rəng
                        </span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* View details action */}
              <tr>
                <td className="p-3"></td>
                {vehicles.map((v) => (
                  <td key={v.id} className="p-3">
                    <button
                      onClick={() => {
                        onClose();
                        onSelectVehicle(v);
                      }}
                      className="w-full py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-all"
                    >
                      Baxış keçir
                    </button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
