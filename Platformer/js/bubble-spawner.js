// bubble-spawner.js

// Bubble spawner — manages spawn points and timing for hazardous bubbles.

function createSpawner(zoneConfig) {
  if (!zoneConfig.bubbleSpawners) return [];
  return zoneConfig.bubbleSpawners.map(s => ({
    x: s.x,
    spawnY: s.spawnY || 1100,        // where bubbles enter (below visible area)
    interval: s.interval || 90,       // frames between spawns
    timer: Math.floor(Math.random() * s.interval), // start with random offset so spawners don't sync
    options: s.options || {},
  }));
}

function updateSpawners(spawners, bubbles, kaiX) {
  for (const s of spawners) {
    s.timer++;
    if (s.timer >= s.interval) {
      s.timer = 0;
      // Only spawn if reasonably near the player (saves performance + makes off-screen
      // areas calm — bubbles don't pile up where Kai isn't)
      if (Math.abs(s.x - kaiX) < 1200) {
        // Small horizontal jitter for variety
        const jitterX = s.x + (Math.random() - 0.5) * 40;
        bubbles.push(createBubble(jitterX, s.spawnY, s.options));
      }
    }
  }
}

function resetSpawners(spawners) {
  for (const s of spawners) {
    s.timer = Math.floor(Math.random() * s.interval);
  }
}