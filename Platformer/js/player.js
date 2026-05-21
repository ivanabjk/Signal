const PLAYER_SPEED = 3;          // was 4 — slightly slower
const JUMP_IMPULSE = -11;        // was -12 — tuned to new gravity
const INVINCIBILITY_FRAMES = 60;
const COYOTE_FRAMES = 6;         // ~100ms of "still grounded" after leaving ledge
const JUMP_BUFFER_FRAMES = 6;    // ~100ms of "remember this jump press"

function updatePlayer(kai, platforms) {
  // Horizontal input
  kai.vx = 0;
  if (keys.left)  kai.vx = -PLAYER_SPEED;
  if (keys.right) kai.vx = PLAYER_SPEED;

  // --- Jump buffering: remember the press for a few frames ---
  if (keys.jumpPressed) {
    kai.jumpBuffer = JUMP_BUFFER_FRAMES;
  }
  keys.jumpPressed = false;

  // --- Coyote time: tick down whenever in the air ---
  if (kai.onGround) {
    kai.coyoteTimer = COYOTE_FRAMES; // refresh while grounded
  } else if (kai.coyoteTimer > 0) {
    kai.coyoteTimer--;
  }

  // --- Try to jump if buffered press exists AND we're grounded (or in coyote window) ---
  if (kai.jumpBuffer > 0 && kai.coyoteTimer > 0) {
    kai.vy = JUMP_IMPULSE;
    kai.onGround = false;
    kai.coyoteTimer = 0;  // consume coyote so we can't double-jump
    kai.jumpBuffer = 0;   // consume the buffered press
    playSfx('jump');
  }

  if (kai.jumpBuffer > 0) kai.jumpBuffer--;

  // Physics
  applyGravity(kai);
  moveX(kai, platforms);
  moveY(kai, platforms);

  // Level bounds
  if (kai.x < 0) kai.x = 0;
  if (kai.x + kai.width > game.levelWidth) {
    kai.x = game.levelWidth - kai.width;
  }

  if (kai.invincibleTimer > 0) kai.invincibleTimer--;
}

function zapKai(kai) {
  if (kai.invincibleTimer > 0) return;
  kai.hearts--;
  kai.invincibleTimer = INVINCIBILITY_FRAMES;
  playSfx('zap');

  if (kai.hearts <= 0) {
    reloadZone();
  }
}

function checkEnemyCollisions(kai, enemies) {
  for (const e of enemies) {
    if (!e.alive) continue;
    if (rectsOverlap(kai, e)) {
      zapKai(kai);
      return;
    }
  }
}