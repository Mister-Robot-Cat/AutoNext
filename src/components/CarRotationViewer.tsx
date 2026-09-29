import React, { useState, useEffect, useRef } from 'react';
import { Vehicle } from '../types/vehicle';
import { 
  calculateRotationFrame, 
  getAngleDegrees, 
  DEFAULT_HOTSPOTS, 
  RotationHotspot 
} from '../utils/rotation';
import { 
  Rotate3d, 
  Play, 
  Pause, 
  Compass, 
  Info, 
  Sparkles, 
  Sliders 
} from 'lucide-react';

interface CarRotationViewerProps {
  vehicle: Vehicle;
}

export const CarRotationViewer: React.FC<CarRotationViewerProps> = ({ vehicle }) => {
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedHotspot, setSelectedHotspot] = useState<RotationHotspot | null>(null);
  
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const startFrameRef = useRef(0);

  // If vehicle has 8 or more images, use them as 360 frames; otherwise generate cyclic set
  const frames = vehicle.images.length >= 8 
    ? vehicle.images 
    : [
        vehicle.images[0],
        vehicle.images[1] || vehicle.images[0],
        vehicle.images[2] || vehicle.images[0],
        vehicle.images[0],
        vehicle.images[1] || vehicle.images[0],
        vehicle.images[2] || vehicle.images[0],
        vehicle.images[0],
        vehicle.images[1] || vehicle.images[0],
      ];

  const totalFrames = frames.length;
  const currentAngle = getAngleDegrees(currentFrame, totalFrames);

  // Auto-play rotation timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % totalFrames);
    }, 400);
    return () => clearInterval(interval);
  }, [isPlaying, totalFrames]);

  // Mouse Drag Handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.clientX;
    startFrameRef.current = currentFrame;
    setIsPlaying(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.clientX - startXRef.current;
    const nextFrame = calculateRotationFrame(startFrameRef.current, deltaX, 20, totalFrames);
    setCurrentFrame(nextFrame);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Touch Handlers for Mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    isDraggingRef.current = true;
    startXRef.current = e.touches[0].clientX;
    startFrameRef.current = currentFrame;
    setIsPlaying(false);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDraggingRef.current) return;
    const deltaX = e.touches[0].clientX - startXRef.current;
    const nextFrame = calculateRotationFrame(startFrameRef.current, deltaX, 20, totalFrames);
    setCurrentFrame(nextFrame);
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
  };

  // Find hotspots active on the current frame (+- 1 frame tolerance)
  const hotspots = DEFAULT_HOTSPOTS.default.filter(
    (h) => Math.abs(h.frameIndex - currentFrame) <= 1
  );

  return (
    <div className="space-y-3">
      {/* 360 Viewport Container */}
      <div
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 cursor-grab active:cursor-grabbing select-none shadow-2xl group"
      >
        <img
          src={frames[currentFrame]}
          alt={`${vehicle.title} 360 view angle ${currentAngle}°`}
          className="w-full h-full object-cover pointer-events-none transition-transform duration-100"
        />

        {/* Overlay Badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2 pointer-events-none">
          <span className="px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-900/90 text-blue-400 border border-blue-500/30 backdrop-blur-md flex items-center gap-1.5 shadow-lg">
            <Rotate3d className="w-4 h-4 animate-spin-slow" />
            <span>360° Studio</span>
          </span>

          <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-slate-900/80 text-slate-300 border border-slate-700/80 backdrop-blur-md flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentAngle}°</span>
          </span>
        </div>

        {/* Hotspots */}
        {hotspots.map((hs) => (
          <div
            key={hs.id}
            style={{ left: `${hs.xPercent}%`, top: `${hs.yPercent}%` }}
            className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setSelectedHotspot(selectedHotspot?.id === hs.id ? null : hs);
              }}
              className="relative p-1.5 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-500/50 hover:scale-110 transition-transform"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="absolute -inset-1 rounded-full bg-blue-500 animate-ping opacity-40 pointer-events-none" />
            </button>
          </div>
        ))}

        {/* Hotspot Info Popup */}
        {selectedHotspot && (
          <div className="absolute bottom-3 left-3 right-3 p-3 rounded-xl bg-slate-900/95 border border-blue-500/40 text-xs text-white backdrop-blur-md shadow-2xl flex items-start justify-between gap-3 animate-in fade-in">
            <div>
              <strong className="text-blue-400 block font-semibold mb-0.5">{selectedHotspot.title}</strong>
              <p className="text-slate-300 text-[11px] leading-relaxed">{selectedHotspot.description}</p>
            </div>
            <button
              onClick={() => setSelectedHotspot(null)}
              className="text-slate-400 hover:text-white p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* Helper Hint on Hover */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-slate-950/70 border border-slate-700/80 text-[11px] text-slate-300 pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
          Fırlatmaq üçün maşını sağa/sola sürüşdürün
        </div>
      </div>

      {/* Control Bar */}
      <div className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between gap-3">
        {/* Play/Pause Button */}
        <button
          type="button"
          onClick={() => setIsPlaying(!isPlaying)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all ${
            isPlaying
              ? 'bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-600/30'
              : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
          }`}
        >
          {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isPlaying ? 'Dayandır' : 'Avto Fırlat'}</span>
        </button>

        {/* Frame / Angle Slider */}
        <div className="flex-1 flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={totalFrames - 1}
            value={currentFrame}
            onChange={(e) => {
              setIsPlaying(false);
              setCurrentFrame(Number(e.target.value));
            }}
            className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>

        {/* Frame counter */}
        <span className="text-xs font-mono font-semibold text-slate-400 whitespace-nowrap">
          {currentFrame + 1} / {totalFrames} bucaq
        </span>
      </div>
    </div>
  );
};
