const GRAVITY = 0.35;

function applyGravity(entity) {
  entity.vy += GRAVITY;
}

// Returns true if two rectangles overlap
function rectsOverlap(a, b) {
  return a.x < b.x + b.width &&
         a.x + a.width > b.x &&
         a.y < b.y + b.height &&
         a.y + a.height > b.y;
}

// Move entity on X axis, then resolve any platform overlaps
function moveX(entity, platforms) {
  entity.x += entity.vx;
  for (const p of platforms) {
    if (!p.solid) continue;
    if (rectsOverlap(entity, p)) {
      // Push entity out horizontally based on movement direction
      if (entity.vx > 0) {
        entity.x = p.x - entity.width;   // hit left side of platform
      } else if (entity.vx < 0) {
        entity.x = p.x + p.width;        // hit right side of platform
      }
      entity.vx = 0;
    }
  }
}

// Move entity on Y axis, then resolve any platform overlaps
function moveY(entity, platforms) {
  entity.y += entity.vy;
  entity.onGround = false;
  for (const p of platforms) {
    if (!p.solid) continue;
    if (rectsOverlap(entity, p)) {
      if (entity.vy > 0) {
        // Falling — landed on top
        entity.y = p.y - entity.height;
        entity.onGround = true;
        entity.vy = 0;
      } else if (entity.vy < 0) {
        // Jumping — hit bottom of platform, bonk head
        entity.y = p.y + p.height;
        entity.vy = 0;
      }
    }
  }
}

function checkHarmfulCollision(entity, platforms) {
  for (const p of platforms) {
    if (!p.harmful) continue;
    if (rectsOverlap(entity, p)) return p;
  }
  return null;
}