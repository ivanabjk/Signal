const keys = {
  left: false,
  right: false,
  jump: false,
  jumpPressed: false, // true for ONE frame when jump is first pressed
};

window.addEventListener('keydown', (e) => {
  if (e.code === 'KeyA') keys.left = true;
  if (e.code === 'KeyD') keys.right = true;
  if ((e.code === 'KeyW' || e.code === 'Space') && !keys.jump) {
    keys.jump = true;
    keys.jumpPressed = true; // edge trigger — only fires on initial press
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'KeyA') keys.left = false;
  if (e.code === 'KeyD') keys.right = false;
  if (e.code === 'KeyW' || e.code === 'Space') keys.jump = false;
});