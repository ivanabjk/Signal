const keys = {
  left: false,
  right: false,
  jump: false,
  jumpPressed: false,
  enterPressed: false,
};

window.addEventListener('keydown', (e) => {
  // Prevent browser defaults (scrolling on arrows, spacebar)
  if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Space'].includes(e.code)) {
    e.preventDefault();
  }
  
  if (e.code === 'KeyA' || e.code === 'ArrowLeft')  keys.left = true;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = true;
  if ((e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') && !keys.jump) {
    keys.jump = true;
    keys.jumpPressed = true;
  }
  if (e.code === 'Enter') keys.enterPressed = true;
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'KeyA' || e.code === 'ArrowLeft')  keys.left = false;
  if (e.code === 'KeyD' || e.code === 'ArrowRight') keys.right = false;
  if (e.code === 'KeyW' || e.code === 'ArrowUp' || e.code === 'Space') keys.jump = false;
});