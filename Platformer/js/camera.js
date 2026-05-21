const camera = {
  x: 0,
  y: 0,
  deadzone: 200,
  shakeIntensity: 0,
  shakeTimer: 0,
  shakeOffsetX: 0,
  shakeOffsetY: 0,
};

function shakeCamera(intensity = 6, duration = 12) {
  // Take the stronger of current or new shake (don't let weak shakes override strong ones)
  if (intensity > camera.shakeIntensity) {
    camera.shakeIntensity = intensity;
    camera.shakeTimer = duration;
  }
}

function updateCamera(kai, levelWidth) {
  // Existing follow logic
  const cameraCenter = camera.x + canvas.width / 2;
  const kaiCenter = kai.x + kai.width / 2;

  if (kaiCenter > cameraCenter + camera.deadzone) {
    camera.x = kaiCenter - canvas.width / 2 - camera.deadzone;
  } else if (kaiCenter < cameraCenter - camera.deadzone) {
    camera.x = kaiCenter - canvas.width / 2 + camera.deadzone;
  }

  if (camera.x < 0) camera.x = 0;
  if (camera.x > levelWidth - canvas.width) {
    camera.x = levelWidth - canvas.width;
  }

  // Shake decay
  if (camera.shakeTimer > 0) {
    camera.shakeTimer--;
    // Random offset in both directions
    const t = camera.shakeIntensity;
    camera.shakeOffsetX = (Math.random() - 0.5) * 2 * t;
    camera.shakeOffsetY = (Math.random() - 0.5) * 2 * t;
    // Decay intensity over time
    camera.shakeIntensity *= 0.85;
  } else {
    camera.shakeIntensity = 0;
    camera.shakeOffsetX = 0;
    camera.shakeOffsetY = 0;
  }
}