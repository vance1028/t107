import React from "react";
import { radToDeg } from "../../kinematics/dhParams";
import * as THREE from "three";
import { FKResult } from "../../kinematics/forwardKinematics";
import { useRobotStore } from "../../store/useRobotStore";
import { AlertTriangle, CheckCircle2 } from "lucide-react";

interface PoseDisplayProps {
  fk?: FKResult | null;
}

const AXIS_STYLE = [
  { label: "X", color: "text-red-400", ring: "ring-red-500/30", bg: "bg-red-500/10" },
  { label: "Y", color: "text-green-400", ring: "ring-green-500/30", bg: "bg-green-500/10" },
  { label: "Z", color: "text-blue-400", ring: "ring-blue-500/30", bg: "bg-blue-500/10" },
];

const ROT_STYLE = [
  { label: "Rx", color: "text-red-300" },
  { label: "Ry", color: "text-green-300" },
  { label: "Rz", color: "text-blue-300" },
];

export function PoseDisplay({ fk }: PoseDisplayProps) {
  const workspaceReachable = useRobotStore((s) => s.workspaceReachable);
  const targetPos = useRobotStore((s) => s.targetPos);
  const ikMode = useRobotStore((s) => s.ikMode);

  const position: THREE.Vector3 = fk?.position ?? new THREE.Vector3();
  const rotation: THREE.Euler = fk?.rotation ?? new THREE.Euler();

  const rot = [rotation.x, rotation.y, rotation.z];
  const pos = [position.x, position.y, position.z];

  return (
    <div className="mb-4">
      <div className="section-title">
        <span>末端位姿 (世界坐标系)</span>
        {ikMode && (
          <span className="ml-auto">
            {workspaceReachable ? (
              <span className="chip bg-green-500/20 text-green-300 border border-green-500/40">
                <CheckCircle2 size={12} /> 可达区域
              </span>
            ) : (
              <span className="chip bg-red-500/20 text-red-300 border border-red-500/40 animate-pulse">
                <AlertTriangle size={12} /> 超出可达范围
              </span>
            )}
          </span>
        )}
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {AXIS_STYLE.map((axis, i) => (
            <div
              key={axis.label}
              className={`${axis.bg} rounded-lg px-2.5 py-2 ring-1 ${axis.ring} backdrop-blur-xs`}
            >
              <div className={`text-[11px] font-medium ${axis.color} font-mono uppercase tracking-wider`}>
                {axis.label}
              </div>
              <div
                className={`data-value text-[15px] font-semibold ${
                  pos[i] >= 0 ? "text-teal-200" : "text-orange-200"
                }`}
              >
                {pos[i] >= 0 ? "+" : ""}
                {pos[i].toFixed(1)}
                <span className="text-[10px] text-slate-400 ml-0.5">mm</span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-2">
          {ROT_STYLE.map((axis, i) => (
            <div
              key={axis.label}
              className="bg-slate-900/40 rounded-lg px-2.5 py-2 ring-1 ring-white/5"
            >
              <div className={`text-[11px] font-medium ${axis.color} font-mono uppercase tracking-wider`}>
                {axis.label}
              </div>
              <div
                className={`data-value text-[14px] font-semibold ${
                  rot[i] >= 0 ? "text-teal-200" : "text-orange-200"
                }`}
              >
                {rot[i] >= 0 ? "+" : ""}
                {radToDeg(rot[i]).toFixed(1)}
                <span className="text-[10px] text-slate-400 ml-0.5">°</span>
              </div>
            </div>
          ))}
        </div>

        {ikMode && (
          <div className="mt-3 p-2.5 rounded-lg bg-slate-900/50 border border-white/5">
            <div className="text-[11px] font-medium text-slate-400 mb-1 font-mono">
              🎯 目标点坐标
            </div>
            <div className="flex gap-3 font-mono text-[12px]">
              <span className="text-red-300">
                X:{targetPos.x.toFixed(0)}
              </span>
              <span className="text-green-300">
                Y:{targetPos.y.toFixed(0)}
              </span>
              <span className="text-blue-300">
                Z:{targetPos.z.toFixed(0)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
