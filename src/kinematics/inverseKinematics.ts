import * as THREE from "three";
import { JointAngles, clampJoints } from "./dhParams";
import {
  computeForwardKinematics,
  computeJacobian,
} from "./forwardKinematics";

export interface IKResult {
  joints: JointAngles;
  positionError: number;
  reachable: boolean;
  iterations: number;
}

function mat6Transpose(J: number[][]): number[][] {
  const Jt: number[][] = Array.from({ length: 6 }, () => new Array(6).fill(0));
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      Jt[c][r] = J[r][c];
    }
  }
  return Jt;
}

function mat6Mul(A: number[][], B: number[][]): number[][] {
  const R: number[][] = Array.from({ length: 6 }, () => new Array(6).fill(0));
  for (let r = 0; r < 6; r++) {
    for (let c = 0; c < 6; c++) {
      let s = 0;
      for (let k = 0; k < 6; k++) s += A[r][k] * B[k][c];
      R[r][c] = s;
    }
  }
  return R;
}

function mat6VecMul(A: number[][], v: number[]): number[] {
  const R: number[] = new Array(6).fill(0);
  for (let r = 0; r < 6; r++) {
    let s = 0;
    for (let k = 0; k < 6; k++) s += A[r][k] * v[k];
    R[r] = s;
  }
  return R;
}

function mat6Inverse(M: number[][]): number[][] | null {
  const n = 6;
  const A: number[][] = Array.from({ length: n }, (_, i) => [
    ...M[i],
    ...Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  ]);

  for (let col = 0; col < n; col++) {
    let pivotRow = col;
    let maxVal = Math.abs(A[col][col]);
    for (let r = col + 1; r < n; r++) {
      const v = Math.abs(A[r][col]);
      if (v > maxVal) {
        maxVal = v;
        pivotRow = r;
      }
    }
    if (maxVal < 1e-10) return null;
    if (pivotRow !== col) {
      const tmp = A[pivotRow];
      A[pivotRow] = A[col];
      A[col] = tmp;
    }
    const div = A[col][col];
    for (let c = col; c < 2 * n; c++) A[col][c] /= div;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const factor = A[r][col];
      for (let c = col; c < 2 * n; c++) A[r][c] -= factor * A[col][c];
    }
  }
  const inv: number[][] = Array.from({ length: n }, (_, i) =>
    A[i].slice(n, 2 * n)
  );
  return inv;
}

export function solveInverseKinematics(
  currentJoints: JointAngles,
  target: THREE.Vector3,
  targetEuler?: THREE.Euler
): IKResult {
  const MAX_ITER = 30;
  const POS_TOL = 1.0;
  const ORI_WEIGHT = 0.3;
  const POS_WEIGHT = 1.0;
  const DAMPING = 0.25;
  const STEP_SCALE = 0.45;

  let joints: JointAngles = [...currentJoints] as JointAngles;
  let lastError = Infinity;
  let iter = 0;
  let bestJoints = [...joints] as JointAngles;
  let bestError = Infinity;

  for (iter = 0; iter < MAX_ITER; iter++) {
    const fk = computeForwardKinematics(joints);
    const dPos = new THREE.Vector3().subVectors(target, fk.position);
    const posError = dPos.length();

    let oriErr = new THREE.Vector3(0, 0, 0);
    if (targetEuler) {
      const tq = new THREE.Quaternion().setFromEuler(targetEuler);
      const qErr = new THREE.Quaternion().multiplyQuaternions(
        tq,
        fk.quaternion.clone().invert()
      );
      const axis = new THREE.Vector3();
      let angle = 0;
      qErr.setFromUnitVectors(new THREE.Vector3(1, 0, 0), new THREE.Vector3(1, 0, 0));
      qErr.normalize();
      const w = Math.min(1, Math.max(-1, qErr.w));
      angle = 2 * Math.acos(w);
      if (Math.sin(angle / 2) > 1e-6) {
        axis.set(qErr.x, qErr.y, qErr.z).normalize();
      }
      oriErr = axis.multiplyScalar(angle);
    }

    const totalError = posError * POS_WEIGHT + oriErr.length() * ORI_WEIGHT;
    if (totalError < bestError) {
      bestError = totalError;
      bestJoints = [...joints] as JointAngles;
    }

    if (posError < POS_TOL) {
      lastError = totalError;
      break;
    }

    const J = computeJacobian(joints);
    const Jt = mat6Transpose(J);
    const JJt = mat6Mul(J, Jt);

    for (let k = 0; k < 6; k++) {
      JJt[k][k] += DAMPING * DAMPING;
    }
    const JJtInv = mat6Inverse(JJt);
    if (!JJtInv) break;

    const e = [
      dPos.x * POS_WEIGHT,
      dPos.y * POS_WEIGHT,
      dPos.z * POS_WEIGHT,
      oriErr.x * ORI_WEIGHT,
      oriErr.y * ORI_WEIGHT,
      oriErr.z * ORI_WEIGHT,
    ];

    const delta = mat6VecMul(Jt, mat6VecMul(JJtInv, e));
    let maxDelta = 0;
    for (let k = 0; k < 6; k++) maxDelta = Math.max(maxDelta, Math.abs(delta[k]));
    const scale = maxDelta > 0.15 ? (0.15 / maxDelta) * STEP_SCALE : STEP_SCALE;

    for (let k = 0; k < 6; k++) {
      joints[k] += delta[k] * scale;
    }
    joints = clampJoints(joints);

    if (Math.abs(totalError - lastError) < 1e-5) break;
    lastError = totalError;
  }

  const finalFk = computeForwardKinematics(bestJoints);
  const finalError = finalFk.position.distanceTo(target);
  const reachable = finalError < 15.0;

  return {
    joints: bestJoints,
    positionError: finalError,
    reachable,
    iterations: iter + 1,
  };
}

export function lerpJoints(
  a: JointAngles,
  b: JointAngles,
  t: number
): JointAngles {
  return a.map((v, i) => v + (b[i] - v) * t) as JointAngles;
}

export function catmullRomJoints(
  p0: JointAngles,
  p1: JointAngles,
  p2: JointAngles,
  p3: JointAngles,
  t: number
): JointAngles {
  const t2 = t * t;
  const t3 = t2 * t;
  const result: JointAngles = [0, 0, 0, 0, 0, 0];
  for (let i = 0; i < 6; i++) {
    result[i] =
      0.5 *
      (2 * p1[i] +
        (-p0[i] + p2[i]) * t +
        (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * t2 +
        (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * t3);
  }
  return clampJoints(result);
}
