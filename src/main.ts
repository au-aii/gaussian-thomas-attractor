import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';



const N = 500000
const b = 0.1993
const dt = 0.05
const positions = new Float32Array(N * 3)

let x = 0.1, y = 0, z = 0

for　(let i = 0; i < N; i++) {
  const nx = x +(Math.sin(y) - b * x)*dt
  const ny = y + (Math.sin(z) - b * y)*dt
  const nz = z + (Math.sin(x) - b * z)*dt

  x = nx; y = ny; z = nz

  positions[i * 3 + 0] = x
  positions[i * 3 + 1] = y
  positions[i * 3 + 2] = z
}

const scene = new THREE.Scene()
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
camera.position.z = 20

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// 2. position into geometry 
const geometry = new THREE.BufferGeometry()
geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

// 3. material renderer
const material = new THREE.ShaderMaterial({
  blending: THREE.AdditiveBlending,
  depthWrite: false,
  transparent: true,
  vertexShader: /* glsl */`
    void main() {
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      gl_PointSize = 3.0;
    }
  `,
  fragmentShader: /* glsl */`
    void main() {
      float r = distance(gl_PointCoord, vec2(0.5));
      float g = exp(-r * r * 10.0);
      gl_FragColor = vec4(vec3(g), g);
    }
  `,
  })

const points = new THREE.Points(geometry, material)
scene.add(points)

// 4. orbitcontrols
const controls = new OrbitControls(camera, renderer.domElement)

// 5. animation loop
function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
animate()
