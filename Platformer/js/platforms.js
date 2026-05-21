// Platform factory
function createPlatform(x, y, width, height, color = '#8b5a2b') {
  return { x, y, width, height, color, solid: true, flicker: null };
}

// Convert an existing platform into a flickering one.
// onFrames / offFrames: number of frames in each state (60fps → 60 = 1 second)
// startVisible: whether platform begins solid or off-cycle
function makeFlickering(platform, onFrames, offFrames, startVisible = true) {
  platform.flicker = {
    onFrames,
    offFrames,
    timer: 0,
    visible: startVisible,
    startVisible: startVisible,  // remembered for reloadZone resets
  };
  platform.solid = startVisible;
  return platform;
}

// Spike row — non-solid, deadly on touch
function createSpike(x, y, width, color = '#cc3333') {
  return {
    x,
    y,
    width,
    height: 16,
    color,
    solid: false,
    harmful: true,
    flicker: null,
    isSpike: true,
  };
}

// Tick flicker timers each frame and flip state at boundaries
function updatePlatforms(platforms) {
  for (const p of platforms) {
    if (!p.flicker) continue;
    const f = p.flicker;
    f.timer++;
    const duration = f.visible ? f.onFrames : f.offFrames;
    if (f.timer >= duration) {
      f.timer = 0;
      f.visible = !f.visible;
      p.solid = f.visible;
    }
  }
}