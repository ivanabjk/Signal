//platforms.js

// Platform factory
function createPlatform(x, y, width, height, color = '#8b5a2b') {
  return { x, y, width, height, color, solid: true, flicker: null };
}

function makeFlickering(platform, onFrames, offFrames, startVisible = true) {
  platform.flicker = {
    onFrames,
    offFrames,
    timer: 0,
    visible: startVisible,
    startVisible: startVisible,
  };
  platform.solid = startVisible;
  return platform;
}

// Convert a platform into a moving one.
// path: array of points [{x, y}, {x, y}, ...] — minimum 2
// speed: pixels per frame along the path
// pingPong: if true, reverses at the end; if false, jumps back to start
function makeMoving(platform, path, speed = 1, pingPong = true) {
  platform.moving = {
    path: path,
    speed: speed,
    pingPong: pingPong,
    targetIndex: 1,         // index of the next waypoint
    direction: 1,           // 1 = forward through path, -1 = backward
    dx: 0,                  // movement delta this frame (for carry)
    dy: 0,
    startX: platform.x,     // for reset
    startY: platform.y,
  };
  // Snap to start of path
  platform.x = path[0].x;
  platform.y = path[0].y;
  return platform;
}

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

function updatePlatforms(platforms) {
  for (const p of platforms) {
    // Flicker
    if (p.flicker) {
      const f = p.flicker;
      f.timer++;
      const duration = f.visible ? f.onFrames : f.offFrames;
      if (f.timer >= duration) {
        f.timer = 0;
        f.visible = !f.visible;
        p.solid = f.visible;
      }
    }

    // Moving — interpolate toward next waypoint
    if (p.moving) {
      const m = p.moving;
      const target = m.path[m.targetIndex];
      const dx = target.x - p.x;
      const dy = target.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist <= m.speed) {
        // Reached waypoint — record delta as the snap, then advance target
        m.dx = dx;
        m.dy = dy;
        p.x = target.x;
        p.y = target.y;

        // Advance to next waypoint
        m.targetIndex += m.direction;

        if (m.pingPong) {
          if (m.targetIndex >= m.path.length) {
            m.targetIndex = m.path.length - 2;
            m.direction = -1;
          } else if (m.targetIndex < 0) {
            m.targetIndex = 1;
            m.direction = 1;
          }
        } else {
          if (m.targetIndex >= m.path.length) m.targetIndex = 0;
        }
      } else {
        // Move toward target at constant speed
        const stepX = (dx / dist) * m.speed;
        const stepY = (dy / dist) * m.speed;
        m.dx = stepX;
        m.dy = stepY;
        p.x += stepX;
        p.y += stepY;
      }
    } else if (p.moving === undefined) {
      // Non-moving platforms: ensure no stale delta
      // (no-op for ordinary static platforms — they don't have m)
    }
  }
}

// Reset all moving platforms to their initial state — called by reloadZone
function resetMovingPlatforms(platforms) {
  for (const p of platforms) {
    if (p.moving) {
      p.x = p.moving.path[0].x;
      p.y = p.moving.path[0].y;
      p.moving.targetIndex = 1;
      p.moving.direction = 1;
      p.moving.dx = 0;
      p.moving.dy = 0;
    }
  }
}