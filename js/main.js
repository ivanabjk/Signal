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
    color: "#ffd84d",
    onGround: false,
    hearts: 3,
    invincibleTimer: 0,
    coyoteTimer: 0,
    jumpBuffer: 0,
  },
  levelWidth: 0,
  platforms: [],
  enemies: [],
  currentZone: null,
};

// === Zone loading ===
function loadZone(zoneConfig) {
  game.currentZone = zoneConfig;

  game.platforms = zoneConfig.platforms.map((p) =>
    createPlatform(p[0], p[1], p[2], p[3], p[4] || zoneConfig.palette.platform),
  );

  game.enemies = zoneConfig.enemies.map((e) => {
    const platform = game.platforms[e.platformIndex];
    if (e.type === "patrol") {
      const offsetX = e.offsetX ?? 20; // default to 20 if not specified
      const x = platform.x + offsetX;
      const y = platform.y - 28;
      return createPatrolEnemy(x, y, platform, e.options);
    }
  });

  game.levelWidth = zoneConfig.levelWidth;
  game.kai.spawnX = zoneConfig.spawn.x;
  game.kai.spawnY = zoneConfig.spawn.y;
  document.getElementById("zone-label").textContent = zoneConfig.name;
  reloadZone();
}

function reloadZone() {
  const k = game.kai;
  k.x = k.spawnX;
  k.y = k.spawnY;
  k.vx = 0;
  k.vy = 0;
  k.hearts = 3;
  k.coyoteTimer = 0;
  k.jumpBuffer = 0;
  k.invincibleTimer = RESPAWN_GRACE;
  resetEnemies(game.enemies);
  camera.x = 0;
}

// === Drawing ===
function drawKai() {
  const k = game.kai;
  if (k.invincibleTimer > 0 && Math.floor(k.invincibleTimer / 6) % 2 === 0) {
    return;
  }
  ctx.fillStyle = k.color;
  ctx.fillRect(k.x, k.y, k.width, k.height);
  ctx.fillStyle = "#000";
  ctx.fillRect(k.x + 6, k.y + 8, 4, 4);
  ctx.fillRect(k.x + 14, k.y + 8, 4, 4);
}

function drawPlatforms() {
  for (const p of game.platforms) {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.width, p.height);
  }
}

function updateHud() {
  heartsHud.textContent = "♥ ".repeat(game.kai.hearts).trim() || "—";
}

function render() {
  const palette = game.currentZone.palette;
  ctx.fillStyle = palette.bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  ctx.translate(-camera.x, -camera.y);
  drawPlatforms();
  drawEnemies(ctx, game.enemies);
  drawKai();
  ctx.restore();
}

// === Game loop ===
function gameLoop() {
  updatePlatforms(game.platforms);
  updatePlayer(game.kai, game.platforms);
  updateEnemies(game.enemies);
  checkEnemyCollisions(game.kai, game.enemies);
  updateCamera(game.kai, game.levelWidth);
  updateHud();
  render();
  requestAnimationFrame(gameLoop);
}

// === Boot ===
loadZone(ZONE_1);
gameLoop();
