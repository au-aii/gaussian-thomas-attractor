/**
 * @typedef {{ particleCount: number, maxPixelRatio: number, maxFps: number, bloom: boolean }} RenderProfile
 */

/**
 * @param {number | undefined} hardwareConcurrency
 * @param {number | undefined} deviceMemory
 * @returns {RenderProfile}
 */
export function chooseRenderProfile(hardwareConcurrency, deviceMemory) {
  const cores = Number.isFinite(hardwareConcurrency) ? hardwareConcurrency : 8;
  const memory = Number.isFinite(deviceMemory) ? deviceMemory : 8;

  if (cores <= 4 || memory <= 4) {
    return { particleCount: 75_000, maxPixelRatio: 1, maxFps: 24, bloom: false };
  }

  if (cores >= 12 && memory >= 8) {
    return { particleCount: 240_000, maxPixelRatio: 1.5, maxFps: 30, bloom: true };
  }

  return { particleCount: 150_000, maxPixelRatio: 1.25, maxFps: 30, bloom: false };
}
