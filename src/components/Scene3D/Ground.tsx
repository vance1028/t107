import React from "react";

export function Ground() {
  return (
    <group>
      <gridHelper
        args={[2400, 48, 0x2dd4bf, 0x163a5b]}
        position={[0, 0, 0]}
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.1, 0]} receiveShadow>
        <circleGeometry args={[2000, 64]} />
        <meshStandardMaterial
          color="#07101f"
          transparent
          opacity={0.85}
          metalness={0.2}
          roughness={0.95}
        />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[150, 155, 64]} />
        <meshBasicMaterial color="#ff8c42" transparent opacity={0.65} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1200, 1205, 128]} />
        <meshBasicMaterial color="#0d9488" transparent opacity={0.3} />
      </mesh>
      <group position={[0, 0, 0]}>
        <mesh position={[600, 1, 0]}>
          <cylinderGeometry args={[1, 1, 3, 6]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
        <mesh position={[0, 1, 600]}>
          <cylinderGeometry args={[1, 1, 3, 6]} />
          <meshBasicMaterial color="#3b82f6" />
        </mesh>
      </group>
    </group>
  );
}
