//player.js

const PLAYER_SPEED = 2.5;
const JUMP_IMPULSE = -8;
const DOUBLE_JUMP_IMPULSE = -7.5;
const MAX_JUMPS = 2;
const INVINCIBILITY_FRAMES = 270; // was 60 — now 1.5 seconds
const COYOTE_FRAMES = 8;
const JUMP_BUFFER_FRAMES = 10;
const KNOCKBACK_X = 6; // horizontal push away from enemy
const KNOCKBACK_Y = -7; // upward push (negative = up)
const KNOCKBACK_FRAMES = 10;

function updatePlayer(kai, platforms) {
  // Knockback override — input ignored for a few frames after zap
  if (kai.knockbackTimer > 0) {
    kai.knockbackTimer--;
    // Don't read input, don't change vx — let physics carry the knockback
  } else {
    // Normal input
    kai.vx = 0;
    if (keys.left) kai.vx = -PLAYER_SPEED;
    if (keys.right) kai.vx = PLAYER_SPEED;
  }

  // === Track grounded state and jump availability ===
  if (kai.onGround) {
    kai.coyoteTimer = COYOTE_FRAMES;
    kai.jumpsRemaining = MAX_JUMPS;
  } else if (kai.coyoteTimer > 0) {
    kai.coyoteTimer--;
  }

  // === Buffer new jump press ===
  if (keys.jumpPressed) {
    kai.jumpBuffer = JUMP_BUFFER_FRAMES;
  }
  keys.jumpPressed = false;

  // === Try to consume the buffer ===
  if (kai.jumpBuffer > 0 && kai.jumpsRemaining > 0) {
    // Choose impulse: first jump uses ground impulse, second uses air impulse
    const isFirstJump = kai.jumpsRemaining === MAX_JUMPS;
    kai.vy = isFirstJump ? JUMP_IMPULSE : DOUBLE_JUMP_IMPULSE;
    kai.onGround = false;
    kai.jumpsRemaining--;
    kai.jumpBuffer = 0;
    if (isFirstJump) {
      kai.coyoteTimer = 0;
      playSfx("jump");
    } else {
      playSfx("doubleJump");
    }
  }

  if (kai.jumpBuffer > 0) kai.jumpBuffer--;

  // Physics
  applyGravity(kai);
  moveX(kai, platforms);
  moveY(kai, platforms);
  applyMovingPlatformCarry(kai, platforms);
  // === Spike check ===
  const spike = checkHarmfulCollision(kai, platforms);
  if (spike) {
    killKaiInstantly();
    return; // skip the rest of the update — Kai is being reloaded
  }

  // === Pit check ===
  if (kai.y > 600) {
    // adjust based on your level height
    killKaiInstantly(); // already defined
    kai.hearts = 0; // force hearts to zero
    reloadZone(); // restart from spawn
    return;
  }

  if (kai.x < 0) kai.x = 0;
  if (kai.x + kai.width > game.levelWidth) {
    kai.x = game.levelWidth - kai.width;
  }

  if (kai.invincibleTimer > 0) kai.invincibleTimer--;
}

function zapKai(kai, enemy) {
  if (kai.invincibleTimer > 0) return;
  kai.hearts--;
  kai.invincibleTimer = INVINCIBILITY_FRAMES;
  playSfx("zap");
  shakeCamera(6, 12);

  if (enemy) {
    const kaiCenterX = kai.x + kai.width / 2;
    const enemyCenterX = enemy.x + enemy.width / 2;
    const direction = kaiCenterX < enemyCenterX ? -1 : 1;
    kai.vx = KNOCKBACK_X * direction;
    kai.vy = KNOCKBACK_Y;
    kai.onGround = false;
    kai.knockbackTimer = KNOCKBACK_FRAMES;
  }

  if (kai.hearts <= 0) {
    reloadZone();
  }
}
// Add this function to player.js
function killKaiInstantly() {
  if (game.kai.dying) return; // already dying
  game.kai.dying = true;
  game.kai.hearts = 0;
  playSfx("zap");
  shakeCamera(16, 30);
  reloadZone();
}

function checkEnemyCollisions(kai, enemies) {
  for (const e of enemies) {
    if (!e.alive) continue;
    if (rectsOverlap(kai, e)) {
      if (e.behavior && e.behavior === ChaserBehavior) {
        // Chasers insta-kill
        killKaiInstantly();
      } else {
        // Normal enemies zap
        zapKai(kai, e);
      }
      return;
    }
  }
}

function checkBubbleCollisions(kai, bubbles) {
  for (const b of bubbles) {
    if (!b.alive) continue;
    if (rectsOverlap(kai, b)) {
      // Bubble pops on contact AND zaps Kai
      b.alive = false;
      zapKai(kai, b);
      return;
    }
  }
}
