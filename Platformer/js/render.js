//render.js

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
    a = (a + 0x6d2b79f5) | 0;
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
  gradient.addColorStop(0, palette.bg); // very dark amber at top
  gradient.addColorStop(0.6, palette.floor); // zone background color
  gradient.addColorStop(1, palette.floor); // warm horizon glow
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawDistantAntennas(palette) {
  if (!zoneBackground) return;
  const scrollX = camera.x * 0.1;
  const groundY = 440;

  const silhouetteColor = palette.wall
    ? `${palette.wall}80`
    : "rgba(50, 25, 15, 0.5)";
  ctx.fillStyle = silhouetteColor;

  for (const a of zoneBackground.distantAntennas) {
    const sx = a.x - scrollX;
    if (sx < -50 || sx > canvas.width + 50) continue;

    ctx.fillRect(sx, groundY - a.height, a.width, a.height);
    ctx.fillRect(sx - 8, groundY - a.height + 10, 20, 2);
    if (a.hasDish) {
      ctx.beginPath();
      ctx.arc(sx + a.width / 2, groundY - a.height, 8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = palette.accent || "#ff4040";
    ctx.fillRect(sx + a.width / 2 - 1, groundY - a.height - 4, 2, 2);
    ctx.fillStyle = silhouetteColor;
  }
}

function drawMidWreckage(palette) {
  if (!zoneBackground) return;
  const scrollX = camera.x * 0.4;
  const groundY = 470;

  ctx.fillStyle = palette.wall ? `${palette.wall}b0` : "rgba(70, 35, 20, 0.7)";

  for (const w of zoneBackground.midWreckage) {
    const sx = w.x - scrollX;
    if (sx < -150 || sx > canvas.width + 150) continue;

    switch (w.type) {
      case 0:
        ctx.fillRect(sx, groundY - w.height * 0.6, w.width, w.height * 0.6);
        ctx.fillRect(
          sx + w.width * 0.4,
          groundY - w.height,
          14,
          w.height * 0.4,
        );
        break;
      case 1:
        ctx.fillRect(sx + w.width / 2 - 3, groundY - w.height, 6, w.height);
        ctx.beginPath();
        ctx.arc(sx + w.width / 2, groundY - w.height, w.width / 2, Math.PI, 0);
        ctx.fill();
        break;
      case 2:
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
  const time = Date.now() / 1000;

  const accent = palette.accent || "#ff9933";
  const r = parseInt(accent.slice(1, 3), 16);
  const g = parseInt(accent.slice(3, 5), 16);
  const b = parseInt(accent.slice(5, 7), 16);
  ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.06)`;

  for (const c of zoneBackground.clouds) {
    const driftX =
      ((c.x + time * c.speed * 10) % (canvas.width + c.width * 2)) - c.width;
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
  ctx.fillStyle = "rgba(0, 0, 0, 0.08)";
  for (let y = 0; y < canvas.height; y += 3) {
    ctx.fillRect(0, y, canvas.width, 1);
  }
}

function drawParticles() {
  if (!zoneBackground) return;
  const palette = game.currentZone?.palette;
  const accent = palette?.accent || "#ff9933";
  const r = parseInt(accent.slice(1, 3), 16);
  const g = parseInt(accent.slice(3, 5), 16);
  const b = parseInt(accent.slice(5, 7), 16);

  for (const p of zoneBackground.particles) {
    p.y -= p.speed;
    p.x += p.drift;
    if (p.y < -10) {
      p.y = canvas.height + 10;
      p.x = Math.random() * canvas.width;
    }
    const alpha = 0.4 + Math.sin(Date.now() / 200 + p.x) * 0.2;
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }
}

function drawCommentPlatform(p) {
  ctx.fillStyle = "#2a2040"; // dark purple base
  ctx.fillRect(p.x, p.y, p.width, p.height);

  // Faint text lines
  ctx.fillStyle = "rgba(255,255,255,0.1)";
  for (let i = 6; i < p.height; i += 6) {
    ctx.fillRect(p.x + 4, p.y + i, p.width - 8, 1);
  }

  // Small "like" icon
  ctx.fillStyle = "#ff66cc";
  ctx.fillRect(p.x + p.width - 12, p.y + 4, 6, 6);
}

function drawHashtagWall(p) {
  ctx.fillStyle = "#1a1430"; // dark wall
  ctx.fillRect(p.x, p.y, p.width, p.height);

  ctx.fillStyle = "#ff66cc";
  ctx.font = 'bold 16px "Courier New"';
  for (let y = p.y; y < p.y + p.height; y += 40) {
    ctx.fillText("#", p.x + p.width / 2, y + 20);
  }
}

function drawNotificationBubbles() {
  ctx.fillStyle = "rgba(51,153,255,0.15)";
  for (let i = 0; i < 5; i++) {
    const x = (Date.now() / 50 + i * 120) % canvas.width;
    const y = canvas.height - ((Date.now() / 30 + i * 80) % canvas.height);
    ctx.beginPath();
    ctx.arc(x, y, 20, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawPulseLighting() {
  const alpha = (Math.sin(Date.now() / 800) + 1) * 0.15; // 0–0.3
  ctx.fillStyle = `rgba(255,102,204,${alpha})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSpywarePatch(p) {
  ctx.fillStyle = "#102010";
  ctx.fillRect(p.x, p.y, p.width, p.height);

  // Corrupted green/red glitch lines
  ctx.fillStyle = "#66ff66";
  for (let i = 0; i < p.width; i += 12) {
    ctx.fillRect(p.x + i, p.y + ((Date.now() / 50) % p.height), 2, 6);
  }

  ctx.fillStyle = "#ff3333";
  ctx.fillRect(p.x, p.y, p.width, 2);
}

function drawHammer(p) {
  const angle = (Math.sin(Date.now() / 500) * Math.PI) / 4; // swings ±45°
  const cx = p.x + p.width / 2;
  const cy = p.y;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  ctx.fillStyle = "#ff3333";
  ctx.fillRect(-10, 0, 20, 80); // hammer handle
  ctx.fillStyle = "#660000";
  ctx.fillRect(-20, 70, 40, 20); // hammer head

  ctx.restore();
}

function drawFallingCode() {
  ctx.fillStyle = "rgba(0,255,0,0.2)";
  for (let i = 0; i < 40; i++) {
    const x = (i * 50 + Date.now() / 20) % canvas.width;
    const y = (Date.now() / 10 + i * 30) % canvas.height;
    ctx.fillText("01", x, y);
  }
}

function drawErrorOverlay() {
  const alpha = (Math.sin(Date.now() / 600) + 1) * 0.1;
  ctx.fillStyle = `rgba(255,0,0,${alpha})`;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
}
function drawHazards(hazards) {
  if (!hazards) return;
  for (const h of hazards) {
    if (h.type === "hammer") {
      drawHammer(h);
    }
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
  if (game.currentZone.id === "zone2") {
    drawNotificationBubbles();
    // drawPulseLighting();
  }
  if (game.currentZone.id === "zone3") {
    drawFallingCode();
    drawErrorOverlay(); 
  }
}
