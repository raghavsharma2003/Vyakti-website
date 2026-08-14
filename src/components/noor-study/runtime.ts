export type NoorRuntime = {
  progress: number;
  scrollVelocity: number;
  active: boolean;
  pointerX: number;
  pointerY: number;
  invalidate: null | (() => void);
};

export function createNoorRuntime(): NoorRuntime {
  return {
    progress: 0,
    scrollVelocity: 0,
    active: false,
    pointerX: 0,
    pointerY: 0,
    invalidate: null,
  };
}
