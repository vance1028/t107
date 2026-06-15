import * as THREE from "three";
import { DH_PARAMS, JointAngles } from "./dhParams";

export interface FKResult {
  position: THREE.Vector3;
  rotation: THREE.Euler;
  quaternion: THREE.Quaternion;
  matrix: THREE.Matrix4;
  jointMatrices: THREE.Matrix4[];
  jointPositions: THREE.Vector3[];
}

const _m = new THREE.Matrix4();
const _pos = new THREE.Vector3();
const _q = new THREE.Quaternion();
const _e = new THREE.Euler();

export function computeForwardKinematics(joints: JointAngles): FKResult {
  const jointMatrices: THREE.Matrix4[] = [];
  const jointPositions: THREE.Vector3[] = [];

  let T = new THREE.Matrix4().identity();
  jointMatrices.push(T.clone());
  jointPositions.push(new THREE.Vector3(0, 0, 0));

  for (let i = 0; i < 6; i++) {
    const dh = DH_PARAMS[i];
    const theta = dh.thetaOffset + joints[i];

    const cosT = Math.cos(theta);
    const sinT = Math.sin(theta);
    const cosA = Math.cos(dh.alpha);
    const sinA = Math.sin(dh.alpha);

    const A = new THREE.Matrix4();
    A.set(
      cosT, -sinT * cosA, sinT * sinA, dh.a * cosT,
      sinT, cosT * cosA, -cosT * sinA, dh.a * sinT,
      0, sinA, cosA, dh.d,
      0, 0, 0, 1
    );

    T = T.multiply(A);
    jointMatrices.push(T.clone());

    _pos.setFromMatrixPosition(T);
    jointPositions.push(_pos.clone());
  }

  const endMatrix = jointMatrices[6];
  _pos.setFromMatrixPosition(endMatrix);
  _q.setFromRotationMatrix(endMatrix.extractRotation(_m.copy(endMatrix)));
  _e.setFromQuaternion(_q);

  return {
    position: _pos.clone(),
    rotation: _e.clone(),
    quaternion: _q.clone(),
    matrix: endMatrix.clone(),
    jointMatrices,
    jointPositions,
  };
}

export function computeJacobian(joints: JointAngles): number[][] {
  const eps = 1e-4;
  const J: number[][] = Array.from({ length: 6 }, () => new Array(6).fill(0));

  const base = computeForwardKinematics(joints);
  const basePos = base.position;
  const baseEuler = base.rotation;

  for (let col = 0; col < 6; col++) {
    const jittered = [...joints] as JointAngles;
    jittered[col] += eps;
    const perturbed = computeForwardKinematics(jittered);
    const dP = perturbed.position.clone().sub(basePos).divideScalar(eps);
    const dE = new THREE.Vector3(
      perturbed.rotation.x - baseEuler.x,
      perturbed.rotation.y - baseEuler.y,
      perturbed.rotation.z - baseEuler.z
    ).divideScalar(eps);

    J[0][col] = dP.x;
    J[1][col] = dP.y;
    J[2][col] = dP.z;
    J[3][col] = dE.x;
    J[4][col] = dE.y;
    J[5][col] = dE.z;
  }
  return J;
}
