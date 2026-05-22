// Hazards module — entities that damage Kai but aren't traditional enemies.
// Currently: toxic bubbles for Zone 2.

const BUBBLE_TEXTS = ['🤡', 'L', 'RATIO', 'MID', 'CRINGE', '0/10', 'NPC', 'COPE'];

// Factory for a single bubble
function createBubble(spawnX, spawnY, options = {}) {
  return {
    x: spawnX,
    y: spawnY,
    width: options.size || 36,
    height: options.size || 36,
    vy: -(options.speed || 0.8),       // negative = drifts upward
    drift: (Math.random() - 0.5) * 0.5, // small horizontal wobble
    text: options.text || BUBBLE_TEXTS[Math.floor(Math.random() * BUBBLE_TEXTS.length)],
    color: options.color || '#ff3399',
    alive: true,
    age: 0,
  };
}

// Update all bubbles — drift up, despawn when off-screen
function updateBubbles(bubbles, levelHeight = 1500) {
  for (const b of bubbles) {
    if (!b.alive) continue;
    b.y += b.vy;
    b.x += b.drift;
    b.age++;
    // Despawn when bubble drifts above the top of the world
    if (b.y + b.height < -200) {
      b.alive = false;
    }
  }
}

// Draw a single bubble
function drawBubbles(ctx, bubbles) {
  for (const b of bubbles) {
    if (!b.alive) continue;

    const cx = b.x + b.width / 2;
    const cy = b.y + b.height / 2;
    const r = b.width / 2;

    // Outer glow
    const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, r + 6);
    glow.addColorStop(0, 'rgba(255, 51, 153, 0.4)');
    glow.addColorStop(1, 'rgba(255, 51, 153, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(b.x - 6, b.y - 6, b.width + 12, b.height + 12);

    // Bubble body
    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();

    // Inner highlight
    ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.beginPath();
    ctx.arc(cx - r * 0.3, cy - r * 0.3, r * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Text inside
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 11px "Courier New", monospace';
    ctx.fillText(b.text, cx, cy);
  }
}

// Reset all bubbles — called by reloadZone
function clearBubbles(bubbles) {
  bubbles.length = 0;
}