//camera.js
const camera = {
  x: 0,
  y: 0,
  deadzoneX: 200,
  deadzoneY: 100, // smaller vertical deadzone — climbs need snappier follow
  mode: "horizontal", // 'horizontal' | 'vertical' | 'free'
  bounds: null, // { minX, maxX, minY, maxY } — set by active region
  shakeIntensity: 0,
  shakeTimer: 0,
  shakeOffsetX: 0,
  shakeOffsetY: 0,
};

function shakeCamera(intensity = 6, duration = 12) {
  if (intensity > camera.shakeIntensity) {
    camera.shakeIntensity = intensity;
    camera.shakeTimer = duration;
  }
}

// Find which camera region (if any) Kai is currently in
function findActiveRegion(kai, regions) {
  if (!regions) return null;
  for (const r of regions) {
    if (
      kai.x + kai.width > r.x &&
      kai.x < r.x + r.width &&
      kai.y + kai.height > r.y &&
      kai.y < r.y + r.height
    ) {
      return r;
    }
  }
  return null;
}

function updateCamera(kai, levelWidth, cameraRegions = null) {
  // Determine current mode + bounds
  const region = findActiveRegion(kai, cameraRegions);
  if (region) {
    camera.mode = region.mode;
    camera.bounds = region.bounds || null;
  } else {
    camera.mode = "horizontal";
    camera.bounds = null;
  }

  // Horizontal follow (used in 'horizontal' and 'free' modes)
  if (camera.mode === "horizontal" || camera.mode === "free") {
    const cameraCenter = camera.x + canvas.width / 2;
    const kaiCenter = kai.x + kai.width / 2;
    if (kaiCenter > cameraCenter + camera.deadzoneX) {
      camera.x = kaiCenter - canvas.width / 2 - camera.deadzoneX;
    } else if (kaiCenter < cameraCenter - camera.deadzoneX) {
      camera.x = kaiCenter - canvas.width / 2 + camera.deadzoneX;
    }
  }

  // Vertical follow (used in 'vertical' and 'free' modes)
  if (camera.mode === 'vertical' || camera.mode === 'free') {
    const cameraCenterY = camera.y + canvas.height / 2;
    const kaiCenterY = kai.y + kai.height / 2;
    if (kaiCenterY > cameraCenterY + camera.deadzoneY) {
      camera.y = kaiCenterY - canvas.height / 2 - camera.deadzoneY;
    } else if (kaiCenterY < cameraCenterY - camera.deadzoneY) {
      camera.y = kaiCenterY - canvas.height / 2 + camera.deadzoneY;
    }
  } else {
    // Smoothly return to y=0 when not in a vertical region
    if (camera.y > 0) camera.y = Math.max(0, camera.y - 4);
    else if (camera.y < 0) camera.y = Math.min(0, camera.y + 4);
  }
  

  // Apply bounds (overrides level bounds if specified by region)
  if (camera.bounds) {
    if (camera.x < camera.bounds.minX) camera.x = camera.bounds.minX;
    if (camera.x > camera.bounds.maxX - canvas.width)
      camera.x = camera.bounds.maxX - canvas.width;
    if (camera.y < camera.bounds.minY) camera.y = camera.bounds.minY;
    if (camera.y > camera.bounds.maxY - canvas.height)
      camera.y = camera.bounds.maxY - canvas.height;
  } else {
    // Default: clamp horizontally to level width, never scroll above y=0
    if (camera.x < 0) camera.x = 0;
    if (camera.x > levelWidth - canvas.width)
      camera.x = levelWidth - canvas.width;
    if (camera.y < 0) camera.y = 0;
  }

  // Shake decay
  if (camera.shakeTimer > 0) {
    camera.shakeTimer--;
    const t = camera.shakeIntensity;
    camera.shakeOffsetX = (Math.random() - 0.5) * 2 * t;
    camera.shakeOffsetY = (Math.random() - 0.5) * 2 * t;
    camera.shakeIntensity *= 0.85;
  } else {
    camera.shakeIntensity = 0;
    camera.shakeOffsetX = 0;
    camera.shakeOffsetY = 0;
  }
}
