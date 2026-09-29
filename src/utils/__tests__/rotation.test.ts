import { describe, it, expect } from 'vitest';
import { calculateRotationFrame, getAngleDegrees } from '../rotation';

describe('360 Vehicle Rotation Utilities', () => {
  describe('calculateRotationFrame', () => {
    it('returns same frame when delta is below sensitivity threshold', () => {
      const frame = calculateRotationFrame(0, 10, 15, 8);
      expect(frame).toBe(0);
    });

    it('shifts frame forward on positive drag delta', () => {
      const frame = calculateRotationFrame(0, 30, 15, 8); // 30 / 15 = 2 frames
      expect(frame).toBe(2);
    });

    it('wraps around circularly when exceeding totalFrames', () => {
      const frame = calculateRotationFrame(7, 30, 15, 8); // (7 + 2) % 8 = 1
      expect(frame).toBe(1);
    });

    it('handles negative drag delta with circular underflow wrap', () => {
      const frame = calculateRotationFrame(0, -30, 15, 8); // (0 - 2) % 8 -> 6
      expect(frame).toBe(6);
    });
  });

  describe('getAngleDegrees', () => {
    it('converts frame index to exact degrees', () => {
      expect(getAngleDegrees(0, 8)).toBe(0);
      expect(getAngleDegrees(2, 8)).toBe(90);
      expect(getAngleDegrees(4, 8)).toBe(180);
      expect(getAngleDegrees(6, 8)).toBe(270);
    });

    it('handles frame index overflow safely', () => {
      expect(getAngleDegrees(8, 8)).toBe(0);
    });
  });
});
