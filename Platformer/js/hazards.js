//hazards.js

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

// === Hammer hazards (Zone 3) ===

function createHammer(config) {
  return {
    type: 'hammer',
    pivotX: config.x,            // where the hammer is mounted
    pivotY: config.y,
    length: config.length || 80, // length of handle
    headSize: config.headSize || 30,
    swingSpeed: config.swingSpeed || 0.005,  // radians per ms
    phase: config.phase || 0,    // offset so hammers don't all swing in sync
    arc: config.arc || (Math.PI / 3),  // total swing angle (here: ±60°)
  };
}

function updateHammers(hammers) {
  // No state to update — angle is derived from time + phase
  // (kept here for symmetry with other update functions)
}

function getHammerHeadPosition(h) {
  const angle = Math.sin(Date.now() * h.swingSpeed + h.phase) * h.arc;
  // Hammer hangs DOWN from pivot, swings left↔right
  const hx = h.pivotX + Math.sin(angle) * h.length;
  const hy = h.pivotY + Math.cos(angle) * h.length;
  return { x: hx, y: hy, angle };
}

function drawHammers(hammers) {
  for (const h of hammers) {
    const { x: hx, y: hy, angle } = getHammerHeadPosition(h);

    // Mount point — small dark anchor
    ctx.fillStyle = '#1a0a0a';
    ctx.fillRect(h.pivotX - 6, h.pivotY - 4, 12, 6);
    ctx.fillStyle = '#ff2222';
    ctx.fillRect(h.pivotX - 4, h.pivotY - 2, 8, 2);

    // Handle — line from pivot to head
    ctx.strokeStyle = '#3a0a0a';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(h.pivotX, h.pivotY);
    ctx.lineTo(hx, hy);
    ctx.stroke();

    // Head — dark heavy block with red edge
    const half = h.headSize / 2;
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(hx - half, hy - half / 2, h.headSize, h.headSize);
    ctx.fillStyle = '#ff2222';
    ctx.fillRect(hx - half, hy - half / 2, h.headSize, 2);
    ctx.fillRect(hx - half, hy + half / 2 - 2, h.headSize, 2);

    // Subtle glow under the head
    const glow = ctx.createRadialGradient(hx, hy, 0, hx, hy, h.headSize);
    glow.addColorStop(0, 'rgba(255, 40, 40, 0.3)');
    glow.addColorStop(1, 'rgba(255, 40, 40, 0)');
    ctx.fillStyle = glow;
    ctx.fillRect(hx - h.headSize, hy - h.headSize, h.headSize * 2, h.headSize * 2);
  }
}

function checkHammerCollisions(kai, hammers) {
  for (const h of hammers) {
    const { x: hx, y: hy } = getHammerHeadPosition(h);
    const half = h.headSize / 2;
    const headBox = {
      x: hx - half,
      y: hy - half / 2,
      width: h.headSize,
      height: h.headSize,
    };
    if (rectsOverlap(kai, headBox)) {
      zapKai(kai, headBox);
      return;
    }
  }
}