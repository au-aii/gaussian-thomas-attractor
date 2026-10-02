export type RenderProfile = {
  particleCount: number;
  maxPixelRatio: number;
  maxFps: number;
  bloom: boolean;
};

export function chooseRenderProfile(
  hardwareConcurrency?: number,
  deviceMemory?: number,
): RenderProfile;
