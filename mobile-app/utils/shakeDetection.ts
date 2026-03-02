export const isShake = ({ x, y, z }: { x: number; y: number; z: number }) => {
  const acceleration = Math.sqrt(x * x + y * y + z * z);
  return acceleration > 2.0;
};