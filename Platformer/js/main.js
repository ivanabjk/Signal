const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const heartsHud = document.getElementById("hearts");

const RESPAWN_GRACE = 90;

const game = {
  kai: {
    x: 100,
    y: 100,
    spawnX: 100,
    spawnY: 100,
    width: 24,
    height: 32,
    vx: 0,
    vy: 0,
    color: "#7fffe6",
    onGround: false,
    hearts: 3,
    invincibleTimer: 0,
    coyoteTimer: 0,
    jumpBuffer: 0,
    jumpsRemaining: 2, // ← add this
    knockbackTimer: 0,
    dying: false,
  },
  levelWidth: 0,
  platforms: [],
  enemies: [],
  currentZone: null,
  towerNearby: false,
};

// === Zone loading ===
function loadZone(zoneConfig) {
  game.currentZone = zoneConfig;
  buildZoneBackground(zoneConfig);

  game.platforms = zoneConfig.platforms.map((p, i) => {
    const platform = createPlatform(
      p[0],
      p[1],
      p[2],
      p[3],
      p[4] || zoneConfig.palette.platform,
    );
    if (p[5])
      makeFlickering(
        platform,
        p[5].onFrames,
        p[5].offFrames,
        p[5].startVisible,
      );

    // Auto-detect style based on platform position/properties
    if (i === 0) {
      platform.style = "floor";
    } else if (p[3] > 100 && p[2] < 50) {
      // Tall and narrow = antenna wall
      platform.style = "antennaWall";
    }
    // else: default antennaPlatform style (no field needed)

    return platform;
  });

  // Spikes — separate config array
  if (zoneConfig.spikes) {
    for (const s of zoneConfig.spikes) {
      game.platforms.push(createSpike(s[0], s[1], s[2], s[3] || "#cc3333"));
    }
  }

  game.enemies = zoneConfig.enemies.map((e) => {
    const platform = game.platforms[e.platformIndex];
    const offsetX = e.offsetX ?? 20;
    return createEnemy({
      x: platform.x + offsetX,
      y: platform.y - 28,
      behaviorName: e.behavior,
      platform: platform,
      speed: e.options?.speed,
      color: e.options?.color,
      eyeColor: e.options?.eyeColor,
    });
  });

  game.tower = zoneConfig.tower
    ? { ...zoneConfig.tower, triggered: false }
    : null;

  game.levelWidth = zoneConfig.levelWidth;
  game.kai.spawnX = zoneConfig.spawn.x;
  game.kai.spawnY = zoneConfig.spawn.y;
  document.getElementById("zone-label").textContent = zoneConfig.name;
  reloadZone();
}

function reloadZone() {
  shakeCamera(14, 24);

  const k = game.kai;
  k.dying = false;
  k.x = k.spawnX;
  k.y = k.spawnY;
  k.vx = 0;
  k.vy = 0;
  k.hearts = 3;
  k.coyoteTimer = 0;
  k.jumpBuffer = 0;
  k.jumpsRemaining = 2; // ← add this
  k.knockbackTimer = 0;
  k.invincibleTimer = RESPAWN_GRACE;
  resetEnemies(game.enemies);
  for (const p of game.platforms) {
    if (p.flicker) {
      p.flicker.timer = 0;
      p.flicker.visible = p.flicker.startVisible;
      p.solid = p.flicker.startVisible;
    }
  }
  if (game.tower) game.tower.triggered = false;
  camera.x = 0;
}

// === Drawing ===
function drawKai() {
  const k = game.kai;
  if (k.invincibleTimer > 0 && Math.floor(k.invincibleTimer / 10) % 2 === 0) {
    return;
  }

  // Subtle bob when moving, gentle breathe when still
  let bob = 0;
  if (k.onGround && Math.abs(k.vx) > 0.1) {
    bob = Math.sin(Date.now() / 80) * 1;
  } else if (k.onGround) {
    bob = Math.sin(Date.now() / 600) * 0.5;
  }
  const x = k.x;
  const y = k.y + bob;
  const w = k.width;
  const h = k.height;

  // Outer glow so Kai pops against any zone
  ctx.fillStyle = 'rgba(127, 255, 230, 0.18)';
  ctx.fillRect(x - 3, y - 3, w + 6, h + 6);

  // Body
  ctx.fillStyle = '#7fffe6';
  ctx.fillRect(x, y, w, h);

  // Top highlight (light from above)
  ctx.fillStyle = '#b8fff4';
  ctx.fillRect(x, y, w, 4);

  // Bottom shadow
  ctx.fillStyle = '#4dd6c4';
  ctx.fillRect(x, y + h - 3, w, 3);

  // Eyes — two simple dots, like before
  ctx.fillStyle = '#0a1f1c';
  ctx.fillRect(x + 6, y + 9, 4, 4);
  ctx.fillRect(x + 14, y + 9, 4, 4);
}

function drawPlatforms() {
  for (const p of game.platforms) {
    if (p.isSpike) {
      drawSpikes(p);
      continue;
    }
    if (p.flicker) {
      drawBillboardPlatform(p);
      continue;
    }
    if (p.style === "antennaWall") {
      drawAntennaWall(p);
      continue;
    }
    if (p.style === "floor") {
      drawFloor(p);
      continue;
    }
    // Default: antenna-top platform
    drawAntennaPlatform(p);
  }
}
function drawFloor(p) {
  // Dark metallic base
  ctx.fillStyle = '#1a1a22';
  ctx.fillRect(p.x, p.y, p.width, p.height);

  // Top edge — bright cyber line (the "data surface")
  const accent = game.currentZone.palette.accent || '#ff9933';
  ctx.fillStyle = accent;
  ctx.fillRect(p.x, p.y, p.width, 2);

  // Glow above the top edge — soft halo
  const grad = ctx.createLinearGradient(0, p.y - 8, 0, p.y);
  grad.addColorStop(0, 'rgba(255, 153, 51, 0)');
  grad.addColorStop(1, 'rgba(255, 153, 51, 0.18)');
  ctx.fillStyle = grad;
  ctx.fillRect(p.x, p.y - 8, p.width, 8);

  // Panel divisions — vertical lines every ~64px to suggest tiles
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  for (let i = 0; i < p.width; i += 64) {
    ctx.fillRect(p.x + i, p.y + 2, 1, p.height - 2);
  }

  // Subtle circuit dots
  ctx.fillStyle = 'rgba(255, 153, 51, 0.25)';
  for (let i = 0; i < p.width; i += 96) {
    const hash = (p.x + i) * 9301 + 49297;
    const yOff = ((hash >> 1) % (p.height - 12)) + 8;
    ctx.fillRect(p.x + i + 32, p.y + yOff, 2, 2);
  }
}

function drawAntennaPlatform(p) {
  const accent = game.currentZone.palette.accent || '#ff9933';

  // Metallic base
  ctx.fillStyle = '#1a1a22';
  ctx.fillRect(p.x, p.y, p.width, p.height);

  // Top edge — glowing accent line (where Kai walks)
  ctx.fillStyle = accent;
  ctx.fillRect(p.x, p.y, p.width, 2);

  // Soft halo above the top
  const grad = ctx.createLinearGradient(0, p.y - 6, 0, p.y);
  grad.addColorStop(0, 'rgba(255, 153, 51, 0)');
  grad.addColorStop(1, 'rgba(255, 153, 51, 0.25)');
  ctx.fillStyle = grad;
  ctx.fillRect(p.x, p.y - 6, p.width, 6);

  // Side edges — subtle highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.fillRect(p.x, p.y + 2, 1, p.height - 2);
  ctx.fillRect(p.x + p.width - 1, p.y + 2, 1, p.height - 2);

  // Bottom edge — darker for grounded look
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(p.x, p.y + p.height - 2, p.width, 2);

  // Center indicator — small accent square (like a data node)
  if (p.width > 80) {
    ctx.fillStyle = accent;
    ctx.fillRect(p.x + p.width / 2 - 2, p.y + p.height / 2 - 1, 4, 2);
  }
}

function drawAntennaWall(p) {
  const accent = game.currentZone.palette.accent || '#ff9933';

  // Dark metal base
  ctx.fillStyle = '#1a1a22';
  ctx.fillRect(p.x, p.y, p.width, p.height);

  // Edge highlights — vertical accent lines on both sides
  ctx.fillStyle = accent;
  ctx.fillRect(p.x, p.y, 2, p.height);
  ctx.fillRect(p.x + p.width - 2, p.y, 2, p.height);

  // Center seam — subtle
  ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
  ctx.fillRect(p.x + p.width / 2 - 0.5, p.y, 1, p.height);

  // Cross-bracing — small horizontal accent bars at intervals
  ctx.fillStyle = accent;
  const barSpacing = 32;
  for (let by = p.y + 12; by < p.y + p.height - 4; by += barSpacing) {
    ctx.fillRect(p.x + 4, by, p.width - 8, 1);
  }

  // Top cap — flat with a glowing dot (data antenna node)
  ctx.fillStyle = '#0a0a12';
  ctx.fillRect(p.x - 2, p.y - 2, p.width + 4, 4);

  ctx.fillStyle = accent;
  ctx.fillRect(p.x + p.width / 2 - 2, p.y - 5, 4, 3);

  // Glow halo around the top dot
  const grad = ctx.createRadialGradient(
    p.x + p.width / 2, p.y - 3, 0,
    p.x + p.width / 2, p.y - 3, 12
  );
  grad.addColorStop(0, 'rgba(255, 153, 51, 0.5)');
  grad.addColorStop(1, 'rgba(255, 153, 51, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(p.x - 10, p.y - 15, p.width + 20, 15);
}  

function drawAntennaWall(p) {
  // Main pole
  ctx.fillStyle = "#1a1a22";
  ctx.fillRect(p.x, p.y, p.width, p.height);

  // Left edge highlight
  ctx.fillStyle = "#23252d";
  ctx.fillRect(p.x, p.y, 2, p.height);

  // Right edge shadow
  ctx.fillStyle = "#0c0c10";
  ctx.fillRect(p.x + p.width - 2, p.y, 2, p.height);

  // Cross-bars all the way down (truss/scaffold look)
  // ctx.fillStyle = "#141215";
  // const barSpacing = 24;
  // for (let by = p.y + 16; by < p.y + p.height; by += barSpacing) {
  //   ctx.fillRect(p.x - 4, by, p.width + 8, 2);
  // }d

  // Top — broken/sharp tip
  ctx.fillStyle = "#3a2410";
  ctx.beginPath();
  ctx.moveTo(p.x, p.y);
  ctx.lineTo(p.x + p.width / 2, p.y - 8);
  ctx.lineTo(p.x + p.width, p.y);
  ctx.closePath();
  ctx.fill();

  // Blinking red warning light at top
  const blink = Math.floor(Date.now() / 600) % 2 === 0;
  if (blink) {
    ctx.fillStyle = "#ff4040";
    ctx.fillRect(p.x + p.width / 2 - 1, p.y - 10, 2, 2);
  }
}

function drawBillboardPlatform(p) {
  const f = p.flicker;
  const isOn = f.visible;

  // Outer frame — always visible, even when off
  ctx.fillStyle = "#3a2410";
  ctx.fillRect(p.x - 4, p.y - 4, p.width + 8, p.height + 8);

  // Frame highlight
  ctx.fillStyle = "#7a4a25";
  ctx.fillRect(p.x - 4, p.y - 4, p.width + 8, 2);

  // Screen surface
  if (isOn) {
    // ON: glowing amber screen with content
    ctx.fillStyle = "#ff9933";
    ctx.fillRect(p.x, p.y, p.width, p.height);

    // Scrolling "broadcast" lines
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    const scroll = Math.floor(Date.now() / 100) % 6;
    for (let i = 0; i < Math.ceil(p.height / 3); i++) {
      const ly = p.y + ((i * 3 + scroll) % p.height);
      ctx.fillRect(p.x, ly, p.width, 1);
    }

    // Subtle glow halo
    ctx.fillStyle = "rgba(255, 153, 51, 0.15)";
    ctx.fillRect(p.x - 8, p.y - 8, p.width + 16, p.height + 16);
  } else {
    // OFF: dark screen, faint outline
    ctx.fillStyle = "#1a0a05";
    ctx.fillRect(p.x, p.y, p.width, p.height);

    // Faint "OFF" status — barely visible static dots
    ctx.fillStyle = "rgba(100, 60, 30, 0.3)";
    for (let i = 0; i < 5; i++) {
      const hash = (p.x + i * 17 + Math.floor(Date.now() / 200)) * 9301;
      const px = p.x + Math.abs(hash % p.width);
      const py = p.y + Math.abs((hash >> 1) % p.height);
      ctx.fillRect(px, py, 1, 1);
    }
  }

  // Frame border posts (left/right vertical struts)
  ctx.fillStyle = "#2a1810";
  ctx.fillRect(p.x - 4, p.y, 2, p.height);
  ctx.fillRect(p.x + p.width + 2, p.y, 2, p.height);
}

function drawSpikes(spike) {
  const spikeWidth = 12;
  const count = Math.floor(spike.width / spikeWidth);
  const offset = (spike.width - count * spikeWidth) / 2;

  for (let i = 0; i < count; i++) {
    const x = spike.x + offset + i * spikeWidth;

    // Dark rusted-metal base
    ctx.fillStyle = "#2a1810";
    ctx.beginPath();
    ctx.moveTo(x, spike.y + spike.height);
    ctx.lineTo(x + spikeWidth / 2, spike.y);
    ctx.lineTo(x + spikeWidth, spike.y + spike.height);
    ctx.closePath();
    ctx.fill();

    // Hot tip — small triangle at the top, glowing
    ctx.fillStyle = "#ff6b3d";
    ctx.beginPath();
    ctx.moveTo(x + spikeWidth / 2 - 2, spike.y + 5);
    ctx.lineTo(x + spikeWidth / 2, spike.y);
    ctx.lineTo(x + spikeWidth / 2 + 2, spike.y + 5);
    ctx.closePath();
    ctx.fill();

    // Edge highlight on left side of spike for dimension
    ctx.strokeStyle = "#5a3018";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, spike.y + spike.height);
    ctx.lineTo(x + spikeWidth / 2, spike.y);
    ctx.stroke();
  }

  // Subtle hazard glow at the base
  const glow = ctx.createLinearGradient(
    0,
    spike.y + spike.height - 8,
    0,
    spike.y + spike.height,
  );
  glow.addColorStop(0, "rgba(255, 100, 50, 0)");
  glow.addColorStop(1, "rgba(255, 100, 50, 0.35)");
  ctx.fillStyle = glow;
  ctx.fillRect(spike.x, spike.y + spike.height - 8, spike.width, 8);
}

function drawTower() {
  if (!game.tower) return;
  const t = game.tower;

  // Soft glow
  ctx.fillStyle = "rgba(255, 153, 51, 0.15)";
  ctx.fillRect(t.x - 8, t.y - 8, t.width + 16, t.height + 16);

  // Tower body
  ctx.fillStyle = t.color;
  ctx.fillRect(t.x, t.y, t.width, t.height);

  // Door — positioned near the TOP of the tower, where the player will arrive
  const doorWidth = 28;
  const doorHeight = 50;
  const doorX = t.x + (t.width - doorWidth) / 2;
  const doorY = t.y + 20; // 20px below the top
  ctx.fillStyle = t.doorColor;
  ctx.fillRect(doorX, doorY, doorWidth, doorHeight);
}
function drawTowerPrompt() {
  if (!game.towerNearby) return;
  const t = game.tower;

  // Position above the tower
  const px = t.x + t.width / 2;
  const py = t.y - 20;

  // Subtle bobbing for visual appeal
  const bob = Math.sin(Date.now() / 200) * 3;

  // Background pill behind the text
  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = 'bold 14px "Courier New", monospace';

  const text = "PRESS ENTER";
  const padding = 8;
  const textWidth = ctx.measureText(text).width;
  const boxWidth = textWidth + padding * 2;
  const boxHeight = 22;
  const boxX = px - boxWidth / 2;
  const boxY = py - boxHeight / 2 + bob;

  // Backdrop
  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

  // Amber border
  ctx.strokeStyle = "#ff9933";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

  // Text
  ctx.fillStyle = "#ff9933";
  ctx.fillText(text, px, py + bob);

  ctx.restore();
}

function updateHud() {
  heartsHud.textContent = "♥ ".repeat(game.kai.hearts).trim() || "—";
}

function checkTowerEntry() {
  if (!game.tower || game.tower.triggered) {
    game.towerNearby = false;
    return;
  }
  const t = game.tower;
  const door = {
    x: t.x + t.door.offsetX,
    y: t.y + t.door.offsetY,
    width: t.door.width,
    height: t.door.height,
  };
  // Kai is "near" if his bounds overlap the door zone
  game.towerNearby = rectsOverlap(game.kai, door);

  // Trigger fires only on Enter press while nearby
  if (game.towerNearby && keys.enterPressed) {
    game.tower.triggered = true;
    keys.enterPressed = false; // consume the press

    console.log(
      "Tower reached and entered! Quiz / next zone would trigger here.",
      {
        topic: game.currentZone.quizTopic,
        pool: game.currentZone.quizPool,
      },
    );
    // TODO: when Zone 2 exists, call: loadZone(ZONE_2);
  }
}

function render() {
  const palette = game.currentZone.palette;

  // Background — drawn in screen space (no camera translate)
  drawBackground(palette);

  // World — drawn with camera translate
  ctx.save();
  ctx.translate(
    -camera.x + camera.shakeOffsetX,
    -camera.y + camera.shakeOffsetY,
  );
  drawPlatforms();
  drawTower();
  drawTowerPrompt();
  drawEnemies(ctx, game.enemies);
  drawKai();
  ctx.restore();

  // Foreground effects — drawn in screen space, on top of everything
  drawForegroundEffects();
}

// === Game loop ===
function gameLoop() {
  updatePlatforms(game.platforms);
  updatePlayer(game.kai, game.platforms);
  updateEnemies(game.enemies, game.platforms);
  checkEnemyCollisions(game.kai, game.enemies);
  checkTowerEntry();
  updateCamera(game.kai, game.levelWidth);
  updateHud();
  render();
  keys.enterPressed = false; // ← consume the press at end of frame
  requestAnimationFrame(gameLoop);
}

// === Boot ===
loadZone(ZONE_1);
gameLoop();
