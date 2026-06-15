import React, { useState, useCallback, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { Ground } from "./Ground";
import { RobotArmDriver } from "./RobotArm";
import { TargetMarker } from "./TargetMarker";
import { useRobotStore } from "../../store/useRobotStore";
import { FKResult } from "../../kinematics/forwardKinematics";

interface Scene3DProps {
  onFkUpdate?: (fk: FKResult) => void;
}

function SceneLights() {
  return (
    <>
      <ambientLight intensity={0.5} color="#a5b4fc" />
      <hemisphereLight args={["#93c5fd", "#1e293b", 0.6]} />
      <directionalLight
        position={[900, 1200, 600]}
        intensity={1.2}
        color="#fff1e0"
      />
      <directionalLight
        position={[-800, 500, -700]}
        intensity={0.4}
        color="#67e8f9"
      />
      <pointLight position={[0, 900, 0]} intensity={0.55} color="#fca5a5" distance={1800} />
    </>
  );
}

function SceneInner({
  onFkUpdate,
}: {
  onFkUpdate?: (fk: FKResult) => void;
}) {
  const showAxes = useRobotStore((s) => s.showAxes);
  const showTargetLine = useRobotStore((s) => s.showTargetLine);
  const [eePos, setEePos] = useState<THREE.Vector3 | undefined>(undefined);

  const handleFk = useCallback(
    (fk: FKResult) => {
      setEePos((prev) => {
        if (!prev) return fk.position.clone();
        if (
          Math.abs(prev.x - fk.position.x) < 0.4 &&
          Math.abs(prev.y - fk.position.y) < 0.4 &&
          Math.abs(prev.z - fk.position.z) < 0.4
        ) {
          return prev;
        }
        return fk.position.clone();
      });
      onFkUpdate?.(fk);
    },
    [onFkUpdate]
  );

  return (
    <>
      <color attach="background" args={["#050a16"]} />
      <fogExp2 attach="fog" args={["#050a16", 0.0008]} />

      <SceneLights />
      <Ground />
      <RobotArmDriver showAxes={showAxes} onFkUpdate={handleFk} />
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
    </>
  );
}

export function Scene3D({ onFkUpdate }: Scene3DProps) {
  const fkCallback = useMemo(
    () => (fk: FKResult) => onFkUpdate?.(fk),
    [onFkUpdate]
  );

  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{
        position: [700, 600, 900],
        fov: 50,
        near: 1,
        far: 8000,
      }}
      gl={{
        antialias: true,
        powerPreference: "high-performance",
        alpha: false,
      }}
    >
      <SceneInner onFkUpdate={fkCallback} />
    </Canvas>
  );
}
