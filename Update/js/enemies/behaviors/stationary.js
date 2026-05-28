// stationary.js

// Stationary behavior — does not move, just sits and harms Kai on contact
const StationaryBehavior = {
  init(enemy, config) {
    // No movement state needed
  },

  update(enemy, platforms) {
    // No movement — stays where it was placed
  },

  draw(ctx, enemy) {
    const bob = Math.sin(Date.now() / 400 + enemy.x * 0.02) * 3;
    const y = enemy.y + bob;

    // Glowing lure body
    ctx.fillStyle = enemy.color || "#66ff66";
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width/2, y + enemy.height/2, enemy.width/2, 0, Math.PI*2);
    ctx.fill();

    // Inner glow
    ctx.fillStyle = enemy.eyeColor || "#ff3333";
    ctx.beginPath();
    ctx.arc(enemy.x + enemy.width/2, y + enemy.height/2, enemy.width/4, 0, Math.PI*2);
    ctx.fill();
  },

  reset(enemy) {
    // Nothing to reset
  },
};
