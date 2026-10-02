import test from "node:test";
import assert from "node:assert/strict";
import { chooseRenderProfile } from "../src/performance.js";
import { createTrajectory } from "../src/trajectory.js";

test("low-power devices get a bounded rendering profile", () => {
  assert.deepEqual(chooseRenderProfile(4, 4), {
    particleCount: 75_000,
    maxPixelRatio: 1,
    maxFps: 24,
    bloom: false,
  });
});

test("standard devices use a balanced profile without bloom", () => {
  assert.deepEqual(chooseRenderProfile(8, undefined), {
    particleCount: 150_000,
    maxPixelRatio: 1.25,
    maxFps: 30,
    bloom: false,
  });
});

test("high-capability devices still stay below the original 500k particle load", () => {
  assert.deepEqual(chooseRenderProfile(12, 8), {
    particleCount: 240_000,
    maxPixelRatio: 1.5,
    maxFps: 30,
    bloom: true,
  });
});

test("trajectory generation returns exactly the requested number of finite points", () => {
  const positions = createTrajectory(3);
  assert.equal(positions.length, 9);
  assert.ok(Math.abs(positions[0] - 0.0990035) < 1e-7);
  assert.equal(positions[1], 0);
  assert.ok(Math.abs(positions[2] - 0.0049916704) < 1e-7);
  assert.ok(positions.every(Number.isFinite));
});
