import React, { useMemo } from "react";
import * as THREE from "three";

interface LinkSegmentProps {
  jointIndex: number;
  length: number;
  rotationAxis: "x" | "y" | "z";
  showAxes: boolean;
  nextAxisOffset?: [number, number, number];
  children?: React.ReactNode;
}

const JOINT_COLORS = [
  "#ef4444",
  "#f97316",
  "#eab308",
  "#22c55e",
  "#06b6d4",
  "#8b5cf6",
];

export function LinkSegment({
  jointIndex,
  length,
  rotationAxis,
  showAxes,
  nextAxisOffset = [0, 0, 0],
  children,
}: LinkSegmentProps) {
  const color = JOINT_COLORS[jointIndex % JOINT_COLORS.length];

  const [linkRTop, linkRBot] = useMemo(() => [22, 24], []);
  const axisRotation: [number, number, number] = useMemo(() => {
    if (rotationAxis === "x") return [0, 0, Math.PI / 2];
    if (rotationAxis === "z") return [Math.PI / 2, 0, 0];
    return [0, 0, 0];
  }, [rotationAxis]);
  const localOffset: [number, number, number] = useMemo(
    () => [0, length / 2, 0],
    [length]
  );

  return (
    <group>
      <group position={localOffset}>
        <mesh castShadow>
          <cylinderGeometry args={[linkRTop, linkRBot, length, 24, 1]} />
          <meshStandardMaterial
            color="#5a6a80"
            metalness={0.55}
            roughness={0.35}
          />
        </mesh>
        <mesh position={[0, -length / 2, 0]}>
          <cylinderGeometry args={[32, 32, 14, 24]} />
          <meshStandardMaterial color="#3a4658" metalness={0.7} roughness={0.25} />
        </mesh>
        <mesh position={[0, length / 2, 0]}>
          <cylinderGeometry args={[30, 32, 14, 24]} />
          <meshStandardMaterial color="#455366" metalness={0.65} roughness={0.28} />
        </mesh>
      </group>

      <group position={[nextAxisOffset[0], nextAxisOffset[1] + length, nextAxisOffset[2]]}>
        <mesh rotation={axisRotation}>
          <torusGeometry args={[34, 6, 12, 36]} />
          <meshStandardMaterial
            color={color}
            metalness={0.6}
            roughness={0.3}
            emissive={color}
            emissiveIntensity={0.15}
          />
        </mesh>
        <mesh rotation={axisRotation}>
          <cylinderGeometry args={[4, 4, 90, 16]} />
          <meshBasicMaterial color={color} transparent opacity={0.9} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[28, 30, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.65} side={THREE.DoubleSide} />
        </mesh>

        {showAxes && (
          <group>
            <mesh position={[40, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[2.2, 2.2, 80, 10]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh position={[82, 0, 0]}>
              <coneGeometry args={[5, 10, 10]} />
              <meshBasicMaterial color="#ef4444" />
            </mesh>
            <mesh position={[0, 40, 0]}>
              <cylinderGeometry args={[2.2, 2.2, 80, 10]} />
              <meshBasicMaterial color="#22c55e" />
            </mesh>
            <mesh position={[0, 82, 0]} rotation={[Math.PI, 0, 0]}>
              <coneGeometry args={[5, 10, 10]} />
              <meshBasicMaterial color="#22c55e" />
            </mesh>
            <mesh position={[0, 0, 40]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[2.2, 2.2, 80, 10]} />
              <meshBasicMaterial color="#3b82f6" />
            </mesh>
            <mesh position={[0, 0, 82]} rotation={[-Math.PI / 2, 0, 0]}>
              <coneGeometry args={[5, 10, 10]} />
              <meshBasicMaterial color="#3b82f6" />
            </mesh>
          </group>
        )}

        {children}
      </group>
    </group>
  );
}
