import React, { useRef, useState, useEffect, useMemo } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, GizmoHelper, GizmoViewport } from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import { Ground } from "./Ground";
import { RobotArm } from "./RobotArm";
import { TargetMarker } from "./TargetMarker";
import { useRobotStore } from "../../store/useRobotStore";
import {
  computeForwardKinematics,
  FKResult,
} from "../../kinematics/forwardKinematics";
import {
  solveInverseKinematics,
  catmullRomJoints,
} from "../../kinematics/inverseKinematics";
import {
  JointAngles,
  clampJoints,
} from "../../kinematics/dhParams";

export interface Scene3DHandle {
  getFkResult: () => FKResult | null;
}

function SceneInternals({
  onFkUpdate,
}: {
  onFkUpdate: (fk: FKResult) => void;
}) {
  const joints = useRobotStore((s) => s.joints);
  const targetJoints = useRobotStore((s) => s.targetJoints);
  const setTargetJoints = useRobotStore((s) => s.setTargetJoints);
  const setJoints = useRobotStore((s) => s.setJoints);
  const ikMode = useRobotStore((s) => s.ikMode);
  const targetPos = useRobotStore((s) => s.targetPos);
  const setWorkspaceReachable = useRobotStore((s) => s.setWorkspaceReachable);
  const showAxes = useRobotStore((s) => s.showAxes);
  const showTargetLine = useRobotStore((s) => s.showTargetLine);
  const waypoints = useRobotStore((s) => s.waypoints);
  const isPlaying = useRobotStore((s) => s.isPlaying);
  const stopPlayback = useRobotStore((s) => s.stopPlayback);
  const currentWaypointIdx = useRobotStore((s) => s.currentWaypointIdx);
  const setCurrentWaypointIdx = useRobotStore((s) => s.setCurrentWaypointIdx);
  const playbackProgress = useRobotStore((s) => s.playbackProgress);
  const setPlaybackProgress = useRobotStore((s) => s.setPlaybackProgress);
  const setIkMode = useRobotStore((s) => s.setIkMode);

  const [eePos, setEePos] = useState<THREE.Vector3>(
    new THREE.Vector3(400, 400, 200)
  );
  const ikCounter = useRef(0);
  const smoothTarget = useRef<JointAngles>([...joints] as JointAngles);
  const smoothProgress = useRef(playbackProgress);
  const lastWpIdx = useRef(currentWaypointIdx);

  useEffect(() => {
    if (!ikMode) setTargetJoints(joints);
    smoothTarget.current = [...targetJoints] as JointAngles;
  }, [ikMode, joints, targetJoints, setTargetJoints]);

  useFrame((_, delta) => {
    if (isPlaying && waypoints.length >= 2) {
      const SPEED = 0.55;
      let idx = currentWaypointIdx;
      if (lastWpIdx.current !== idx) {
        smoothProgress.current = 0;
        lastWpIdx.current = idx;
      }
      smoothProgress.current = Math.min(
        1,
        smoothProgress.current + delta * SPEED
      );
      const t = smoothProgress.current;
      setPlaybackProgress(t);

      const n = waypoints.length;
      const p0 = waypoints[Math.max(0, idx - 1)].joints;
      const p1 = waypoints[idx].joints;
      const p2 = waypoints[Math.min(n - 1, idx + 1)].joints;
      const p3 = waypoints[Math.min(n - 1, idx + 2)].joints;

      const newJoints = catmullRomJoints(p0, p1, p2, p3, t);
      setTargetJoints(newJoints);
      setJoints(newJoints);

      if (t >= 0.999) {
        const nextIdx = idx + 1;
        if (nextIdx >= n) {
          stopPlayback();
          setCurrentWaypointIdx(-1);
          smoothProgress.current = 0;
        } else {
          setCurrentWaypointIdx(nextIdx);
          smoothProgress.current = 0;
          lastWpIdx.current = nextIdx;
        }
      }
    } else if (ikMode) {
      ikCounter.current += delta;
      if (ikCounter.current > 0.04) {
        ikCounter.current = 0;
        const curTarget = clampJoints([...smoothTarget.current] as JointAngles);
        const res = solveInverseKinematics(
          curTarget,
          new THREE.Vector3(targetPos.x, targetPos.y, targetPos.z)
        );
        setWorkspaceReachable(res.reachable);
        smoothTarget.current = res.joints;
        setTargetJoints(res.joints);
        setJoints(res.joints);
      }
    }
  });

  const handleFkUpdate = (fk: FKResult) => {
    setEePos(fk.position.clone());
    onFkUpdate(fk);
  };

  return (
    <>
      <color attach="background" args={["#050a16"]} />
      <fogExp2 attach="fog" args={["#050a16", 0.0008]} />

      <ambientLight intensity={0.45} color="#a5b4fc" />
      <hemisphereLight args={["#93c5fd", "#1e293b", 0.55]} />
      <directionalLight
        position={[900, 1200, 600]}
        intensity={1.15}
        color="#fff1e0"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight
        position={[-800, 500, -700]}
        intensity={0.35}
        color="#67e8f9"
      />
      <pointLight
        position={[0, 900, 0]}
        intensity={0.5}
        color="#fca5a5"
        distance={1800}
      />

      <Ground />
      <RobotArm
        joints={joints}
        targetJoints={targetJoints}
        showAxes={showAxes}
        onFkUpdate={handleFkUpdate}
      />
      <TargetMarker eePosition={eePos} showLine={showTargetLine} />

      <OrbitControls
        makeDefault
        target={[0, 300, 0]}
        enableDamping
        dampingFactor={0.08}
        minDistance={200}
        maxDistance={3200}
        minPolarAngle={0.05}
        maxPolarAngle={Math.PI / 2 - 0.02}
      />

      <GizmoHelper alignment="bottom-left" margin={[80, 80]}>
        <GizmoViewport
          axisColors={["#ef4444", "#22c55e", "#3b82f6"]}
          labelColor="white"
        />
      </GizmoHelper>

      <EffectComposer multisampling={8}>
        <Bloom
          intensity={0.38}
          luminanceThreshold={1.1}
          luminanceSmoothing={0.2}
          mipmapBlur
        />
        <Vignette eskil={false} offset={0.25} darkness={0.85} />
      </EffectComposer>
    </>
  );
}

function FogScene() {
  const { scene } = useThree();
  useEffect(() => {
    scene.background = new THREE.Color("#050a16");
    scene.fog = new THREE.FogExp2("#050a16", 0.0008);
  }, [scene]);
  return null;
}

interface Scene3DProps {
  onFkUpdate?: (fk: FKResult) => void;
}

export function Scene3D({ onFkUpdate }: Scene3DProps) {
  const fkCallback = useMemo(
    () => (fk: FKResult) => onFkUpdate?.(fk),
    [onFkUpdate]
  );

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{
        position: [700, 600, 900],
        fov: 50,
        near: 1,
        far: 8000,
      }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <FogScene />
      <SceneInternals onFkUpdate={fkCallback} />
    </Canvas>
  );
}
