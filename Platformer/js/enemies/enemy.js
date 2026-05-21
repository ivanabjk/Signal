// Base enemy module — handles everything shared:
// position, size, alive state, contact damage, reset, behavior dispatch.

// Registry mapping behavior name strings to behavior objects
const BEHAVIORS = {
  patrol: PatrolBehavior,
  stationary: StationaryBehavior,
};

function createEnemy(config) {
  const enemy = {
    x: config.x,
    y: config.y,
    width: config.width || 28,
    height: config.height || 28,
    color: config.color || '#ff6b3d',
    eyeColor: config.eyeColor || '#fff',
    alive: true,
    spawnX: config.x,
    spawnY: config.y,
    behavior: BEHAVIORS[config.behaviorName],
    behaviorState: {},
  };

  if (!enemy.behavior) {
    console.error(`Unknown enemy behavior: ${config.behaviorName}`);
    return enemy;
  }

  // Let the behavior set up its own state
  enemy.behavior.init(enemy, config);
  return enemy;
}

function updateEnemies(enemies, platforms) {
  for (const e of enemies) {
    if (!e.alive) continue;
    e.behavior.update(e, platforms);
  }
}

function drawEnemies(ctx, enemies) {
  for (const e of enemies) {
    if (!e.alive) continue;
    e.behavior.draw(ctx, e);
  }
}

function resetEnemies(enemies) {
  for (const e of enemies) {
    e.x = e.spawnX;
    e.y = e.spawnY;
    e.alive = true;
    if (e.behavior.reset) e.behavior.reset(e);
  }
}