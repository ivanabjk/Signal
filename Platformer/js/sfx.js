// Minimal sound system using Web Audio API — no files needed
let audioCtx = null;

function getAudioCtx() {
  // Created on first use because browsers require user interaction first
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

function playTone(frequency, duration, type = "square", volume = 0.15) {
  const ctx = getAudioCtx();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = type;
  osc.frequency.value = frequency;
  gain.gain.value = volume;

  // Fade out quickly so it doesn't click at the end
  gain.gain.setValueAtTime(volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + duration);
}

function playSfx(name) {
  switch (name) {
    case "jump":
      // Quick upward chirp
      playTone(440, 0.08, "square");
      setTimeout(() => playTone(660, 0.06, "square"), 40);
      break;
    case "doubleJump":
      // Higher, lighter than the regular jump — feels like a boost
      playTone(660, 0.06, "square");
      setTimeout(() => playTone(880, 0.08, "square"), 30);
      break;
    case "zap":
      // Harsh buzz — for enemy contact later
      playTone(150, 0.15, "sawtooth", 0.2);
      break;
    case "land":
      // Soft thud
      playTone(120, 0.05, "triangle", 0.1);
      break;
  }
}
