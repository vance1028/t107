import React from "react";
import {
  Circle,
  Play,
  Square,
  Trash2,
  ListPlus,
  Clock,
  ChevronRight,
} from "lucide-react";
import { useRobotStore } from "../../store/useRobotStore";
import { radToDeg } from "../../kinematics/dhParams";

export function WaypointPanel() {
  const waypoints = useRobotStore((s) => s.waypoints);
  const addWaypoint = useRobotStore((s) => s.addWaypoint);
  const removeWaypoint = useRobotStore((s) => s.removeWaypoint);
  const clearWaypoints = useRobotStore((s) => s.clearWaypoints);
  const startPlayback = useRobotStore((s) => s.startPlayback);
  const stopPlayback = useRobotStore((s) => s.stopPlayback);
  const isPlaying = useRobotStore((s) => s.isPlaying);
  const currentWaypointIdx = useRobotStore((s) => s.currentWaypointIdx);
  const playbackProgress = useRobotStore((s) => s.playbackProgress);
  const setJoints = useRobotStore((s) => s.setJoints);
  const setIkMode = useRobotStore((s) => s.setIkMode);

  const gotoWaypoint = (idx: number) => {
    const wp = waypoints[idx];
    if (!wp) return;
    setIkMode(false);
    setJoints(wp.joints);
  };

  return (
    <div className="mb-4">
      <div className="section-title">
        <ListPlus size={14} />
        <span>轨迹路径点</span>
        <span className="ml-auto chip bg-slate-800/70 text-slate-300 border border-white/10">
          <Clock size={11} /> {waypoints.length} 个点
        </span>
      </div>

      <div className="flex gap-2 mb-3 flex-wrap">
        <button className="btn-primary" onClick={addWaypoint}>
          <Circle size={13} fill="currentColor" />
          录制当前
        </button>
        <button
          className="btn-primary"
          onClick={startPlayback}
          disabled={isPlaying || waypoints.length < 2}
          style={{
            background: isPlaying
              ? "linear-gradient(180deg,#22c55e,#16a34a)"
              : undefined,
            borderColor: isPlaying ? "rgba(34,197,94,0.5)" : undefined,
          }}
        >
          {isPlaying ? <Square size={13} fill="currentColor" /> : <Play size={13} fill="currentColor" />}
          {isPlaying ? " 播放中" : " 播放轨迹"}
        </button>
        {isPlaying && (
          <button className="btn-ghost" onClick={stopPlayback}>
            <Square size={13} /> 停止
          </button>
        )}
        <button
          className="btn-ghost ml-auto"
          onClick={clearWaypoints}
          disabled={waypoints.length === 0}
        >
          <Trash2 size={13} /> 清空
        </button>
      </div>

      {isPlaying && (
        <div className="mb-3">
          <div className="flex justify-between text-[11px] text-slate-400 font-mono mb-1">
            <span>
              第 {Math.max(1, currentWaypointIdx + 1)} / {waypoints.length} 段
            </span>
            <span>{(playbackProgress * 100).toFixed(0)}%</span>
          </div>
          <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-amber to-accent-teal transition-all"
              style={{ width: `${playbackProgress * 100}%` }}
            />
          </div>
        </div>
      )}

      <div
        className="space-y-1.5 pr-1 overflow-y-auto"
        style={{ maxHeight: waypoints.length > 4 ? "180px" : undefined }}
      >
        {waypoints.length === 0 ? (
          <div className="text-center text-slate-500 text-[12px] py-5 border-2 border-dashed border-white/10 rounded-lg">
            点击 录制当前 按钮添加路径点
          </div>
        ) : (
          waypoints.map((wp, idx) => {
            const isCurrentPlaying =
              isPlaying && currentWaypointIdx === idx;
            return (
              <div
                key={wp.id}
                onClick={() => gotoWaypoint(idx)}
                className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all border ${
                  isCurrentPlaying
                    ? "bg-accent-amber/20 border-accent-amber/60 shadow-glow"
                    : "bg-slate-800/40 border-white/5 hover:bg-slate-700/40 hover:border-accent-teal/40"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold font-mono shrink-0 ${
                    isCurrentPlaying
                      ? "bg-accent-amber text-slate-900"
                      : "bg-slate-700 text-slate-300 group-hover:bg-accent-teal group-hover:text-slate-900"
                  }`}
                >
                  {idx + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="font-mono text-[11px] text-slate-300 truncate">
                    {wp.joints
                      .map((j) => `${radToDeg(j).toFixed(0)}°`)
                      .join(" · ")}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    #{wp.id.slice(-4)} · {new Date(wp.timestamp).toLocaleTimeString()}
                  </div>
                </div>
                <ChevronRight
                  size={14}
                  className="text-slate-500 group-hover:text-accent-teal shrink-0"
                />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeWaypoint(wp.id);
                  }}
                  className="btn-danger opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <Trash2 size={10} />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
