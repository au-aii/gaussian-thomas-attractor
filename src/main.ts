import * as THREE from "three";
import type { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { chooseRenderProfile } from "./performance.js";

const app = document.querySelector<HTMLDivElement>("#app")!;
const fallback = document.querySelector<HTMLDivElement>("#fallback")!;
const status = document.querySelector<HTMLParagraphElement>("#status")!;
const deviceMemory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
const profile = chooseRenderProfile(navigator.hardwareConcurrency, deviceMemory);
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

let renderer: THREE.WebGLRenderer | undefined;
try {
  renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "low-power" });
} catch {
  status.textContent = "WebGLを利用できないため、静止画で表示しています。";
}

if (!renderer) {
  // The static fallback remains visible when WebGL is disabled or unavailable.
} else {
  void startScene(renderer);
}

async function startScene(renderer: THREE.WebGLRenderer) {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, profile.maxPixelRatio);
  renderer.setPixelRatio(pixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  app.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );

  const geometry = new THREE.BufferGeometry();
  const material = new THREE.ShaderMaterial({
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    vertexShader: /* glsl */ `
      void main() {
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = 3.0;
      }
    `,
    fragmentShader: /* glsl */ `
      void main() {
        float r = distance(gl_PointCoord, vec2(0.5));
        float g = exp(-r * r * 10.0);
        vec3 color = vec3(0.5, 0.7, 1.0);
        gl_FragColor = vec4(color * g, g);
      }
    `,
  });
  const points = new THREE.Points(geometry, material);
  scene.add(points);

  let worker: Worker;
  try {
    worker = new Worker(new URL("./trajectory.worker.ts", import.meta.url), {
      type: "module",
    });
  } catch {
    status.textContent = "Web Workerを利用できないため、静止画で表示しています。";
    return;
  }
  let composer: EffectComposer | undefined;
  if (profile.bloom) {
    try {
      const [composerModule, renderPassModule, bloomModule] = await Promise.all([
        import("three/examples/jsm/postprocessing/EffectComposer.js"),
        import("three/examples/jsm/postprocessing/RenderPass.js"),
        import("three/examples/jsm/postprocessing/UnrealBloomPass.js"),
      ]);
      composer = new composerModule.EffectComposer(renderer);
      composer.addPass(new renderPassModule.RenderPass(scene, camera));
      composer.addPass(
        new bloomModule.UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          0.01,
          0.4,
          0.85,
        ),
      );
    } catch {
      worker.terminate();
      status.textContent = "アニメーションを開始できないため、静止画で表示しています。";
      return;
    }
    composer.setPixelRatio(pixelRatio);
    composer.setSize(window.innerWidth, window.innerHeight);
  }

  let frameId = 0;
  let lastFrameTime = 0;
  let startedAt = 0;
  let ready = false;

  function resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    composer?.setSize(width, height);

    if (ready && prefersReducedMotion.matches) render(performance.now());
  }

  function render(timestamp: number) {
    const elapsed = prefersReducedMotion.matches ? 0 : (timestamp - startedAt) / 1000;
    const radius = 8;
    camera.position.x = radius * Math.cos(elapsed * 0.2);
    camera.position.z = radius * Math.sin(elapsed * 0.5);
    camera.position.y = radius * Math.sin(elapsed * 0.3);
    camera.lookAt(0, 0, 0);

    if (composer) composer.render();
    else renderer.render(scene, camera);
  }

  function animate(timestamp: number) {
    frameId = 0;
    if (document.hidden) return;

    if (lastFrameTime === 0 || timestamp - lastFrameTime >= 1000 / profile.maxFps) {
      render(timestamp);
      lastFrameTime = timestamp;
    }

    if (!prefersReducedMotion.matches) frameId = requestAnimationFrame(animate);
  }

  function startAnimation() {
    if (!ready || document.hidden || frameId) return;
    fallback.hidden = true;
    startedAt = performance.now();
    lastFrameTime = 0;
    frameId = requestAnimationFrame(animate);
  }

  worker.onmessage = (event: MessageEvent<Float32Array>) => {
    geometry.setAttribute("position", new THREE.BufferAttribute(event.data, 3));
    geometry.computeBoundingSphere();
    ready = true;
    worker.terminate();
    startAnimation();
  };

  worker.onerror = () => {
    worker.terminate();
    status.textContent = "アニメーションを開始できないため、静止画で表示しています。";
  };

  worker.postMessage(profile.particleCount);
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = 0;
    } else {
      startAnimation();
    }
  });
  prefersReducedMotion.addEventListener("change", () => {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    if (prefersReducedMotion.matches) render(performance.now());
    else startAnimation();
  });
}
