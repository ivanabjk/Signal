// Background rendering system for Zone 1 — and reusable for future zones.
// Each layer is procedurally drawn, no images needed.

// Pre-generated background "silhouette" data per zone, computed once on zone load
let zoneBackground = null;

function buildZoneBackground(zone) {
  // Seed-based pseudo-random for consistency
  const rng = mulberry32(12345);

  const bg = {
    distantAntennas: [],
    midWreckage: [],
    clouds: [],
    particles: [],
  };

  // Distant antennas — sparse, tall, all the way across the level
  for (let x = 0; x < zone.levelWidth; x += 60 + rng() * 80) {
    bg.distantAntennas.push({
      x,
      height: 80 + rng() * 120,
      width: 4 + rng() * 4,
      hasDish: rng() < 0.3,
    });
  }

  // Mid-ground wreckage — clusters of broken machinery silhouettes
  for (let x = 100; x < zone.levelWidth; x += 200 + rng() * 250) {
    bg.midWreckage.push({
      x,
      type: Math.floor(rng() * 3), // 0 = print press, 1 = satellite dish, 2 = radio tower
      width: 80 + rng() * 60,
      height: 60 + rng() * 80,
    });
  }

  // Drifting clouds — sparse, large blobs
  for (let i = 0; i < 8; i++) {
    bg.clouds.push({
      x: rng() * canvas.width,
      y: 40 + rng() * 150,
      width: 120 + rng() * 100,
      speed: 0.1 + rng() * 0.15,
    });
  }

  // Ambient particles — embers
  for (let i = 0; i < 30; i++) {
    bg.particles.push({
      x: rng() * canvas.width,
      y: rng() * canvas.height,
      speed: 0.2 + rng() * 0.4,
      size: 1 + rng() * 2,
      drift: (rng() - 0.5) * 0.3,
    });
  }

  zoneBackground = bg;
}

// Tiny seeded PRNG so backgrounds are deterministic per zone
function mulberry32(seed) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// === Draw functions ===

function drawSky(palette) {
  // Vertical gradient from deep amber at top to lighter near horizon
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, '#1a0a06');           // very dark amber at top
  gradient.addColorStop(0.6, palette.bg);        // zone background color
  gradient.addColorStop(1, '#4a2418');           // warm horizon glow
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawDistantAntennas(palette) {
  if (!zoneBackground) return;
  // Scroll at 10% of camera speed
  const scrollX = camera.x * 0.1;
  const groundY = 440;

  ctx.fillStyle = 'rgba(50, 25, 15, 0.5)';  // dark silhouettes

  for (const a of zoneBackground.distantAntennas) {
    const sx = a.x - scrollX;
    // Skip if off-screen
    if (sx < -50 || sx > canvas.width + 50) continue;

    // Mast
    ctx.fillRect(sx, groundY - a.height, a.width, a.height);
    // Crossbar near top (antenna shape)
    ctx.fillRect(sx - 8, groundY - a.height + 10, 20, 2);
    // Optional dish
    if (a.hasDish) {
      ctx.beginPath();
      ctx.arc(sx + a.width / 2, groundY - a.height, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    // Red blinking light (always on for simplicity)
    ctx.fillStyle = '#ff4040';
    ctx.fillRect(sx + a.width / 2 - 1, groundY - a.height - 4, 2, 2);
    ctx.fillStyle = 'rgba(50, 25, 15, 0.5)';
  }
}

function drawMidWreckage(palette) {
  if (!zoneBackground) return;
  // Scroll at 40% of camera speed — closer than distant antennas
  const scrollX = camera.x * 0.4;
  const groundY = 470;

  ctx.fillStyle = 'rgba(70, 35, 20, 0.7)';

  for (const w of zoneBackground.midWreckage) {
    const sx = w.x - scrollX;
    if (sx < -150 || sx > canvas.width + 150) continue;

    switch (w.type) {
      case 0: // Collapsed print press — tilted box with small chimney
        ctx.fillRect(sx, groundY - w.height * 0.6, w.width, w.height * 0.6);
        ctx.fillRect(sx + w.width * 0.4, groundY - w.height, 14, w.height * 0.4);
        break;
      case 1: // Satellite dish — semi-circle on a pole
        ctx.fillRect(sx + w.width / 2 - 3, groundY - w.height, 6, w.height);
        ctx.beginPath();
        ctx.arc(sx + w.width / 2, groundY - w.height, w.width / 2, Math.PI, 0);
        ctx.fill();
        break;
      case 2: // Radio tower — triangular truss shape
        ctx.beginPath();
        ctx.moveTo(sx, groundY);
        ctx.lineTo(sx + w.width / 2, groundY - w.height);
        ctx.lineTo(sx + w.width, groundY);
        ctx.closePath();
        ctx.fill();
        break;
    }
  }
}

function drawClouds(palette) {
  if (!zoneBackground) return;

  // Clouds drift independently of camera, slowly across the screen
  const time = Date.now() / 1000;

  ctx.fillStyle = 'rgba(255, 153, 51, 0.06)';  // amber haze

  for (const c of zoneBackground.clouds) {
    // Calculate position: drift over time, wrap around screen
    const driftX = (c.x + time * c.speed * 10) % (canvas.width + c.width * 2) - c.width;
    // Draw as a few overlapping ellipses for cloud shape
    const cy = c.y;
    ctx.beginPath();
    ctx.ellipse(driftX, cy, c.width * 0.4, 16, 0, 0, Math.PI * 2);
    ctx.ellipse(driftX + 40, cy - 8, c.width * 0.35, 14, 0, 0, Math.PI * 2);
    ctx.ellipse(driftX + 80, cy + 4, c.width * 0.3, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawScanlines() {
  // Horizontal lines drawn across the whole screen — emulates CRT scan-lines
  ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
  for (let y = 0; y < canvas.height; y += 3) {
    ctx.fillRect(0, y, canvas.width, 1);
  }
}

function drawParticles() {
  if (!zoneBackground) return;

  // Embers drifting upward — purely cosmetic
  for (const p of zoneBackground.particles) {
    p.y -= p.speed;
    p.x += p.drift;
    if (p.y < -10) {
      p.y = canvas.height + 10;
      p.x = Math.random() * canvas.width;
    }
    ctx.fillStyle = `rgba(255, 180, 80, ${0.4 + Math.sin(Date.now() / 200 + p.x) * 0.2})`;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }
}

// Master function — called from render() before the world translate
function drawBackground(palette) {
  drawSky(palette);
  drawDistantAntennas(palette);
  drawMidWreckage(palette);
  drawClouds(palette);
}

// Called from render() AFTER the world is drawn — screen-space overlays
function drawForegroundEffects() {
  drawParticles();
  drawScanlines();
}