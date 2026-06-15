import React, { useEffect, useState } from "react";
import { Activity, Cpu, Target, Zap } from "lucide-react";
import { useRobotStore } from "../store/useRobotStore";

export function StatusBar() {
  const ikMode = useRobotStore((s) => s.ikMode);
  const reachable = useRobotStore((s) => s.workspaceReachable);
  const waypoints = useRobotStore((s) => s.waypoints);
  const joints = useRobotStore((s) => s.joints);
  const isPlaying = useRobotStore((s) => s.isPlaying);
  const currentIdx = useRobotStore((s) => s.currentWaypointIdx);

  const [fps, setFps] = useState(60);
  const [lastTime] = useState(() => performance.now());
  const [frames, setFrames] = useState(0);

  useEffect(() => {
    let raf = 0;
    let t0 = performance.now();
    let f = 0;
    const tick = () => {
      f++;
      const now = performance.now();
      if (now - t0 >= 500) {
        const currentFps = Math.round((f * 1000) / (now - t0));
        setFps(currentFps);
        f = 0;
        t0 = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [lastTime]);

  const avgJoint = joints.reduce((a, b) => a + Math.abs(b), 0) / joints.length;

  return (
    <header className="h-10 px-4 flex items-center gap-6 border-b border-white/5 bg-gradient-to-r from-space-900 via-space-900/95 to-space-900 backdrop-blur-sm z-10">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-accent-teal animate-pulse shadow-[0_0_10px_#2dd4bf]" />
        <span className="text-[12px] font-semibold text-white font-display tracking-wide">
          ROBOTIC ARM STUDIO
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span
          className={`chip border ${
            ikMode
              ? reachable
                ? "bg-green-500/15 text-green-300 border-green-500/40"
                : "bg-red-500/15 text-red-300 border-red-500/40 animate-pulse"
              : "bg-cyan-500/15 text-cyan-300 border-cyan-500/40"
          }`}
        >
          <Target size={11} />
          {ikMode
            ? reachable
              ? "逆运动学 · 可达"
              : "⚠️ 超出可达范围"
            : "正运动学 · 手动"}
        </span>
      </div>

      {isPlaying && (
        <div className="chip bg-amber-500/15 text-amber-300 border border-amber-500/40 animate-pulse">
          <Zap size={11} />
          轨迹播放 · {Math.max(1, currentIdx + 1)}/{waypoints.length}
        </div>
      )}

      <div className="flex-1" />

      <div className="flex items-center gap-5 text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-1.5">
          <Activity size={12} className="text-accent-teal" />
          <span>
            关节能量{" "}
            <span className="text-accent-teal font-semibold">
              {avgJoint.toFixed(2)} rad
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <Cpu size={12} className="text-accent-amber" />
          <span>
            帧率{" "}
            <span
              className={`font-semibold ${
                fps >= 50
                  ? "text-green-400"
                  : fps >= 30
                  ? "text-yellow-400"
                  : "text-red-400"
              }`}
            >
              {fps} FPS
            </span>
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-accent-teal" />
          <div className="w-1.5 h-1.5 rounded-full bg-accent-amber" />
          <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
          <span>
            路径点{" "}
            <span className="text-slate-200 font-semibold">{waypoints.length}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
