// Stationary behavior — doesn't move. Used for Phishing Lures in Zone 3.
// Will be filled in when we build Zone 3.

const StationaryBehavior = {
  init(enemy, config) {
    // disguise hint, etc.
  },

  update(enemy, platforms) {
    // intentionally empty
  },

  draw(ctx, enemy) {
    // For now, just draw a placeholder rectangle
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  },

  reset(enemy) {
    // nothing to reset
  },
};