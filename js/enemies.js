function createPatrolEnemy(x, y, platform, options = {}) {
  const speed = options.speed || 1.5;
  return {
    type: 'patrol',
    x,
    y,
    width: options.width || 28,
    height: options.height || 28,
    vx: speed,
    color: options.color || '#ff6b3d',
    eyeColor: options.eyeColor || '#fff',
    platform,
    alive: true,
    // Remember spawn state for resets
    spawnX: x,
    spawnY: y,
    spawnVx: speed,
  };
}

function updateEnemies(enemies) {
  for (const e of enemies) {
    if (!e.alive) continue;

    if (e.type === 'patrol') {
      e.x += e.vx;
      const leftEdge = e.platform.x;
      const rightEdge = e.platform.x + e.platform.width - e.width;
      if (e.x <= leftEdge) {
        e.x = leftEdge;
        e.vx = Math.abs(e.vx);
      } else if (e.x >= rightEdge) {
        e.x = rightEdge;
        e.vx = -Math.abs(e.vx);
      }
    }
  }
}

function drawEnemies(ctx, enemies) {
  for (const e of enemies) {
    if (!e.alive) continue;

    ctx.fillStyle = e.color;
    ctx.fillRect(e.x, e.y, e.width, e.height);

    ctx.fillStyle = e.eyeColor;
    const eyeY = e.y + 8;
    if (e.vx >= 0) {
      ctx.fillRect(e.x + e.width - 10, eyeY, 4, 4);
      ctx.fillRect(e.x + e.width - 18, eyeY, 4, 4);
    } else {
      ctx.fillRect(e.x + 6, eyeY, 4, 4);
      ctx.fillRect(e.x + 14, eyeY, 4, 4);
    }

    ctx.fillStyle = '#000';
    if (e.vx >= 0) {
      ctx.fillRect(e.x + e.width - 9, eyeY + 1, 2, 2);
      ctx.fillRect(e.x + e.width - 17, eyeY + 1, 2, 2);
    } else {
      ctx.fillRect(e.x + 7, eyeY + 1, 2, 2);
      ctx.fillRect(e.x + 15, eyeY + 1, 2, 2);
    }
  }
}

// Reset all enemies to their starting state
function resetEnemies(enemies) {
  for (const e of enemies) {
    e.x = e.spawnX;
    e.y = e.spawnY;
    e.vx = e.spawnVx;
    e.alive = true;
  }
}