// screens.js — Start Screen, Narration System, End Screen for SIGNAL

// ═══════════════════════════════════════════════════════════════
//  START SCREEN
// ═══════════════════════════════════════════════════════════════

const StartScreen = (() => {
  let _onStart = null;
  let _animFrame = null;
  let _glitchInterval = null;
  let _typewriterTimeouts = [];

  const LINES = [
    { delay: 400,  text: "The Grid has gone dark." },
    { delay: 1200, text: "NULL is flooding every district with noise." },
    { delay: 2400, text: "Your sister Mia went in to find the source." },
    { delay: 3600, text: "She hasn't come back." },
    { delay: 5000, text: "You are Kai." },
    { delay: 5800, text: "You follow her trail." },
  ];

  function show(onStart) {
    _onStart = onStart;

    const overlay = document.getElementById("start-overlay");
    overlay.classList.remove("hidden");

    _runTypewriter();
    _startGlitch();
    _animateStatic();

    // Bind start button
    const btn = document.getElementById("start-btn");
    btn.addEventListener("click", _handleStart, { once: true });

    // Also allow Enter key
    document.addEventListener("keydown", _onKeyStart);
  }

  function _handleStart() {
    document.removeEventListener("keydown", _onKeyStart);
    clearInterval(_glitchInterval);
    cancelAnimationFrame(_animFrame);
    _typewriterTimeouts.forEach(clearTimeout);

    const overlay = document.getElementById("start-overlay");
    overlay.style.transition = "opacity 0.6s ease";
    overlay.style.opacity = "0";
    setTimeout(() => {
      overlay.classList.add("hidden");
      overlay.style.opacity = "";
      overlay.style.transition = "";
      if (_onStart) _onStart();
    }, 650);
  }

  function _onKeyStart(e) {
    if (e.key === "Enter" || e.key === " ") {
      document.getElementById("start-btn").click();
    }
  }

  function _runTypewriter() {
    const container = document.getElementById("start-lore-lines");
    container.innerHTML = "";

    LINES.forEach(({ delay, text }) => {
      const t = setTimeout(() => {
        const el = document.createElement("div");
        el.className = "start-lore-line";
        el.textContent = "";
        container.appendChild(el);
        _typeChar(el, text, 0);
      }, delay);
      _typewriterTimeouts.push(t);
    });

    // Reveal the button after lore finishes
    const btnT = setTimeout(() => {
      document.getElementById("start-btn-wrap").classList.add("visible");
    }, 7200);
    _typewriterTimeouts.push(btnT);
  }

  function _typeChar(el, text, i) {
    if (i >= text.length) return;
    el.textContent += text[i];
    const t = setTimeout(() => _typeChar(el, text, i + 1), 28 + Math.random() * 18);
    _typewriterTimeouts.push(t);
  }

  function _startGlitch() {
    const glitch = document.getElementById("start-glitch-title");
    const base = "SIGNAL";
    const chars = "∆∇╳░▒▓█∑≠∞⌬Ω";

    _glitchInterval = setInterval(() => {
      if (Math.random() > 0.35) return;
      const pos = Math.floor(Math.random() * base.length);
      const corrupt = base.split("").map((c, i) =>
        i === pos ? chars[Math.floor(Math.random() * chars.length)] : c
      ).join("");
      glitch.textContent = corrupt;
      setTimeout(() => { glitch.textContent = base; }, 80 + Math.random() * 120);
    }, 300);
  }

  function _animateStatic() {
    const canvas = document.getElementById("start-static-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = 960;
    canvas.height = 540;

    let frame = 0;
    function draw() {
      _animFrame = requestAnimationFrame(draw);
      frame++;
      if (frame % 3 !== 0) return; // only update every 3 frames

      ctx.clearRect(0, 0, 960, 540);
      // Scanlines
      ctx.fillStyle = "rgba(0,0,0,0.04)";
      for (let y = 0; y < 540; y += 4) {
        ctx.fillRect(0, y, 960, 1);
      }
      // Random noise pixels
      for (let i = 0; i < 60; i++) {
        const x = Math.random() * 960;
        const y = Math.random() * 540;
        const a = Math.random() * 0.12;
        ctx.fillStyle = `rgba(255,153,51,${a})`;
        ctx.fillRect(x, y, 1 + Math.random() * 2, 1);
      }
      // Occasional horizontal glitch line
      if (Math.random() < 0.04) {
        const y = Math.floor(Math.random() * 540);
        const w = 40 + Math.random() * 200;
        const x = Math.random() * (960 - w);
        ctx.fillStyle = "rgba(255,153,51,0.08)";
        ctx.fillRect(x, y, w, 1);
      }
    }
    draw();
  }

  return { show };
})();


// ═══════════════════════════════════════════════════════════════
//  NARRATION SYSTEM — one corner message per zone/phase
// ═══════════════════════════════════════════════════════════════

const Narration = (() => {
  // Per-zone narration beats (index = zone order: 0, 1, 2)
  // Each is shown once when the zone loads
  const ZONE_BEATS = [
    {
      zone: "Zone 1 — The Broadcast District",
      accent: "#ff9933",
      lines: [
        { speaker: "KAI",  text: "The airwaves are jammed. Mia came through here." },
        { speaker: "ECHO", text: "Ad-bots swarm every signal. Reach the checkpoint tower." },
        { speaker: "ECHO", text: "Prove you can tell real media from the noise — or the door stays locked." },
      ],
    },
    {
      zone: "Zone 2 — The Social Quarter",
      accent: "#ff3399",
      lines: [
        { speaker: "KAI",  text: "Her trail leads up. The whole district is shouting into the void." },
        { speaker: "ECHO", text: "Troll-bots own every platform. Nobody's listening to anyone." },
        { speaker: "ECHO", text: "Show it how real communication works. I'll stay with you." },
      ],
    },
    {
      zone: "Zone 3 — The Dark Web Depths",
      accent: "#ff2222",
      lines: [
        { speaker: "KAI",  text: "This is where it all started. I can feel it." },
        { speaker: "NULL", text: "you∆should∆not∆be∆here" },
        { speaker: "ECHO", text: "Name every threat NULL unleashed. Break the signal. Find Mia." },
      ],
    },
  ];

  let _currentZoneIdx = -1;
  let _lineIdx = 0;
  let _timeout = null;
  let _visible = false;

  function showForZone(zoneId) {
    const zoneIds = ["zone1", "zone2", "zone3"];
    const idx = zoneIds.indexOf(zoneId);
    if (idx === -1) return;

    _currentZoneIdx = idx;
    _lineIdx = 0;

    // Small delay so zone transition settles first
    clearTimeout(_timeout);
    _timeout = setTimeout(() => _showNextLine(), 1200);
  }

  function _showNextLine() {
    const beat = ZONE_BEATS[_currentZoneIdx];
    if (!beat || _lineIdx >= beat.lines.length) return;

    const line = beat.lines[_lineIdx];
    _lineIdx++;

    _display(line.speaker, line.text, beat.accent, () => {
      // Auto-advance to next line after a pause
      if (_lineIdx < beat.lines.length) {
        _timeout = setTimeout(_showNextLine, 500);
      }
    });
  }

  function _display(speaker, text, accent, onDone) {
    const box = document.getElementById("narration-box");
    const speakerEl = document.getElementById("narration-speaker");
    const textEl = document.getElementById("narration-text");
    const cursor = document.getElementById("narration-cursor");
    if (!box) return;

    // Set colour based on speaker
    const color = speaker === "NULL" ? "#ff2222"
                : speaker === "KAI"  ? "#7fffe6"
                : speaker === "ECHO" ? "rgba(0,255,136,0.85)"
                : accent;

    box.style.setProperty("--narr-accent", accent);
    speakerEl.style.color = color;
    speakerEl.textContent = speaker;
    textEl.textContent = "";
    cursor.style.display = "inline";

    // Remove old classes, re-trigger animation
    box.classList.remove("narr-visible", "narr-exit");
    void box.offsetWidth;
    box.classList.add("narr-visible");
    _visible = true;

    // Typewrite text
    let i = 0;
    const interval = setInterval(() => {
      if (i >= text.length) {
        clearInterval(interval);
        cursor.style.display = "none";
        // Hold, then fade out
        _timeout = setTimeout(() => {
          box.classList.remove("narr-visible");
          box.classList.add("narr-exit");
          _visible = false;
          setTimeout(() => {
            box.classList.remove("narr-exit");
            if (onDone) onDone();
          }, 500);
        }, 2800);
        return;
      }
      textEl.textContent += text[i++];
    }, 30);
  }

  return { showForZone };
})();


// ═══════════════════════════════════════════════════════════════
//  END SCREEN
// ═══════════════════════════════════════════════════════════════

const EndScreen = (() => {
  let _glitchInterval = null;
  let _staticFrame = null;
  let _typeTimeouts = [];

  const ENDING_LINES = [
    { delay: 600,  speaker: "KAI",  color: "#7fffe6", text: "Mia. I found you." },
    { delay: 2000, speaker: "MIA",  color: "#fac060", text: "You made it. I knew you would." },
    { delay: 3600, speaker: "MIA",  color: "#fac060", text: "NULL built all of this from one idea — that confusion is more profitable than clarity." },
    { delay: 5800, speaker: "MIA",  color: "#fac060", text: "Accurate information, correctly classified — that was always the weapon." },
    { delay: 7800, speaker: "ECHO", color: "rgba(0,255,136,0.9)", text: "The Grid is rebooting. Signal restored." },
    { delay: 9400, speaker: "ECHO", color: "rgba(0,255,136,0.9)", text: "NULL neutralised. All districts clear." },
  ];

  function show(finalScore) {
    const overlay = document.getElementById("end-overlay");
    overlay.classList.remove("hidden");

    // Set score
    document.getElementById("end-score-val").textContent = String(finalScore || 0).padStart(6, "0");

    _runEndTypewriter();
    _startEndGlitch();
    _animateEndStatic();

    document.getElementById("end-restart-btn").addEventListener("click", () => {
      location.reload();
    }, { once: true });
  }

  function _runEndTypewriter() {
    const container = document.getElementById("end-dialogue");
    container.innerHTML = "";

    ENDING_LINES.forEach(({ delay, speaker, color, text }) => {
      const t = setTimeout(() => {
        const wrap = document.createElement("div");
        wrap.className = "end-dialogue-line";
        wrap.innerHTML = `<span class="end-dlg-who" style="color:${color}">${speaker}</span><span class="end-dlg-text"></span>`;
        container.appendChild(wrap);
        wrap.scrollIntoView({ behavior: "smooth", block: "nearest" });

        const textEl = wrap.querySelector(".end-dlg-text");
        _typeChar(textEl, `"${text}"`, 0);
      }, delay);
      _typeTimeouts.push(t);
    });

    // Reveal restart after last line
    const btnT = setTimeout(() => {
      document.getElementById("end-cta-wrap").classList.add("visible");
    }, 11500);
    _typeTimeouts.push(btnT);
  }

  function _typeChar(el, text, i) {
    if (i >= text.length) return;
    el.textContent += text[i];
    const t = setTimeout(() => _typeChar(el, text, i + 1), 24 + Math.random() * 14);
    _typeTimeouts.push(t);
  }

  function _startEndGlitch() {
    const title = document.getElementById("end-null-text");
    const words = ["NULL", "NΩL∆", "N∇LL", "NU∑∑", "NULL", "∅∅∅∅"];
    let wi = 0;
    _glitchInterval = setInterval(() => {
      title.textContent = words[wi % words.length];
      wi++;
      if (wi >= words.length * 3) {
        clearInterval(_glitchInterval);
        title.textContent = "NEUTRALISED";
        title.style.color = "rgba(0,255,136,0.7)";
        title.style.textShadow = "0 0 20px rgba(0,255,136,0.4)";
      }
    }, 180);
  }

  function _animateEndStatic() {
    const canvas = document.getElementById("end-static-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = 960;
    canvas.height = 540;

    let frame = 0;
    function draw() {
      _staticFrame = requestAnimationFrame(draw);
      frame++;
      if (frame % 3 !== 0) return;
      ctx.clearRect(0, 0, 960, 540);
      // Scanlines
      ctx.fillStyle = "rgba(0,0,0,0.035)";
      for (let y = 0; y < 540; y += 4) ctx.fillRect(0, y, 960, 1);
      // Green static (signal restored)
      for (let i = 0; i < 40; i++) {
        const x = Math.random() * 960;
        const y = Math.random() * 540;
        ctx.fillStyle = `rgba(0,255,136,${Math.random() * 0.07})`;
        ctx.fillRect(x, y, 1 + Math.random() * 2, 1);
      }
    }
    draw();
  }

  return { show };
})();
