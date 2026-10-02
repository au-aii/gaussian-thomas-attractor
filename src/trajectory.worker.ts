import { createTrajectory } from "./trajectory.js";

self.onmessage = (event: MessageEvent<number>) => {
  const positions = createTrajectory(event.data);
  self.postMessage(positions, { transfer: [positions.buffer as ArrayBuffer] });
};
