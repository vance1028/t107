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

const LINK_GEO_KEYS = ["0", "1", "2", "3", "4", "5"];

export function LinkSegment({
  jointIndex,
  length,
  rotationAxis,
  showAxes,
  nextAxisOffset = [0, 0, 0],
  children,
}: LinkSegmentProps) {
  const color = JOINT_COLORS[jointIndex % JOINT_COLORS.length];

  const linkGeo = useMemo(() => {
    return new THREE.CylinderGeometry(22, 24, length, 24, 1);
  }, [length, LINK_GEO_KEYS[jointIndex]]);

  const jointGeo = useMemo(() => new THREE.TorusGeometry(34, 6, 12, 36), [jointIndex]);
  const axisIndicatorGeo = useMemo(() => new THREE.CylinderGeometry(4, 4, 90, 16), [jointIndex]);

  const localOffset: [number, number, number] = useMemo(() => {
    if (rotationAxis === "x") return [0, length / 2, 0];
    if (rotationAxis === "z") return [0, length / 2, 0];
    return [0, length / 2, 0];
  }, [length, rotationAxis]);

  const axisRotation: [number, number, number] = useMemo(() => {
    if (rotationAxis === "x") return [0, 0, Math.PI / 2];
    if (rotationAxis === "z") return [Math.PI / 2, 0, 0];
    return [0, 0, 0];
  }, [rotationAxis]);

  return (
    <group>
      <group position={localOffset}>
        <mesh geometry={linkGeo} castShadow>
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
          <primitive object={jointGeo} attach="geometry" />
          <meshStandardMaterial
            color={color}
            metalness={0.6}
            roughness={0.3}
            emissive={color}
            emissiveIntensity={0.15}
          />
        </mesh>
        <mesh rotation={axisRotation}>
          <primitive object={axisIndicatorGeo} attach="geometry" />
          <meshBasicMaterial color={color} transparent opacity={0.9} />
        </mesh>
        <mesh rotation={axisRotation}>
          <ringGeometry args={[28, 30, 48]} />
          <meshBasicMaterial color={color} transparent opacity={0.65} side={THREE.DoubleSide} />
        </mesh>

        {showAxes && (
          <group>
            <lineSegments>
              <edgesGeometry
                attach="geometry"
                args={[new THREE.AxesHelper(60).geometry as THREE.BufferGeometry]}
              />
              <lineBasicMaterial attach="material" color={undefined} vertexColors />
            </lineSegments>
            <primitive object={new THREE.AxesHelper(60)} />
          </group>
        )}

        {children}
      </group>
    </group>
  );
}
