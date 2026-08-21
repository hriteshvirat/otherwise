// ============================================================
// OTHERWISE — Math Utilities
// ============================================================

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * clamp01(t);
}

/** Clamp value between 0 and 1 */
export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** Clamp value between min and max */
export function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

/** Distance between two points */
export function dist(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}

/** Squared distance (cheaper than dist for comparisons) */
export function distSq(x1: number, y1: number, x2: number, y2: number): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return dx * dx + dy * dy;
}

/** Approach a value toward a target at a rate per second */
export function approach(current: number, target: number, rate: number, dt: number): number {
  const diff = target - current;
  if (Math.abs(diff) <= rate * dt) return target;
  return current + Math.sign(diff) * rate * dt;
}

/** Random float in range [min, max) */
export function randRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Random integer in range [min, max] inclusive */
export function randInt(min: number, max: number): number {
  return Math.floor(min + Math.random() * (max - min + 1));
}

/** Convert hex color to CSS string */
export function hexToString(hex: number): string {
  return '#' + hex.toString(16).padStart(6, '0');
}

/** Ease in-out cubic */
export function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

/** Smoothstep */
export function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp01((x - edge0) / (edge1 - edge0));
  return t * t * (3 - 2 * t);
}
