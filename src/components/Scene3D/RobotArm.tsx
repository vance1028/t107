import React, { useMemo, useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LinkSegment } from "./LinkSegment";
import { Gripper } from "./Gripper";
import { JointAngles, DEFAULT_JOINTS } from "../../kinematics/dhParams";
import { computeForwardKinematics, FKResult } from "../../kinematics/forwardKinematics";
import { solveInverseKinematics } from "../../kinematics/inverseKinematics";
import { useRobotStore } from "../../store/useRobotStore";

export interface RobotArmDriverProps {
  showAxes: boolean;
  onFkUpdate?: (res: FKResult) => void;
}

const SMOOTH = 0.15;
const UI_SYNC_MS = 120;
const FK_NOTIFY_MS = 100;

export function RobotArmDriver({
  showAxes,
  onFkUpdate,
}: RobotArmDriverProps) {
  const joints = useRobotStore((s) => s.joints);
  const setJoints = useRobotStore((s) => s.setJoints);

  const currentJointsRef = useRef<JointAngles>([...DEFAULT_JOINTS] as JointAngles);
  const targetJointsRef = useRef<JointAngles>([...joints] as JointAngles);
  const fkAccumRef = useRef(0);
  const uiSyncAccumRef = useRef(0);
  const lastManualJoints = useRef<JointAngles>([...joints] as JointAngles);
  const modeTickRef = useRef(0);

  useEffect(() => {
    for (let i = 0; i < 6; i++) {
      if (Math.abs(joints[i] - lastManualJoints.current[i]) > 1e-4) {
        targetJointsRef.current = [...joints] as JointAngles;
        lastManualJoints.current = [...joints] as JointAngles;
        break;
      }
    }
  }, [joints]);

  const j1Ref = useRef<THREE.Group>(null);
  const j2Ref = useRef<THREE.Group>(null);
  const j3Ref = useRef<THREE.Group>(null);
  const j4Ref = useRef<THREE.Group>(null);
  const j5Ref = useRef<THREE.Group>(null);
  const j6Ref = useRef<THREE.Group>(null);

  useFrame((_, deltaMs) => {
    const delta = Math.min(deltaMs, 0.1);
    const lerpFactor = 1 - Math.pow(1 - SMOOTH, Math.min(delta * 60, 3));

    for (let i = 0; i < 6; i++) {
      currentJointsRef.current[i] +=
        (targetJointsRef.current[i] - currentJointsRef.current[i]) * lerpFactor;
    }

    if (j1Ref.current) j1Ref.current.rotation.y = currentJointsRef.current[0];
    if (j2Ref.current) j2Ref.current.rotation.y = currentJointsRef.current[1];
    if (j3Ref.current) j3Ref.current.rotation.y = currentJointsRef.current[2];
    if (j4Ref.current) j4Ref.current.rotation.y = currentJointsRef.current[3];
    if (j5Ref.current) j5Ref.current.rotation.z = currentJointsRef.current[4];
    if (j6Ref.current) j6Ref.current.rotation.z = currentJointsRef.current[5];

    fkAccumRef.current += deltaMs;
    if (fkAccumRef.current > FK_NOTIFY_MS / 1000 && onFkUpdate) {
      fkAccumRef.current = 0;
      const fk = computeForwardKinematics(currentJointsRef.current);
      onFkUpdate(fk);
    }

    uiSyncAccumRef.current += deltaMs;
    modeTickRef.current++;
    if (uiSyncAccumRef.current > UI_SYNC_MS / 1000) {
      uiSyncAccumRef.current = 0;
      const ikMode = useRobotStore.getState().ikMode;
      const isPlaying = useRobotStore.getState().isPlaying;
      if (ikMode || isPlaying) {
        const snap = [...currentJointsRef.current] as JointAngles;
        useRobotStore.setState({ joints: snap });
        lastManualJoints.current = [...snap] as JointAngles;
      }
    }
  });

  const baseMount = useMemo<[number, number, number]>(() => [0, 80, 0], []);

  return (
    <group>
      <group position={[0, 0, 0]}>
        <mesh position={[0, 50, 0]} castShadow>
          <cylinderGeometry args={[110, 130, 100, 36]} />
          <meshStandardMaterial
            color="#343d4a"
            metalness={0.7}
            roughness={0.28}
          />
        </mesh>
        <mesh position={[0, 102, 0]}>
          <cylinderGeometry args={[95, 110, 8, 36]} />
          <meshStandardMaterial
            color="#f97316"
            metalness={0.5}
            roughness={0.35}
            emissive="#f97316"
            emissiveIntensity={0.1}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 106, 0]}>
          <ringGeometry args={[100, 106, 72]} />
          <meshBasicMaterial color="#ff8c42" transparent opacity={0.5} />
        </mesh>
        {showAxes && (
          <group position={baseMount}>
            <mesh position={[55, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[2.5, 2.5, 110, 10]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh position={[112, 0, 0]}>
              <coneGeometry args={[6, 12, 10]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0, 55, 0]}>
              <cylinderGeometry args={[2.5, 2.5, 110, 10]} />
              <meshBasicMaterial color="#22c55e" />
            </mesh>
            <mesh position={[0, 112, 0]}>
              <coneGeometry args={[6, 12, 10]} />
              <meshBasicMaterial color="#22c55e" />
            </mesh>
            <mesh position={[0, 0, 55]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[2.5, 2.5, 110, 10]} />
              <meshBasicMaterial color="#3b82f6" />
            </mesh>
            <mesh position={[0, 0, 112]} rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[6, 12, 10]} />
              <meshBasicMaterial color="#3b82f6" />
            </mesh>
          </group>
        )}
      </group>

      <group position={baseMount}>
        <group ref={j1Ref}>
          <mesh position={[0, 35, 0]}>
            <cylinderGeometry args={[60, 70, 70, 28]} />
            <meshStandardMaterial
              color="#242b35"
              metalness={0.75}
              roughness={0.25}
            />
          </mesh>

          <group position={[0, 70, 0]}>
            <LinkSegment
              jointIndex={0}
              length={260}
              rotationAxis="y"
              showAxes={showAxes}
              nextAxisOffset={[75, 0, 0]}
            >
              <group ref={j2Ref} rotation={[0, 0, Math.PI / 2]}>
                <group rotation={[0, 0, -Math.PI / 2]}>
                  <LinkSegment
                    jointIndex={1}
                    length={280}
                    rotationAxis="y"
                    showAxes={showAxes}
                    nextAxisOffset={[350, 0, 0]}
                  >
                    <group ref={j3Ref} rotation={[0, 0, Math.PI / 2]}>
                      <group rotation={[0, 0, -Math.PI / 2]}>
                        <LinkSegment
                          jointIndex={2}
                          length={60}
                          rotationAxis="y"
                          showAxes={showAxes}
                          nextAxisOffset={[0, 0, -80]}
                        >
                          <group ref={j4Ref} rotation={[-Math.PI / 2, 0, 0]}>
                            <group rotation={[Math.PI / 2, 0, 0]}>
                              <LinkSegment
                                jointIndex={3}
                                length={260}
                                rotationAxis="y"
                                showAxes={showAxes}
                              >
                                <group ref={j5Ref} position={[0, 260, 0]}>
                                  <group rotation={[0, Math.PI / 2, 0]}>
                                    <LinkSegment
                                      jointIndex={4}
                                      length={40}
                                      rotationAxis="z"
                                      showAxes={showAxes}
                                    >
                                      <group ref={j6Ref} position={[0, 40, 0]}>
                                        <LinkSegment
                                          jointIndex={5}
                                          length={60}
                                          rotationAxis="z"
                                          showAxes={showAxes}
                                        >
                                          <group position={[0, 60, 0]}>
                                            <Gripper />
                                          </group>
                                        </LinkSegment>
                                      </group>
                                    </LinkSegment>
                                  </group>
                                </group>
                              </LinkSegment>
                            </group>
                          </group>
                        </LinkSegment>
                      </group>
                    </group>
                  </LinkSegment>
                </group>
              </group>
            </LinkSegment>
          </group>
        </group>
      </group>

      <RobotIkAndPlaybackDriver targetJointsRef={targetJointsRef} />
    </group>
  );
}

function RobotIkAndPlaybackDriver({
  targetJointsRef,
}: {
  targetJointsRef: React.MutableRefObject<JointAngles>;
}) {
  const ikAccumRef = useRef(0);
  const playAccumRef = useRef(0);
  const ikCounter = useRef(0);
  const smoothProgressRef = useRef(0);
  const lastIdxRef = useRef(-1);

  useFrame((_, deltaMs) => {
    const state = useRobotStore.getState();
    const delta = Math.min(deltaMs, 0.1);

    if (state.isPlaying && state.waypoints.length >= 2) {
      playAccumRef.current += deltaMs;
      const SPEED = 0.55;
      if (lastIdxRef.current !== state.currentWaypointIdx) {
        smoothProgressRef.current = 0;
        lastIdxRef.current = state.currentWaypointIdx;
      }
      smoothProgressRef.current = Math.min(
        1,
        smoothProgressRef.current + delta * SPEED
      );
      useRobotStore.setState({ playbackProgress: smoothProgressRef.current });

      const t = smoothProgressRef.current;
      const n = state.waypoints.length;
      const idx = Math.max(0, Math.min(n - 1, state.currentWaypointIdx));
      const p0 = state.waypoints[Math.max(0, idx - 1)].joints;
      const p1 = state.waypoints[idx].joints;
      const p2 = state.waypoints[Math.min(n - 1, idx + 1)].joints;
      const p3 = state.waypoints[Math.min(n - 1, idx + 2)].joints;

      const t2 = t * t;
      const t3 = t2 * t;
      const out: JointAngles = [0, 0, 0, 0, 0, 0];
      for (let i = 0; i < 6; i++) {
        out[i] =
          0.5 *
          (2 * p1[i] +
            (-p0[i] + p2[i]) * t +
            (2 * p0[i] - 5 * p1[i] + 4 * p2[i] - p3[i]) * t2 +
            (-p0[i] + 3 * p1[i] - 3 * p2[i] + p3[i]) * t3);
      }
      const DH_PARAMS_LIMITS = [
        [-Math.PI, Math.PI],
        [-Math.PI, 0],
        [-Math.PI / 2, Math.PI / 2],
        [-Math.PI, Math.PI],
        [-Math.PI, Math.PI],
        [-Math.PI, Math.PI],
      ];
      for (let i = 0; i < 6; i++) {
        const [mn, mx] = DH_PARAMS_LIMITS[i];
        out[i] = Math.max(mn, Math.min(mx, out[i]));
      }
      targetJointsRef.current = out;

      if (t >= 0.999) {
        const nextIdx = idx + 1;
        if (nextIdx >= n) {
          useRobotStore.setState({
            isPlaying: false,
            currentWaypointIdx: -1,
            playbackProgress: 0,
          });
          lastIdxRef.current = -1;
          smoothProgressRef.current = 0;
        } else {
          useRobotStore.setState({
            currentWaypointIdx: nextIdx,
            playbackProgress: 0,
          });
          lastIdxRef.current = nextIdx;
          smoothProgressRef.current = 0;
        }
      }
    } else if (state.ikMode) {
      ikAccumRef.current += deltaMs;
      if (ikAccumRef.current > 0.09) {
        ikAccumRef.current = 0;
        ikCounter.current++;
        const cur = [...targetJointsRef.current] as JointAngles;
        const res = solveInverseKinematics(
          cur,
          new THREE.Vector3(state.targetPos.x, state.targetPos.y, state.targetPos.z)
        );
        targetJointsRef.current = res.joints;
        useRobotStore.setState({ workspaceReachable: res.reachable });
      }
    }
  });

  return null;
}
