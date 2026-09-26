import React from 'react';
import { Vehicle, Language } from '../types/vehicle';
import { generateVinReport, checkOdometerRollbackRisk } from '../utils/vinHistory';
import { 
  X, 
  ShieldCheck, 
  FileCheck2, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Wrench, 
  MapPin, 
  Car,
  FileText,
  Printer,
  Calendar
} from 'lucide-react';

interface VinHistoryModalProps {
  vehicle: Vehicle | null;
  lang: Language;
  onClose: () => void;
}

export const VinHistoryModal: React.FC<VinHistoryModalProps> = ({
  vehicle,
  lang,
  onClose,
}) => {
  if (!vehicle) return null;

  const report = generateVinReport(vehicle);
  const rollbackCheck = checkOdometerRollbackRisk(report.odometerReadings);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-950/70 sticky top-0 z-20 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-600/20 text-blue-400 border border-blue-500/30">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-black text-white">AutoNext VIN Tarixçəsi & Yürüş Hesabatı</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 uppercase">
                  Təsdiqlənib
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                VIN: <span className="text-white font-bold">{report.vin}</span> • {report.vehicleTitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Çap et</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6">
          {/* Quick Verification Pillars */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Status</span>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-400">
                <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                <span>Təmiz Tarixçə</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Mənşə Ölkəsi</span>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-200">
                <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span>{report.originCountry}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Gömrük</span>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-emerald-400">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>Rəsmiləşdirilib</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Sahiblərin Sayı</span>
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-200">
                <Car className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span>{report.previousOwnersCount === 0 ? 'İlk sahibi (Salon)' : `${report.previousOwnersCount} sahib`}</span>
              </div>
            </div>
          </div>

          {/* Odometer Progression Verification */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
                  <span>Yürüş Tarixçəsi & Orijinallıq Təsdiqi</span>
                  {!rollbackCheck.isRollbackDetected ? (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Çəkilmə qeydə alınmayıb (Original)
                    </span>
                  ) : (
                    <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Şübhəli
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bütün texniki baxış və servis qeydlərində yürüşün artım ardıcıllığı yoxlanılıb
                </p>
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-xs text-slate-400 block">Cari Yürüş</span>
                <span className="text-lg font-black text-white">{vehicle.mileageKm.toLocaleString()} km</span>
              </div>
            </div>

            {/* Odometer timeline steps */}
            <div className="relative pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {report.odometerReadings.map((reading, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-slate-900 border border-slate-800/80 space-y-1">
                    <span className="text-[10px] text-blue-400 font-semibold">{reading.date}</span>
                    <div className="font-bold text-white text-sm">{reading.mileageKm.toLocaleString()} km</div>
                    <p className="text-[10px] text-slate-400 line-clamp-1">{reading.source}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chronological Service History */}
          <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
            <h3 className="font-bold text-white text-sm sm:text-base flex items-center gap-2">
              <Wrench className="w-4 h-4 text-blue-400" />
              <span>Dövri Servis və Texniki Baxış Tarixçəsi</span>
            </h3>

            <div className="space-y-3">
              {report.serviceHistory.map((item) => (
                <div 
                  key={item.id}
                  className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{item.title}</span>
                      <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {item.mileageKm.toLocaleString()} km
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{item.description}</p>
                  </div>

                  <div className="text-left sm:text-right text-[11px] text-slate-500 flex-shrink-0">
                    <div className="flex items-center sm:justify-end gap-1 text-slate-400">
                      <Calendar className="w-3 h-3" />
                      <span>{item.date}</span>
                    </div>
                    <span className="text-slate-400 font-medium">{item.verifiedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Official Seals Footer */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/40 via-slate-900 to-indigo-950/40 border border-blue-900/40 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>AutoNext Rəqəmsal Ekspertiza bazası ilə sinxronlaşdırılıb</span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">Hesabat Kodu: #{report.vin.slice(-6)}-CERT</span>
          </div>
        </div>
      </div>
    </div>
  );
};
