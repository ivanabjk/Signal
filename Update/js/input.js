//input.js
const keys = {
  left: false,
  right: false,
  jump: false,
  jumpPressed: false,
  enterPressed: false,
};

window.addEventListener('keydown', (e) => {
  // Prevent browser defaults (scrolling on arrows, spacebar, enter)
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space', 'Enter'].includes(e.code)) {
    e.preventDefault();
  }
  
  if (e.code === 'KeyA' || e.code === 'ArrowLeft')  keys.left = true;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = true;
  if ((e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') && !keys.jump) {
    keys.jump = true;
    keys.jumpPressed = true;
  }
  if (e.code === 'Enter') keys.enterPressed = true;

  // DEBUG: T key teleports Kai to the tower door for quick testing
  if (e.code === 'KeyT' && typeof game !== 'undefined' && game.tower) {
    game.kai.x = game.tower.x + game.tower.door.offsetX;
    game.kai.y = game.tower.y + game.tower.door.offsetY;
    game.kai.vx = 0;
    game.kai.vy = 0;
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'KeyA' || e.code === 'ArrowLeft')  keys.left = false;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = false;
  if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') keys.jump = false;
});