//main.js

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const heartsHud = document.getElementById("hearts");

const RESPAWN_GRACE = 90;

// Helper — converts a hex color (#rrggbb) to rgba string with given alpha
function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

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
    jumpsRemaining: 2,
    knockbackTimer: 0,
    dying: false,
  },
  levelWidth: 0,
  platforms: [],
  enemies: [],
  bubbles: [],
  bubbleSpawners: [],
  cameraRegions: [],
  hammers: [],
  currentZone: null,
  towerNearby: false,
  quizOpen: false,
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
    if (p[6]) makeMoving(platform, p[6].path, p[6].speed, p[6].pingPong);

    if (i === 0) {
      platform.style = "floor";
    } else if (p[3] > 100 && p[2] < 50) {
      platform.style = "antennaWall";
    }

    return platform;
  });

  if (zoneConfig.spikes) {
    for (const s of zoneConfig.spikes) {
      game.platforms.push(createSpike(s[0], s[1], s[2], s[3] || "#cc3333"));
    }
  }

  game.hammers = (zoneConfig.hammers || []).map((h) => createHammer(h));

  game.enemies = zoneConfig.enemies.map((e) => {
    if (e.platformIndex !== undefined) {
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
    } else {
      // For stationary enemies with explicit x/y
      return createEnemy({
        x: e.x,
        y: e.y,
        width: e.width,
        height: e.height,
        behaviorName: e.behavior,
        color: e.color,
        eyeColor: e.eyeColor,
        speed: e.options?.speed,
        activationDelay: e.options?.activationDelay,
        triggerRegion: e.options?.triggerRegion, // ← add
      });
    }
  });

  game.bubbles = [];
  game.bubbleSpawners = createSpawner(zoneConfig);
  game.cameraRegions = zoneConfig.cameraRegions || [];

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
  k.jumpsRemaining = 2;
  k.knockbackTimer = 0;
  k.invincibleTimer = RESPAWN_GRACE;
  resetEnemies(game.enemies);
  resetMovingPlatforms(game.platforms);
  clearBubbles(game.bubbles);
  resetSpawners(game.bubbleSpawners);

  for (const p of game.platforms) {
    if (p.flicker) {
      p.flicker.timer = 0;
      p.flicker.visible = p.flicker.startVisible;
      p.solid = p.flicker.startVisible;
    }
  }
  if (game.tower) game.tower.triggered = false;
  camera.x = 0;
  camera.y = 0;
}

// === Drawing ===
function drawKai() {
  const k = game.kai;
  if (k.invincibleTimer > 0 && Math.floor(k.invincibleTimer / 10) % 2 === 0) {
    return;
  }

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

  ctx.fillStyle = "rgba(127, 255, 230, 0.18)";
  ctx.fillRect(x - 3, y - 3, w + 6, h + 6);

  ctx.fillStyle = "#7fffe6";
  ctx.fillRect(x, y, w, h);

  ctx.fillStyle = "#b8fff4";
  ctx.fillRect(x, y, w, 4);

  ctx.fillStyle = "#4dd6c4";
  ctx.fillRect(x, y + h - 3, w, 3);

  ctx.fillStyle = "#0a1f1c";
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
    if (p.style === "commentCard") {
      drawCommentPlatform(p);
      continue;
    }
    if (p.style === "hashtagWall") {
      drawHashtagWall(p);
      continue;
    }
    if (p.style === "spywarePatch") {
      drawSpywarePatch(p);
      continue;
    }

    drawAntennaPlatform(p);
  }
}

function drawFloor(p) {
  const accent = game.currentZone.palette.accent || "#ff9933";

  ctx.fillStyle = "#1a1a22";
  ctx.fillRect(p.x, p.y, p.width, p.height);

  ctx.fillStyle = accent;
  ctx.fillRect(p.x, p.y, p.width, 2);

  const grad = ctx.createLinearGradient(0, p.y - 8, 0, p.y);
  grad.addColorStop(0, hexToRgba(accent, 0));
  grad.addColorStop(1, hexToRgba(accent, 0.18));
  ctx.fillStyle = grad;
  ctx.fillRect(p.x, p.y - 8, p.width, 8);

  ctx.fillStyle = "rgba(255, 255, 255, 0.05)";
  for (let i = 0; i < p.width; i += 64) {
    ctx.fillRect(p.x + i, p.y + 2, 1, p.height - 2);
  }

  ctx.fillStyle = hexToRgba(accent, 0.25);
  for (let i = 0; i < p.width; i += 96) {
    const hash = (p.x + i) * 9301 + 49297;
    const yOff = ((hash >> 1) % (p.height - 12)) + 8;
    ctx.fillRect(p.x + i + 32, p.y + yOff, 2, 2);
  }
}

function drawAntennaPlatform(p) {
  const accent = game.currentZone.palette.accent || "#ff9933";

  ctx.fillStyle = "#1a1a22";
  ctx.fillRect(p.x, p.y, p.width, p.height);

  ctx.fillStyle = accent;
  ctx.fillRect(p.x, p.y, p.width, 2);

  const grad = ctx.createLinearGradient(0, p.y - 6, 0, p.y);
  grad.addColorStop(0, hexToRgba(accent, 0));
  grad.addColorStop(1, hexToRgba(accent, 0.25));
  ctx.fillStyle = grad;
  ctx.fillRect(p.x, p.y - 6, p.width, 6);

  ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
  ctx.fillRect(p.x, p.y + 2, 1, p.height - 2);
  ctx.fillRect(p.x + p.width - 1, p.y + 2, 1, p.height - 2);

  ctx.fillStyle = "#0a0a12";
  ctx.fillRect(p.x, p.y + p.height - 2, p.width, 2);

  if (p.width > 80) {
    ctx.fillStyle = accent;
    ctx.fillRect(p.x + p.width / 2 - 2, p.y + p.height / 2 - 1, 4, 2);
  }
}

function drawAntennaWall(p) {
  const accent = game.currentZone.palette.accent || "#ff9933";

  ctx.fillStyle = "#1a1a22";
  ctx.fillRect(p.x, p.y, p.width, p.height);

  ctx.fillStyle = accent;
  ctx.fillRect(p.x, p.y, 2, p.height);
  ctx.fillRect(p.x + p.width - 2, p.y, 2, p.height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.06)";
  ctx.fillRect(p.x + p.width / 2 - 0.5, p.y, 1, p.height);

  ctx.fillStyle = accent;
  const barSpacing = 32;
  for (let by = p.y + 12; by < p.y + p.height - 4; by += barSpacing) {
    ctx.fillRect(p.x + 4, by, p.width - 8, 1);
  }

  ctx.fillStyle = "#0a0a12";
  ctx.fillRect(p.x - 2, p.y - 2, p.width + 4, 4);

  ctx.fillStyle = accent;
  ctx.fillRect(p.x + p.width / 2 - 2, p.y - 5, 4, 3);

  const grad = ctx.createRadialGradient(
    p.x + p.width / 2,
    p.y - 3,
    0,
    p.x + p.width / 2,
    p.y - 3,
    12,
  );
  grad.addColorStop(0, hexToRgba(accent, 0.5));
  grad.addColorStop(1, hexToRgba(accent, 0));
  ctx.fillStyle = grad;
  ctx.fillRect(p.x - 10, p.y - 15, p.width + 20, 15);
}

function drawBillboardPlatform(p) {
  const accent = game.currentZone.palette.accent || "#ff9933";
  const f = p.flicker;
  const isOn = f.visible;

  // Frame
  ctx.fillStyle = "#1a1a22";
  ctx.fillRect(p.x - 4, p.y - 4, p.width + 8, p.height + 8);

  ctx.fillStyle = "#2a2a32";
  ctx.fillRect(p.x - 4, p.y - 4, p.width + 8, 2);

  if (isOn) {
    // Glowing accent screen
    ctx.fillStyle = accent;
    ctx.fillRect(p.x, p.y, p.width, p.height);

    // Scrolling broadcast lines
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    const scroll = Math.floor(Date.now() / 100) % 6;
    for (let i = 0; i < Math.ceil(p.height / 3); i++) {
      const ly = p.y + ((i * 3 + scroll) % p.height);
      ctx.fillRect(p.x, ly, p.width, 1);
    }

    // Glow halo
    ctx.fillStyle = hexToRgba(accent, 0.15);
    ctx.fillRect(p.x - 8, p.y - 8, p.width + 16, p.height + 16);
  } else {
    // OFF: dark screen
    ctx.fillStyle = "#0a0a12";
    ctx.fillRect(p.x, p.y, p.width, p.height);

    // Faint static dots
    ctx.fillStyle = hexToRgba(accent, 0.2);
    for (let i = 0; i < 5; i++) {
      const hash = (p.x + i * 17 + Math.floor(Date.now() / 200)) * 9301;
      const px = p.x + Math.abs(hash % p.width);
      const py = p.y + Math.abs((hash >> 1) % p.height);
      ctx.fillRect(px, py, 1, 1);
    }
  }

  // Vertical struts
  ctx.fillStyle = "#0a0a12";
  ctx.fillRect(p.x - 4, p.y, 2, p.height);
  ctx.fillRect(p.x + p.width + 2, p.y, 2, p.height);
}

function drawSpikes(spike) {
  const spikeWidth = 12;
  const count = Math.floor(spike.width / spikeWidth);
  const offset = (spike.width - count * spikeWidth) / 2;

  for (let i = 0; i < count; i++) {
    const x = spike.x + offset + i * spikeWidth;

    ctx.fillStyle = "#2a1810";
    ctx.beginPath();
    ctx.moveTo(x, spike.y + spike.height);
    ctx.lineTo(x + spikeWidth / 2, spike.y);
    ctx.lineTo(x + spikeWidth, spike.y + spike.height);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = "#ff6b3d";
    ctx.beginPath();
    ctx.moveTo(x + spikeWidth / 2 - 2, spike.y + 5);
    ctx.lineTo(x + spikeWidth / 2, spike.y);
    ctx.lineTo(x + spikeWidth / 2 + 2, spike.y + 5);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = "#5a3018";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, spike.y + spike.height);
    ctx.lineTo(x + spikeWidth / 2, spike.y);
    ctx.stroke();
  }

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
  const accent = game.currentZone.palette.accent || "#ff9933";

  ctx.fillStyle = hexToRgba(accent, 0.15);
  ctx.fillRect(t.x - 8, t.y - 8, t.width + 16, t.height + 16);

  ctx.fillStyle = t.color;
  ctx.fillRect(t.x, t.y, t.width, t.height);

  const doorWidth = 28;
  const doorHeight = 50;
  const doorX = t.x + (t.width - doorWidth) / 2;
  const doorY = t.y + 20;
  ctx.fillStyle = t.doorColor;
  ctx.fillRect(doorX, doorY, doorWidth, doorHeight);
}

function drawTowerPrompt() {
  if (!game.towerNearby) return;
  const t = game.tower;
  const accent = game.currentZone.palette.accent || "#ff9933";

  const px = t.x + t.width / 2;
  const py = t.y - 20;
  const bob = Math.sin(Date.now() / 200) * 3;

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

  ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);

  ctx.strokeStyle = accent;
  ctx.lineWidth = 1.5;
  ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

  ctx.fillStyle = accent;
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
  game.towerNearby = rectsOverlap(game.kai, door);

  if (game.towerNearby && keys.enterPressed) {
    game.tower.triggered = true;
    keys.enterPressed = false;

    // Determine which quiz index matches this zone (0-based)
    const zoneIds = ["zone1", "zone2", "zone3"];
    const quizIdx = zoneIds.indexOf(game.currentZone.id);
    const next = game.currentZone.nextZone;

    if (quizIdx !== -1) {
      // Pause the game loop while quiz is open
      game.quizOpen = true;

      showQuiz(quizIdx, function(passed) {
        game.quizOpen = false;
        if (passed && next) {
          loadZone(next);
        } else if (passed) {
          console.log("Game complete! All zones cleared.");
        }
        // If failed, player stays in current zone (tower resets after a delay)
        if (!passed) {
          setTimeout(() => { game.tower.triggered = false; }, 2000);
        }
      });
    } else if (next) {
      loadZone(next);
    }
  }
}

function render() {
  const palette = game.currentZone.palette;

  drawBackground(palette);

  ctx.save();
  ctx.translate(
    -camera.x + camera.shakeOffsetX,
    -camera.y + camera.shakeOffsetY,
  );
  drawPlatforms();
  drawTower();
  drawTowerPrompt();
  drawEnemies(ctx, game.enemies);
  drawBubbles(ctx, game.bubbles);
  drawHammers(game.hammers);
  drawKai();
  ctx.restore();

  drawHazards(game.currentZone.hazards);
  drawForegroundEffects();
}

// === Game loop ===
function gameLoop() {
  if (!game.quizOpen) {
    updatePlatforms(game.platforms);
    updatePlayer(game.kai, game.platforms);
    updateEnemies(game.enemies, game.platforms, game);
    checkEnemyCollisions(game.kai, game.enemies);

    updateSpawners(game.bubbleSpawners, game.bubbles, game.kai.x);
    updateBubbles(game.bubbles);
    checkBubbleCollisions(game.kai, game.bubbles);

    updateHammers(game.hammers); // ← add
    checkHammerCollisions(game.kai, game.hammers); // ← add

    checkTowerEntry();
    updateCamera(game.kai, game.levelWidth, game.cameraRegions);
    updateHud();
    render();
    keys.enterPressed = false;
  }
  requestAnimationFrame(gameLoop);
}

// === Boot ===
loadZone(ZONE_1);
gameLoop();
