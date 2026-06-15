import React from "react";

export function Gripper() {
  return (
    <group position={[0, 0, 0]}>
      <mesh position={[0, 10, 0]}>
        <cylinderGeometry args={[22, 28, 28, 24]} />
        <meshStandardMaterial
          color="#2a4f86"
          metalness={0.75}
          roughness={0.25}
        />
      </mesh>
      <mesh position={[0, 28, 0]}>
        <cylinderGeometry args={[18, 22, 16, 24]} />
        <meshStandardMaterial
          color="#1f3a68"
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      <group position={[0, 44, 0]}>
        <mesh position={[28, 30, 0]} rotation={[0, 0, -0.15]}>
          <boxGeometry args={[10, 70, 18]} />
          <meshStandardMaterial
            color="#ff8c42"
            metalness={0.6}
            roughness={0.35}
            emissive="#ff8c42"
            emissiveIntensity={0.08}
          />
        </mesh>
        <mesh position={[-28, 30, 0]} rotation={[0, 0, 0.15]}>
          <boxGeometry args={[10, 70, 18]} />
          <meshStandardMaterial
            color="#ff8c42"
            metalness={0.6}
            roughness={0.35}
            emissive="#ff8c42"
            emissiveIntensity={0.08}
          />
        </mesh>
        <mesh position={[30, 62, 0]} rotation={[0, 0, -0.4]}>
          <boxGeometry args={[14, 26, 20]} />
          <meshStandardMaterial
            color="#f97316"
            metalness={0.5}
            roughness={0.4}
          />
        </mesh>
        <mesh position={[-30, 62, 0]} rotation={[0, 0, 0.4]}>
          <boxGeometry args={[14, 26, 20]} />
          <meshStandardMaterial
            color="#f97316"
            metalness={0.5}
            roughness={0.4}
          />
        </mesh>

        <mesh position={[0, 80, 0]}>
          <sphereGeometry args={[3, 8, 8]} />
          <meshBasicMaterial color="#2dd4bf" />
        </mesh>
      </group>

      <mesh position={[0, 58, 0]}>
        <ringGeometry args={[4, 6, 32]} />
        <meshBasicMaterial color="#2dd4bf" transparent opacity={0.9} />
      </mesh>
    </group>
  );
}
