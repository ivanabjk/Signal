const ChaserBehavior = {
  init(enemy, config) {
    enemy.behaviorState.speed = config.speed || 1.2;
    enemy.behaviorState.vx = 0;
    enemy.behaviorState.vy = 0;
    enemy.behaviorState.onGround = false;
    enemy.behaviorState.activationDelay = config.activationDelay || 60;
    enemy.behaviorState.triggerRegion = config.triggerRegion || null;
    enemy.behaviorState.triggered = !config.triggerRegion; // if no region, trigger immediately
  },

  update(enemy, platforms, game) {
    const state = enemy.behaviorState;

    // === Trigger check: wait until Kai enters the trigger region ===
    if (!state.triggered && state.triggerRegion) {
      const r = state.triggerRegion;
      const kai = game.kai;
      const insideRegion =
        kai.x + kai.width > r.x &&
        kai.x < r.x + r.width &&
        kai.y + kai.height > r.y &&
        kai.y < r.y + r.height;
      if (insideRegion) {
        state.triggered = true;
        // Start counting activation delay from this moment
      } else {
        // Not triggered yet — chaser is dormant, just apply gravity to keep it grounded
        state.vy += 0.5;
        if (state.vy > 12) state.vy = 12;
        enemy.y += state.vy;
        for (const p of platforms) {
          if (!p.solid) continue;
          if (rectsOverlap(enemy, p)) {
            if (state.vy > 0) {
              enemy.y = p.y - enemy.height;
              state.vy = 0;
              state.onGround = true;
            }
          }
        }
        return; // skip the rest of update — don't move, don't activate
      }
    }

    // Activation delay (counts down only AFTER triggering)
    if (state.activationDelay > 0) {
      state.activationDelay--;
    }

    // === Horizontal AI (only after activation delay finishes) ===
    if (state.activationDelay <= 0) {
      const kai = game.kai;
      const dx = kai.x - enemy.x;
      if (Math.abs(dx) > 4) {
        state.vx = Math.sign(dx) * state.speed;
      } else {
        state.vx = 0;
      }
    }

    // Gravity
    state.vy += 0.5;
    if (state.vy > 12) state.vy = 12;

    // Move X + collide
    enemy.x += state.vx;
    for (const p of platforms) {
      if (!p.solid) continue;
      if (rectsOverlap(enemy, p)) {
        if (state.vx > 0) enemy.x = p.x - enemy.width;
        else if (state.vx < 0) enemy.x = p.x + p.width;
        state.vx = 0;
      }
    }

    // Move Y + collide
    enemy.y += state.vy;
    state.onGround = false;
    for (const p of platforms) {
      if (!p.solid) continue;
      if (rectsOverlap(enemy, p)) {
        if (state.vy > 0) {
          enemy.y = p.y - enemy.height;
          state.onGround = true;
          state.vy = 0;
        } else if (state.vy < 0) {
          enemy.y = p.y + p.height;
          state.vy = 0;
        }
      }
    }
  },

  draw(ctx, enemy) {
    const state = enemy.behaviorState;
    const activating = state.triggered && state.activationDelay > 0;
    const dormant = !state.triggered;

    const bob = Math.sin(Date.now() / 200) * 1.5;
    const y = enemy.y + bob;

    // Glow halo
    let glowAlpha;
    if (dormant) {
      glowAlpha = 0.08; // dim, sleeping
    } else if (activating) {
      glowAlpha = 0.15 + Math.sin(Date.now() / 100) * 0.1;
    } else {
      glowAlpha = 0.25;
    }
    const glow = ctx.createRadialGradient(
      enemy.x + enemy.width / 2, y + enemy.height / 2, 0,
      enemy.x + enemy.width / 2, y + enemy.height / 2, enemy.width
    );
    glow.addColorStop(0, `rgba(255, 30, 30, ${glowAlpha})`);
    glow.addColorStop(1, 'rgba(255, 30, 30, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(
      enemy.x - enemy.width / 2,
      y - enemy.height / 2,
      enemy.width * 2,
      enemy.height * 2
    );

    // Body
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(enemy.x, y, enemy.width, enemy.height);

    ctx.fillStyle = '#3a0a0a';
    ctx.fillRect(enemy.x, y, enemy.width, 3);
    ctx.fillStyle = '#000';
    ctx.fillRect(enemy.x, y + enemy.height - 3, enemy.width, 3);

    // Eye slot
    const eyeY = y + enemy.height / 2 - 4;
    const eyeH = 8;
    ctx.fillStyle = '#1a0000';
    ctx.fillRect(enemy.x + 4, eyeY, enemy.width - 8, eyeH);

    // Pupil — dim if dormant
    const dir = state.vx >= 0 ? 1 : -1;
    const pupilX = enemy.x + enemy.width / 2 + dir * 4 - 3;
    const pulse = dormant ? 0.3 : 0.7 + Math.sin(Date.now() / 150) * 0.3;
    ctx.fillStyle = `rgba(255, ${Math.floor(40 * pulse)}, ${Math.floor(40 * pulse)}, 1)`;
    ctx.fillRect(pupilX, eyeY + 1, 6, eyeH - 2);

    // Scanline
    if (!dormant) {
      ctx.fillStyle = 'rgba(255, 100, 100, 0.4)';
      const scanY = eyeY + (Math.floor(Date.now() / 50) % eyeH);
      ctx.fillRect(enemy.x + 4, scanY, enemy.width - 8, 1);
    }

    // Glitch (only when active)
    if (!dormant && Math.random() < 0.1) {
      ctx.fillStyle = '#ff3030';
      const gx = enemy.x + Math.random() * enemy.width;
      const gy = y + Math.random() * enemy.height;
      ctx.fillRect(gx, gy, 2, 1);
    }

    // "!" warning during activation
    if (activating && Math.floor(Date.now() / 200) % 2 === 0) {
      ctx.fillStyle = '#ff3030';
      ctx.font = 'bold 14px "Courier New", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('!', enemy.x + enemy.width / 2, y - 6);
    }
  },

  reset(enemy) {
    enemy.behaviorState.vx = 0;
    enemy.behaviorState.vy = 0;
    enemy.behaviorState.onGround = false;
    enemy.behaviorState.activationDelay = 60;
    enemy.behaviorState.triggered = !enemy.behaviorState.triggerRegion;
  },
};