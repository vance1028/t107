import React, { useRef, useMemo } from "react";
import { useFrame, ThreeEvent } from "@react-three/fiber";
import { Line } from "@react-three/drei";
import * as THREE from "three";
import { useRobotStore } from "../../store/useRobotStore";

interface TargetMarkerProps {
  eePosition?: THREE.Vector3;
  showLine: boolean;
}

export function TargetMarker({ eePosition, showLine }: TargetMarkerProps) {
  const setTargetPos = useRobotStore((s) => s.setTargetPos);
  const target = useRobotStore((s) => s.targetPos);
  const reachable = useRobotStore((s) => s.workspaceReachable);
  const ikMode = useRobotStore((s) => s.ikMode);

  const haloRef = useRef<THREE.Mesh>(null);
  const dragging = useRef(false);
  const downInfo = useRef<{ x: number; y: number } | null>(null);
  const downPos = useRef<{ x: number; y: number; z: number }>({
    x: 0,
    y: 0,
    z: 0,
  });

  const linePoints = useMemo(() => {
    const p1 = new THREE.Vector3(target.x, target.y, target.z);
    const p2 = eePosition?.clone() ?? new THREE.Vector3(target.x, target.y + 100, target.z);
    return [p1, p2] as [THREE.Vector3, THREE.Vector3];
  }, [target.x, target.y, target.z, eePosition?.x, eePosition?.y, eePosition?.z]);

  const lineColor = reachable ? "#2dd4bf" : "#ef4444";

  useFrame((state, delta) => {
    if (haloRef.current) {
      const t = state.clock.elapsedTime;
      const s = 1 + Math.sin(t * 2.2) * 0.08;
      haloRef.current.scale.setScalar(s);
      const halo = haloRef.current.material as THREE.MeshBasicMaterial;
      if (halo) halo.opacity = 0.35 + Math.sin(t * 2) * 0.12;
    }

    if (dragging.current && downInfo.current) {
      const pointer = state.pointer;
      const dx = pointer.x - downInfo.current.x;
      const dy = pointer.y - downInfo.current.y;
      if (Math.abs(dx) > 0.0001 || Math.abs(dy) > 0.0001) {
        const scale = 1400;
        const camDir = new THREE.Vector3();
        state.camera.getWorldDirection(camDir);
        const right = new THREE.Vector3()
          .crossVectors(camDir, new THREE.Vector3(0, 1, 0))
          .normalize();
        const up = new THREE.Vector3(0, 1, 0);
        const shift = new THREE.Vector3()
          .addScaledVector(right, dx * scale)
          .addScaledVector(up, dy * scale);

        const nx = Math.max(-1200, Math.min(1200, downPos.current.x + shift.x));
        const ny = Math.max(80, Math.min(1400, downPos.current.y + shift.y));
        const nz = Math.max(-1200, Math.min(1200, downPos.current.z + shift.z));
        setTargetPos(nx, ny, nz);
      }
    }
  });

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    (e.target as unknown as HTMLElement).setPointerCapture?.(e.pointerId);
    dragging.current = true;
    downInfo.current = { x: e.pointer.x, y: e.pointer.y };
    downPos.current = { x: target.x, y: target.y, z: target.z };
  };
  const handlePointerUp = (e: ThreeEvent<PointerEvent>) => {
    dragging.current = false;
    downInfo.current = null;
  };

  const color = ikMode ? (reachable ? "#ff8c42" : "#ef4444") : "#a0aec0";
  const emissive = ikMode ? (reachable ? "#ff8c42" : "#ef4444") : "#475569";

  return (
    <group>
      <group position={[target.x, target.y, target.z]}>
        <mesh
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          <sphereGeometry args={[22, 28, 28]} />
          <meshStandardMaterial
            color={color}
            emissive={emissive}
            emissiveIntensity={ikMode ? 0.6 : 0.2}
            metalness={0.35}
            roughness={0.25}
            transparent
            opacity={0.92}
          />
        </mesh>
        <mesh ref={haloRef}>
          <sphereGeometry args={[34, 28, 28]} />
          <meshBasicMaterial
            color={emissive}
            transparent
            opacity={0.3}
            depthWrite={false}
            side={THREE.BackSide}
          />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[44, 48, 48]} />
          <meshBasicMaterial
            color={emissive}
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
        <group>
          <mesh position={[0, 0, 0]}>
            <sphereGeometry args={[4, 12, 12]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          {reachable && (
            <>
              <mesh position={[80, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
                <cylinderGeometry args={[2, 2, 160, 10]} />
                <meshBasicMaterial color="#ef4444" />
              </mesh>
              <mesh position={[0, 80, 0]}>
                <cylinderGeometry args={[2, 2, 160, 10]} />
                <meshBasicMaterial color="#22c55e" />
              </mesh>
              <mesh position={[0, 0, 80]} rotation={[Math.PI / 2, 0, 0]}>
                <cylinderGeometry args={[2, 2, 160, 10]} />
                <meshBasicMaterial color="#3b82f6" />
              </mesh>
            </>
          )}
        </group>
      </group>

      {showLine && eePosition && (
        <Line
          points={linePoints}
          color={lineColor}
          lineWidth={2}
          transparent
          opacity={0.85}
          dashed
          dashScale={1.5}
          dashSize={14}
          gapSize={8}
        />
      )}
    </group>
  );
}
