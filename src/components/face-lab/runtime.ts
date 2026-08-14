export type FaceLabRuntime = {
  progress: number;
  active: boolean;
  pointerX: number;
  pointerY: number;
  invalidate: null | (() => void);
};

export function createFaceLabRuntime(): FaceLabRuntime {
  return {
    progress: 0,
    active: false,
    pointerX: 0,
    pointerY: 0,
    invalidate: null,
  };
}
