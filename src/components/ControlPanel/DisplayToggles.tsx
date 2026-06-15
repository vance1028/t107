import React from "react";
import { Eye, EyeOff, Layers, Hand, Move } from "lucide-react";
import { useRobotStore } from "../../store/useRobotStore";

export function DisplayToggles() {
  const showAxes = useRobotStore((s) => s.showAxes);
  const toggleAxes = useRobotStore((s) => s.toggleAxes);
  const showTargetLine = useRobotStore((s) => s.showTargetLine);
  const toggleTargetLine = useRobotStore((s) => s.toggleTargetLine);
  const ikMode = useRobotStore((s) => s.ikMode);
  const toggleIkMode = useRobotStore((s) => s.toggleIkMode);

  const items = [
    {
      icon: showAxes ? Eye : EyeOff,
      label: "显示关节坐标轴",
      desc: "X红 / Y绿 / Z蓝",
      on: showAxes,
      toggle: toggleAxes,
    },
    {
      icon: Layers,
      label: "目标连线",
      desc: "末端 ↔ 目标点",
      on: showTargetLine,
      toggle: toggleTargetLine,
    },
    {
      icon: ikMode ? Hand : Move,
      label: "拖动目标求解 IK",
      desc: ikMode ? "自动逆运动学" : "手动滑块模式",
      on: ikMode,
      toggle: toggleIkMode,
    },
  ];

  return (
    <div className="mb-2">
      <div className="section-title">
        <span>显示 & 模式</span>
      </div>
      <div className="space-y-2.5">
        {items.map(({ icon: Icon, label, desc, on, toggle }, i) => (
          <div
            key={i}
            onClick={toggle}
            className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/30 hover:bg-slate-700/40 cursor-pointer border border-white/5 hover:border-white/10 transition-all group"
          >
            <div
              className={`w-8 h-8 rounded-md flex items-center justify-center shrink-0 transition-all ${
                on
                  ? "bg-gradient-to-br from-accent-amber to-accent-orange text-white shadow-glow"
                  : "bg-slate-700/60 text-slate-400 group-hover:text-slate-300"
              }`}
            >
              <Icon size={15} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12.5px] font-medium text-slate-200">
                {label}
              </div>
              <div className="text-[11px] text-slate-500 font-mono">{desc}</div>
            </div>
            <div className={`toggle-switch ${on ? "on" : ""} shrink-0`} />
          </div>
        ))}
      </div>
    </div>
  );
}
