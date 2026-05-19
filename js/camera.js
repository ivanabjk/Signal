const camera = {
  x: 0,           // top-left corner of camera in world coordinates
  y: 0,           // not used yet — vertical scroll comes in Zone 2
  deadzone: 200,  // half-width of the center band where Kai moves freely
};

function updateCamera(kai, levelWidth) {
  // Target: keep Kai centered horizontally
  const target = kai.x + kai.width / 2 - canvas.width / 2;

  // Deadzone: only move camera when Kai is far from current center
  const cameraCenter = camera.x + canvas.width / 2;
  const kaiCenter = kai.x + kai.width / 2;

  if (kaiCenter > cameraCenter + camera.deadzone) {
    camera.x = kaiCenter - canvas.width / 2 - camera.deadzone;
  } else if (kaiCenter < cameraCenter - camera.deadzone) {
    camera.x = kaiCenter - canvas.width / 2 + camera.deadzone;
  }

  // Clamp so we don't show areas past the level bounds
  if (camera.x < 0) camera.x = 0;
  if (camera.x > levelWidth - canvas.width) {
    camera.x = levelWidth - canvas.width;
  }
}