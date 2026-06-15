import React from "react";
import { FKResult } from "../../kinematics/forwardKinematics";
import { JointSliders } from "./JointSliders";
import { PoseDisplay } from "./PoseDisplay";
import { WaypointPanel } from "./WaypointPanel";
import { DisplayToggles } from "./DisplayToggles";
import { Bot } from "lucide-react";

interface ControlPanelProps {
  fk?: FKResult | null;
}

export function ControlPanel({ fk }: ControlPanelProps) {
  return (
    <aside
      className="panel-card shadow-panel h-full flex flex-col overflow-hidden"
      style={{ width: 340 }}
    >
      <div className="px-4 py-3 flex items-center gap-2.5 border-b border-white/5 bg-gradient-to-r from-space-800/80 to-transparent">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-amber to-accent-orange flex items-center justify-center shadow-glow">
          <Bot size={20} className="text-white" strokeWidth={2.2} />
        </div>
        <div>
          <h1
            className="text-[15px] font-bold text-white leading-tight"
            style={{ fontFamily: "'Space Grotesk', 'PingFang SC', sans-serif" }}
          >
            6-Axis 机械臂控制台
          </h1>
          <p className="text-[11px] text-slate-400 font-mono leading-tight mt-0.5">
            Robot Arm Visualization · IK Solver
          </p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        <PoseDisplay fk={fk} />
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />
        <JointSliders />
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />
        <WaypointPanel />
        <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-2" />
        <DisplayToggles />
      </div>

      <div className="px-4 py-2.5 border-t border-white/5 text-[10.5px] text-slate-500 font-mono bg-slate-900/40 flex items-center justify-between">
        <span>📐 DH-6R · DLS IK</span>
        <span className="text-accent-teal">v1.0</span>
      </div>
    </aside>
  );
}
