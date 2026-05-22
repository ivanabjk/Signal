// Patrol behavior — walks back and forth on a single platform,
// flips direction at platform edges or when blocked by other platforms.

const PatrolBehavior = {
  init(enemy, config) {
    enemy.behaviorState.platform = config.platform;
    enemy.behaviorState.vx = config.speed || 1.5;
    enemy.behaviorState.spawnVx = config.speed || 1.5; // for reset
  },

  update(enemy, platforms) {
    const state = enemy.behaviorState;
    const nextX = enemy.x + state.vx;

    // Check if any OTHER solid platform blocks the move
    let blocked = false;
    const probe = {
      x: nextX,
      y: enemy.y,
      width: enemy.width,
      height: enemy.height,
    };
    for (const p of platforms) {
      if (p === state.platform || !p.solid) continue;
      if (rectsOverlap(probe, p)) {
        blocked = true;
        break;
      }
    }

    if (blocked) {
      state.vx = -state.vx;
    } else {
      enemy.x = nextX;
    }

    // Flip at platform edges
    const leftEdge = state.platform.x;
    const rightEdge = state.platform.x + state.platform.width - enemy.width;
    if (enemy.x <= leftEdge) {
      enemy.x = leftEdge;
      state.vx = Math.abs(state.vx);
    } else if (enemy.x >= rightEdge) {
      enemy.x = rightEdge;
      state.vx = -Math.abs(state.vx);
    }
  },

  draw(ctx, enemy) {
    const state = enemy.behaviorState;
    const bob = Math.sin(Date.now() / 300 + enemy.x * 0.01) * 2;
    const y = enemy.y + bob;

    // === Body base ===
    ctx.fillStyle = enemy.color || "#1f0f08"; // use zone color
    ctx.fillRect(enemy.x, y, enemy.width, enemy.height);

    // Body highlight
    ctx.fillStyle = "#3d2417"; // can stay subtle dark highlight
    ctx.fillRect(enemy.x, y, enemy.width, 4);

    // === Screen face ===
    const screenInset = 4;
    const screenY = y + 6;
    const screenW = enemy.width - screenInset * 2;
    const screenH = 12;
    ctx.fillStyle = enemy.eyeColor || "#ff9933"; // neon face color
    ctx.fillRect(enemy.x + screenInset, screenY, screenW, screenH);

    // Glitch lines
    ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
    const scroll = Math.floor(Date.now() / 80) % 4;
    for (let i = 0; i < 3; i++) {
      const lineY = screenY + ((i * 4 + scroll) % screenH);
      ctx.fillRect(enemy.x + screenInset, lineY, screenW, 1);
    }

    // Eye slot
    ctx.fillStyle = "#000";
    const eyeW = 4;
    const eyeY = screenY + screenH / 2 - 1;
    if (state.vx >= 0) {
      ctx.fillRect(
        enemy.x + enemy.width - screenInset - eyeW - 1,
        eyeY,
        eyeW,
        3,
      );
    } else {
      ctx.fillRect(enemy.x + screenInset + 1, eyeY, eyeW, 3);
    }

    // Antennas
    ctx.fillStyle = "#5a3018";
    ctx.fillRect(enemy.x + 6, y - 4, 1, 4);
    ctx.fillRect(enemy.x + enemy.width - 7, y - 4, 1, 4);

    // Antenna tips
    ctx.fillStyle = enemy.eyeColor || "#ff9933"; // match face color
    ctx.fillRect(enemy.x + 5, y - 5, 3, 2);
    ctx.fillRect(enemy.x + enemy.width - 8, y - 5, 3, 2);

    // Status light
    const blink = Math.floor(Date.now() / 400) % 2 === 0;
    if (blink) {
      ctx.fillStyle = "#3399ff"; // electric blue blink for Zone 2
      ctx.fillRect(enemy.x + enemy.width / 2 - 1, y + enemy.height - 4, 2, 2);
    }
  },

  reset(enemy) {
    enemy.behaviorState.vx = enemy.behaviorState.spawnVx;
  },
};
