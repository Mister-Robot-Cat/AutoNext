/**
 * Calculates the next frame index in a circular 360 sequence based on drag delta
 */
export function calculateRotationFrame(
  currentFrame: number,
  deltaX: number,
  sensitivity: number = 15,
  totalFrames: number = 8
): number {
  if (totalFrames <= 0) return 0;
  
  const frameShift = Math.floor(deltaX / sensitivity);
  if (frameShift === 0) return currentFrame;

  let newFrame = (currentFrame + frameShift) % totalFrames;
  if (newFrame < 0) {
    newFrame += totalFrames;
  }
  return newFrame;
}

/**
 * Returns rotation angle in degrees from frame index
 */
export function getAngleDegrees(frameIndex: number, totalFrames: number = 8): number {
  if (totalFrames <= 0) return 0;
  const degreesPerFrame = 360 / totalFrames;
  return Math.round((frameIndex % totalFrames) * degreesPerFrame);
}

export interface RotationHotspot {
  id: string;
  frameIndex: number;
  xPercent: number; // 0 to 100
  yPercent: number; // 0 to 100
  title: string;
  description: string;
}

/**
 * Default feature hotspots for popular vehicles
 */
export const DEFAULT_HOTSPOTS: Record<string, RotationHotspot[]> = {
  default: [
    {
      id: 'hs-1',
      frameIndex: 0,
      xPercent: 50,
      yPercent: 65,
      title: 'İntellektual LED Fənərlər',
      description: 'Avtomatik uzaqvuran işıqlar və adaptiv döngə işıqlandırması.',
    },
    {
      id: 'hs-2',
      frameIndex: 2,
      xPercent: 48,
      yPercent: 78,
      title: 'Yüngül Xəlitəli Disklər',
      description: 'Orijinal zavod diskləri və yüksək dözümlü təkərlər.',
    },
    {
      id: 'hs-3',
      frameIndex: 4,
      xPercent: 50,
      yPercent: 50,
      title: 'Aktiv Aerodinamik Spoiler & Kamera',
      description: 'Dinamik hava axını və 360 dərəcə arxa görüntü sensorları.',
    },
  ],
};
