import React, { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { LinkSegment } from "./LinkSegment";
import { Gripper } from "./Gripper";
import { JointAngles } from "../../kinematics/dhParams";
import { computeForwardKinematics } from "../../kinematics/forwardKinematics";

interface RobotArmProps {
  joints: JointAngles;
  targetJoints: JointAngles;
  showAxes: boolean;
  onFkUpdate?: (res: ReturnType<typeof computeForwardKinematics>) => void;
}

const SMOOTH = 0.18;

export function RobotArm({
  joints,
  targetJoints,
  showAxes,
  onFkUpdate,
}: RobotArmProps) {
  const currentJoints = useRef<JointAngles>([...joints] as JointAngles);
  const lastFkTime = useRef(0);

  const j1Ref = useRef<THREE.Group>(null);
  const j2Ref = useRef<THREE.Group>(null);
  const j3Ref = useRef<THREE.Group>(null);
  const j4Ref = useRef<THREE.Group>(null);
  const j5Ref = useRef<THREE.Group>(null);
  const j6Ref = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    const lerpFactor = 1 - Math.pow(1 - SMOOTH, Math.min(delta * 60, 3));
    for (let i = 0; i < 6; i++) {
      currentJoints.current[i] +=
        (targetJoints[i] - currentJoints.current[i]) * lerpFactor;
    }

    if (j1Ref.current) j1Ref.current.rotation.y = currentJoints.current[0];
    if (j2Ref.current) j2Ref.current.rotation.y = currentJoints.current[1];
    if (j3Ref.current) j3Ref.current.rotation.y = currentJoints.current[2];
    if (j4Ref.current) j4Ref.current.rotation.y = currentJoints.current[3];
    if (j5Ref.current) j5Ref.current.rotation.z = currentJoints.current[4];
    if (j6Ref.current) j6Ref.current.rotation.z = currentJoints.current[5];

    lastFkTime.current += delta;
    if (lastFkTime.current > 0.033 && onFkUpdate) {
      lastFkTime.current = 0;
      const fk = computeForwardKinematics(currentJoints.current);
      onFkUpdate(fk);
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
        <mesh position={[0, 106, 0]}>
          <ringGeometry args={[100, 106, 72]} />
          <meshBasicMaterial color="#ff8c42" transparent opacity={0.5} />
        </mesh>
        {showAxes && (
          <primitive object={new THREE.AxesHelper(120)} position={baseMount} />
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
              <group ref={j2Ref} position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
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
                          <group ref={j4Ref} position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
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
                                        <group rotation={[0, 0, 0]}>
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
    </group>
  );
}
