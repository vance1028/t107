export type JointAngles = [number, number, number, number, number, number];

export interface DHRow {
  alpha: number;
  a: number;
  d: number;
  thetaOffset: number;
  min: number;
  max: number;
}

export const DH_PARAMS: DHRow[] = [
  { alpha: 0,          a: 0,    d: 330, thetaOffset: 0,       min: -Math.PI,       max: Math.PI },
  { alpha: -Math.PI / 2, a: 75,   d: 0,   thetaOffset: -Math.PI / 2, min: -Math.PI,       max: 0 },
  { alpha: 0,          a: 350,  d: 0,   thetaOffset: 0,       min: -Math.PI / 2,   max: Math.PI / 2 },
  { alpha: -Math.PI / 2, a: 80,   d: 340, thetaOffset: 0,       min: -Math.PI,       max: Math.PI },
  { alpha: Math.PI / 2,  a: 0,    d: 0,   thetaOffset: 0,       min: -Math.PI,       max: Math.PI },
  { alpha: -Math.PI / 2, a: 0,    d: 140, thetaOffset: 0,       min: -Math.PI,       max: Math.PI },
];

export const DEFAULT_JOINTS: JointAngles = [0, -Math.PI / 3, Math.PI / 3, 0, Math.PI / 4, 0];

export function clampJoint(idx: number, angle: number): number {
  const row = DH_PARAMS[idx];
  return Math.max(row.min, Math.min(row.max, angle));
}

export function clampJoints(joints: JointAngles): JointAngles {
  return joints.map((j, i) => clampJoint(i, j)) as JointAngles;
}

export function radToDeg(r: number): number {
  return (r * 180) / Math.PI;
}

export function degToRad(d: number): number {
  return (d * Math.PI) / 180;
}
