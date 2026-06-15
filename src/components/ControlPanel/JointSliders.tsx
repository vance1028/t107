import React from "react";
import { useRobotStore } from "../../store/useRobotStore";
import { radToDeg, degToRad, DH_PARAMS } from "../../kinematics/dhParams";

const JOINT_LABELS = ["J1 · 底座", "J2 · 肩部", "J3 · 肘部", "J4 · 腕1", "J5 · 腕2", "J6 · 法兰"];
const JOINT_DOTS = [
  "bg-red-500",
  "bg-orange-500",
  "bg-yellow-500",
  "bg-green-500",
  "bg-cyan-500",
  "bg-violet-500",
];

export function JointSliders() {
  const joints = useRobotStore((s) => s.joints);
  const setJoint = useRobotStore((s) => s.setJoint);
  const setJoints = useRobotStore((s) => s.setJoints);
  const ikMode = useRobotStore((s) => s.ikMode);

  const handleSliderChange = (idx: number, value: number) => {
    setJoint(idx, value);
  };

  const handleInputChange = (idx: number, valueStr: string) => {
    const deg = parseFloat(valueStr);
    if (!isNaN(deg)) {
      setJoint(idx, degToRad(deg));
    }
  };

  const resetAll = () => {
    const init: [number, number, number, number, number, number] = [
      0, -Math.PI / 3, Math.PI / 3, 0, Math.PI / 4, 0
    ];
    setJoints(init);
  };

  return (
    <div className="mb-4">
      <div className="section-title">
        <span>关节控制</span>
        <span className="ml-auto flex items-center gap-2">
          <button
            onClick={resetAll}
            className="btn-ghost !py-1 !px-3 !text-[11px]"
            title="回到初始姿态"
          >
            ↺ 复位
          </button>
          <span
            className={`chip ${
              ikMode
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                : "bg-teal-500/20 text-teal-300 border border-teal-500/40"
            }`}
          >
            {ikMode ? "IK 模式" : "手动模式"}
          </span>
        </span>
      </div>

      <div className="space-y-3">
        {joints.map((j, idx) => {
          const deg = radToDeg(j);
          const minDeg = radToDeg(DH_PARAMS[idx].min);
          const maxDeg = radToDeg(DH_PARAMS[idx].max);
          const pct =
            ((deg - minDeg) / (maxDeg - minDeg)) * 100;
          return (
            <div key={idx} className="animate-slide-right" style={{ animationDelay: `${idx * 40}ms` }}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${JOINT_DOTS[idx]} ring-2 ring-white/20`}
                  />
                  <span className="text-[12px] font-medium text-slate-300 font-sans">
                    {JOINT_LABELS[idx]}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    type="number"
                    step="1"
                    min={minDeg}
                    max={maxDeg}
                    value={deg.toFixed(1)}
                    onChange={(e) => handleInputChange(idx, e.target.value)}
                    className="joint-number"
                  />
                  <span className="text-[11px] text-slate-400 w-3">°</span>
                </div>
              </div>
              <div className="relative">
                <input
                  type="range"
                  className="joint-slider"
                  min={minDeg}
                  max={maxDeg}
                  step="0.1"
                  value={deg}
                  onChange={(e) =>
                    handleSliderChange(idx, degToRad(parseFloat(e.target.value)))
                  }
                />
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-0.5 px-1">
                  <span>{minDeg.toFixed(0)}°</span>
                  <span className="text-accent-amber">{pct.toFixed(0)}%</span>
                  <span>{maxDeg.toFixed(0)}°</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
