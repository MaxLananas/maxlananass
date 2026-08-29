export const world = {
  progress: 0,
  mouseX: 0,
  mouseY: 0,
  reduced: false,
};

export function setProgress(v) {
  world.progress = v;
}

export function setMouse(x, y) {
  world.mouseX = x;
  world.mouseY = y;
}
