const B = 0.1993;
const DT = 0.05;

/** @param {number} count @returns {Float32Array} */
export function createTrajectory(count) {
  const positions = new Float32Array(count * 3);
  let x = 0.1;
  let y = 0;
  let z = 0;

  for (let i = 0; i < count; i++) {
    const nx = x + (Math.sin(y) - B * x) * DT;
    const ny = y + (Math.sin(z) - B * y) * DT;
    const nz = z + (Math.sin(x) - B * z) * DT;
    x = nx;
    y = ny;
    z = nz;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;
  }

  return positions;
}
