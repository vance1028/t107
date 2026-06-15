import React, { useState, useCallback, useRef } from "react";
import { Scene3D } from "./components/Scene3D";
import { ControlPanel } from "./components/ControlPanel";
import { StatusBar } from "./components/StatusBar";
import { FKResult } from "./kinematics/forwardKinematics";

export default function App() {
  const [fkResult, setFkResult] = useState<FKResult | null>(null);
  const lastFkPush = useRef(0);

  const handleFkUpdate = useCallback((fk: FKResult) => {
    const now = performance.now();
    if (now - lastFkPush.current < 110) return;
    lastFkPush.current = now;
    setFkResult(fk);
  }, []);

  return (
    <div className="w-full h-full flex flex-col bg-space-950">
      <StatusBar />
      <div className="flex-1 flex overflow-hidden relative">
        <div className="flex-1 relative animate-fade-in">
          <Scene3D onFkUpdate={handleFkUpdate} />
          <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none select-none">
            <div className="text-[10.5px] font-mono text-slate-500/90 bg-black/35 px-2.5 py-1.5 rounded-md backdrop-blur-sm border border-white/5">
              <span className="text-accent-teal">🖱️ 左键</span> 旋转视角 · 
              <span className="text-accent-amber"> 滚轮</span> 缩放 · 
              <span className="text-cyan-300"> 右键</span> 平移
            </div>
            <div className="text-[10.5px] font-mono text-slate-500/90 bg-black/35 px-2.5 py-1.5 rounded-md backdrop-blur-sm border border-white/5">
              <span className="text-accent-amber">🎯 拖动橙色球体</span> 触发逆运动学求解
            </div>
            <div className="text-[10.5px] font-mono text-slate-500/90 bg-black/35 px-2.5 py-1.5 rounded-md backdrop-blur-sm border border-white/5">
              <span className="text-accent-teal">📍 点击路径点</span> 可跳转至对应关节姿态
            </div>
          </div>
          <div className="absolute bottom-3 left-3 pointer-events-none select-none">
            <div className="flex items-center gap-2 text-[10.5px] font-mono text-slate-400/90 bg-black/35 px-2.5 py-1.5 rounded-md backdrop-blur-sm border border-white/5">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-gizmo-x" />
                X
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-gizmo-y" />
                Y (↑)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-sm bg-gizmo-z" />
                Z
              </span>
            </div>
          </div>
        </div>
        <div className="p-3 animate-slide-right" style={{ flexShrink: 0 }}>
          <ControlPanel fk={fkResult} />
        </div>
      </div>
    </div>
  );
}
