import { create } from "zustand";
import { DEFAULT_JOINTS, JointAngles, clampJoints } from "../kinematics/dhParams";

export interface Waypoint {
  id: string;
  joints: JointAngles;
  timestamp: number;
}

interface RobotState {
  joints: JointAngles;
  targetJoints: JointAngles;
  ikMode: boolean;
  targetPos: { x: number; y: number; z: number };
  workspaceReachable: boolean;
  waypoints: Waypoint[];
  isPlaying: boolean;
  currentWaypointIdx: number;
  playbackProgress: number;
  showAxes: boolean;
  showTargetLine: boolean;

  setJoint: (idx: number, value: number) => void;
  setJoints: (joints: JointAngles) => void;
  setTargetJoints: (joints: JointAngles) => void;
  setTargetPos: (x: number, y: number, z: number) => void;
  setWorkspaceReachable: (r: boolean) => void;
  toggleIkMode: () => void;
  setIkMode: (v: boolean) => void;

  addWaypoint: () => void;
  removeWaypoint: (id: string) => void;
  clearWaypoints: () => void;
  startPlayback: () => void;
  stopPlayback: () => void;
  setCurrentWaypointIdx: (idx: number) => void;
  setPlaybackProgress: (p: number) => void;

  toggleAxes: () => void;
  setShowAxes: (v: boolean) => void;
  toggleTargetLine: () => void;
}

function genId(): string {
  return "wp_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 7);
}

export const useRobotStore = create<RobotState>((set, get) => ({
  joints: [...DEFAULT_JOINTS] as JointAngles,
  targetJoints: [...DEFAULT_JOINTS] as JointAngles,
  ikMode: false,
  targetPos: { x: 400, y: 300, z: 200 },
  workspaceReachable: true,
  waypoints: [],
  isPlaying: false,
  currentWaypointIdx: -1,
  playbackProgress: 0,
  showAxes: true,
  showTargetLine: true,

  setJoint: (idx, value) =>
    set((state) => {
      const next = [...state.joints] as JointAngles;
      next[idx] = value;
      return { joints: clampJoints(next), ikMode: false };
    }),
  setJoints: (joints) => set({ joints: clampJoints(joints) }),
  setTargetJoints: (joints) => set({ targetJoints: clampJoints(joints) }),
  setTargetPos: (x, y, z) => set({ targetPos: { x, y, z }, ikMode: true }),
  setWorkspaceReachable: (r) => set({ workspaceReachable: r }),
  toggleIkMode: () => set((s) => ({ ikMode: !s.ikMode })),
  setIkMode: (v) => set({ ikMode: v }),

  addWaypoint: () =>
    set((s) => {
      const wp: Waypoint = {
        id: genId(),
        joints: [...s.joints] as JointAngles,
        timestamp: Date.now(),
      };
      return { waypoints: [...s.waypoints, wp] };
    }),
  removeWaypoint: (id) =>
    set((s) => ({ waypoints: s.waypoints.filter((w) => w.id !== id) })),
  clearWaypoints: () => set({ waypoints: [], isPlaying: false, currentWaypointIdx: -1, playbackProgress: 0 }),
  startPlayback: () =>
    set((s) => {
      if (s.waypoints.length < 2) return s;
      return { isPlaying: true, currentWaypointIdx: 0, playbackProgress: 0, ikMode: false };
    }),
  stopPlayback: () => set({ isPlaying: false }),
  setCurrentWaypointIdx: (idx) => set({ currentWaypointIdx: idx }),
  setPlaybackProgress: (p) => set({ playbackProgress: p }),

  toggleAxes: () => set((s) => ({ showAxes: !s.showAxes })),
  setShowAxes: (v) => set({ showAxes: v }),
  toggleTargetLine: () => set((s) => ({ showTargetLine: !s.showTargetLine })),
}));
