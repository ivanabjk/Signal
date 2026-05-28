// quiz.js — Checkpoint Quiz overlay, integrated into the SIGNAL platformer

// ─── ZONE QUIZ DATA ───────────────────────────────────────────────────────────
// Each entry mirrors a platformer zone (index 0 = Zone 1, etc.)
const QUIZ_DATA = [
  {
    zoneId: 1,
    name: "The Broadcast District",
    echoIntro: "NULL scrambled every media signal in this district. Classify each item by its true format — the gate opens only on correct signals.",
    echoLine: "NULL scrambled every media signal in this district. Sort them.",
    quote: '"Everything looks like news here. Not everything is."',
    goal: 8,
    cats: [
      { id: "social",    label: "Social & Online",    glow: "rgba(239,159,39,.7)",  bdr: "rgba(239,159,39,.45)", bg: "linear-gradient(160deg,rgba(239,159,39,.18),rgba(239,159,39,.06))" },
      { id: "audiovid",  label: "Audio & Video",       glow: "rgba(239,159,39,.5)",  bdr: "rgba(239,159,39,.3)",  bg: "linear-gradient(160deg,rgba(239,159,39,.12),rgba(239,159,39,.04))" },
      { id: "broadcast", label: "Broadcast & Outdoor", glow: "rgba(239,159,39,.85)", bdr: "rgba(239,159,39,.58)", bg: "linear-gradient(160deg,rgba(239,159,39,.22),rgba(239,159,39,.08))" },
      { id: "written",   label: "Written & Print",     glow: "rgba(239,159,39,.4)",  bdr: "rgba(239,159,39,.22)", bg: "linear-gradient(160deg,rgba(239,159,39,.09),rgba(239,159,39,.03))" },
    ],
    pool: [
      { term: "Instagram Post",    cat: "social",    hint: "Social platforms are a digital media type." },
      { term: "TikTok Video",      cat: "social",    hint: "Short-form video is a social media format." },
      { term: "Blog Post",         cat: "social",    hint: "Web publishing is online social media." },
      { term: "YouTube Video",     cat: "audiovid",  hint: "Video streaming platforms are digital media." },
      { term: "Podcast Episode",   cat: "audiovid",  hint: "Audio streaming is a form of digital media." },
      { term: "TV Commercial",     cat: "broadcast", hint: "Broadcast television is a traditional mass medium." },
      { term: "Radio Broadcast",   cat: "broadcast", hint: "Radio is a traditional broadcast medium." },
      { term: "Billboard Ad",      cat: "broadcast", hint: "Outdoor advertising is a broadcast-adjacent format." },
      { term: "Newspaper Article", cat: "written",   hint: "Print media is one of the oldest formats." },
    ],
    beat: {
      speaker: "ECHO", col: "rgba(0,255,136,.8)", bg: "rgba(0,255,136,.04)", bdr: "rgba(0,255,136,.14)",
      text: "Mia's press badge is inside this gate. She was here, Kai. The signal is traceable. Zone 2 is deeper — The Social Quarter is where NULL really embedded itself.",
    },
  },
  {
    zoneId: 2,
    name: "The Social Quarter",
    echoIntro: "NULL severed every communication channel in The Social Quarter. Classify each by how it actually works — the gate opens only on correct signals.",
    echoLine: "NULL severed every channel here. Show it how real communication works.",
    quote: '"Everyone is talking. Nobody is listening."',
    goal: 8,
    cats: [
      { id: "inperson",     label: "In-Person",    glow: "rgba(91,200,245,.7)",  bdr: "rgba(91,200,245,.45)", bg: "linear-gradient(160deg,rgba(91,200,245,.18),rgba(91,200,245,.06))" },
      { id: "nonverbal",    label: "Non-Verbal",    glow: "rgba(91,200,245,.5)",  bdr: "rgba(91,200,245,.3)",  bg: "linear-gradient(160deg,rgba(91,200,245,.12),rgba(91,200,245,.04))" },
      { id: "live_digital", label: "Live Digital",  glow: "rgba(91,200,245,.85)", bdr: "rgba(91,200,245,.58)", bg: "linear-gradient(160deg,rgba(91,200,245,.22),rgba(91,200,245,.08))" },
      { id: "async",        label: "Async Written", glow: "rgba(91,200,245,.4)",  bdr: "rgba(91,200,245,.22)", bg: "linear-gradient(160deg,rgba(91,200,245,.09),rgba(91,200,245,.03))" },
    ],
    pool: [
      { term: "Face-to-Face Talk", cat: "inperson",     hint: "Direct in-person verbal interaction." },
      { term: "Group Discussion",  cat: "inperson",     hint: "Multiple people exchanging ideas in person." },
      { term: "Public Speech",     cat: "inperson",     hint: "One-to-many verbal communication in person." },
      { term: "Sign Language",     cat: "nonverbal",    hint: "A nonverbal, visual communication system." },
      { term: "Video Call",        cat: "live_digital", hint: "Synchronous visual digital communication." },
      { term: "Phone Call",        cat: "live_digital", hint: "Synchronous real-time audio communication." },
      { term: "Text Message",      cat: "async",        hint: "Asynchronous written digital communication." },
      { term: "Email Thread",      cat: "async",        hint: "Asynchronous written digital exchange." },
    ],
    beat: {
      speaker: "ECHO", col: "rgba(0,255,136,.8)", bg: "rgba(0,255,136,.04)", bdr: "rgba(0,255,136,.14)",
      text: "I remember what I was built for now. I'll stay with you, Kai. Mia's signal is strongest ahead — in the Dark Web Depths. That's where NULL was born. Be careful what you touch in there.",
    },
  },
  {
    zoneId: 3,
    name: "The Dark Web Depths",
    echoIntro: "NULL's origin server. Every cyber threat in The Grid was deployed from here. Classify them all — this is the last gate between you and Mia.",
    echoLine: "NULL's origin server. Name every threat. The final gate is ahead.",
    quote: '"This is where NULL was born."',
    goal: 8,
    cats: [
      { id: "malware",   label: "Malware",        glow: "rgba(226,75,74,.85)", bdr: "rgba(226,75,74,.58)", bg: "linear-gradient(160deg,rgba(226,75,74,.22),rgba(226,75,74,.08))" },
      { id: "network",   label: "Network Attack",  glow: "rgba(226,75,74,.5)",  bdr: "rgba(226,75,74,.3)",  bg: "linear-gradient(160deg,rgba(226,75,74,.12),rgba(226,75,74,.04))" },
      { id: "deception", label: "Deception",       glow: "rgba(226,75,74,.7)",  bdr: "rgba(226,75,74,.45)", bg: "linear-gradient(160deg,rgba(226,75,74,.18),rgba(226,75,74,.06))" },
      { id: "exploit",   label: "Code Exploit",    glow: "rgba(226,75,74,.4)",  bdr: "rgba(226,75,74,.22)", bg: "linear-gradient(160deg,rgba(226,75,74,.09),rgba(226,75,74,.03))" },
    ],
    pool: [
      { term: "Ransomware",         cat: "malware",   hint: "Malware that encrypts files and demands payment." },
      { term: "Spyware",            cat: "malware",   hint: "Software that secretly monitors your activity." },
      { term: "DDoS Attack",        cat: "network",   hint: "Overwhelming a server with massive traffic." },
      { term: "SQL Injection",      cat: "network",   hint: "Malicious code inserted into database queries." },
      { term: "Phishing Email",     cat: "deception", hint: "Deceptive emails designed to steal credentials." },
      { term: "Social Engineering", cat: "deception", hint: "Manipulating people rather than systems directly." },
      { term: "Brute Force",        cat: "exploit",   hint: "Systematically trying passwords until one works." },
      { term: "Zero-Day Exploit",   cat: "exploit",   hint: "Attacking an unknown, unpatched vulnerability." },
    ],
    beat: {
      speaker: "MIA", col: "rgba(250,192,96,.9)", bg: "rgba(250,192,96,.04)", bdr: "rgba(250,192,96,.18)",
      text: "You made it. NULL built all of this from one idea — that confusion is more profitable than clarity. Accurate information, correctly classified — that was always the weapon. The Grid is rebooting.",
    },
  },
];

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const Q_TICK_MS  = 100;
const Q_BASE_SPD = 2.3;
const Q_SPD_INC  = 0.4;
const Q_SPAWN_MS = 2600;
const Q_MAX_CARDS = 4;
const Q_CARD_H   = 78;
const qShuffle   = a => [...a].sort(() => Math.random() - 0.5);
const qPad       = n => String(n).padStart(3, "0");

// ─── STATE ────────────────────────────────────────────────────────────────────
let qCards = [], qScore = 0, qLives = 3, qZoneCorrect = 0;
let qSelId = null, qPool = [], qPoolIdx = 0, qCardId = 0;
let qFallTimer = null, qSpawnTimer = null;
let qZoneIdx = 0, qGameActive = false;
let qOnComplete = null; // callback: (passed) => void

// ─── DOM REFS (resolved lazily after DOM ready) ───────────────────────────────
let $qOverlay, $qPlay, $qInner, $qBins, $qEcho, $qProg, $qHearts, $qNullFx, $qScoreVal, $qZoneSub;

function qInitDom() {
  $qOverlay  = document.getElementById("quiz-overlay");
  $qInner    = document.getElementById("quiz-inner");
  $qPlay     = document.getElementById("quiz-play");
  $qBins     = document.getElementById("quiz-bins");
  $qEcho     = document.getElementById("quiz-echo-msg");
  $qProg     = document.getElementById("quiz-prog-fill");
  $qHearts   = document.querySelectorAll(".quiz-heart");
  $qNullFx   = document.getElementById("quiz-null-fx");
  $qScoreVal = document.getElementById("quiz-score-val");
  $qZoneSub  = document.getElementById("quiz-zone-sub");
}

// ─── PUBLIC ENTRY POINT ───────────────────────────────────────────────────────
// Call this from main.js instead of loadZone(next)
// zoneIndex: 0-based index matching QUIZ_DATA
// onComplete(passed): called when quiz ends — true = passed, false = failed
function showQuiz(zoneIndex, onComplete) {
  qInitDom();
  qZoneIdx   = zoneIndex;
  qOnComplete = onComplete;
  qScore     = 0;

  $qOverlay.classList.remove("hidden");


  qStartZone(zoneIndex);
}

// ─── THEME ────────────────────────────────────────────────────────────────────
const ZONE_CLASSES = ["qz1", "qz2", "qz3"];
function qSetTheme(i) {
  $qInner.className = "quiz-inner " + (ZONE_CLASSES[i] || "qz1");
}

// ─── HUD ─────────────────────────────────────────────────────────────────────
function qUpdateHUD() {
  if ($qScoreVal) $qScoreVal.textContent = qPad(qScore);
  const goal = QUIZ_DATA[qZoneIdx].goal;
  if ($qProg) $qProg.style.width = ((qZoneCorrect / goal) * 100) + "%";
  if ($qHearts) $qHearts.forEach((h, i) => h.classList.toggle("off", i >= qLives));
}

function qSetEcho(t) { if ($qEcho) $qEcho.textContent = t; }

function qTriggerNull() {
  if (!$qNullFx) return;
  $qNullFx.classList.remove("on");
  void $qNullFx.offsetWidth;
  $qNullFx.classList.add("on");
  setTimeout(() => $qNullFx.classList.remove("on"), 600);
}

function qShowToast(hint) {
  document.querySelectorAll(".quiz-toast").forEach(t => t.remove());
  const el = document.createElement("div");
  el.className = "quiz-toast";
  el.innerHTML = `<div class="quiz-toast-lbl">ECHO · HINT</div>${hint}`;
  $qPlay.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ─── PANEL OVERLAY (inside quiz) ─────────────────────────────────────────────
function qShowPanel(html, cb) {
  const panel = document.getElementById("quiz-panel-overlay");
  panel.innerHTML = html;
  panel.classList.remove("hidden");
  const btn = panel.querySelector(".quiz-btn");
  if (btn && cb) btn.addEventListener("click", () => { panel.classList.add("hidden"); cb(); });
}

// ─── BINS ─────────────────────────────────────────────────────────────────────
function qBuildBins(zone) {
  $qBins.innerHTML = "";
  zone.cats.forEach(cat => {
    const bin = document.createElement("div");
    bin.className = "quiz-bin";
    bin.dataset.bid = cat.id;
    bin.style.background  = cat.bg;
    bin.style.borderColor = cat.bdr;
    bin.style.setProperty("--bin-glow", cat.glow);
    bin.innerHTML = `<div class="quiz-bin-lbl">${cat.label}</div><div class="quiz-bin-ico"></div>`;
    bin.addEventListener("dragover",  e => { e.preventDefault(); bin.classList.add("hi"); });
    bin.addEventListener("dragleave", () => { if (!qSelId) bin.classList.remove("hi"); });
    bin.addEventListener("drop", e => {
      e.preventDefault(); bin.classList.remove("hi");
      const cid = parseInt(e.dataTransfer.getData("text/plain"), 10);
      if (!isNaN(cid)) qHandleSort(cid, cat.id);
    });
    bin.addEventListener("click", () => { if (qSelId !== null) qHandleSort(qSelId, cat.id); });
    $qBins.appendChild(bin);
  });
}

function qFlashBin(bid, ok) {
  const bin = $qBins.querySelector(`.quiz-bin[data-bid="${bid}"]`);
  if (!bin) return;
  const ico = bin.querySelector(".quiz-bin-ico");
  bin.classList.remove("ok", "err");
  void bin.offsetWidth;
  bin.classList.add(ok ? "ok" : "err");
  ico.textContent = ok ? "✓" : "✗";
  setTimeout(() => { bin.classList.remove("ok", "err"); ico.textContent = ""; }, 480);
}

// ─── SCREENS ──────────────────────────────────────────────────────────────────
function qShowZoneIntro(idx) {
  const z = QUIZ_DATA[idx];
  const chips = z.cats.map(c =>
    `<span class="quiz-bin-chip" style="background:${c.bg};border:1px solid ${c.bdr};color:rgba(255,255,255,.85);">${c.label}</span>`
  ).join("");
  qShowPanel(`
    <div class="quiz-panel">
      <div class="quiz-panel-line"></div>
      <div class="quiz-ptag">Zone 0${z.zoneId} · <span>${z.name}</span></div>
      <h2 class="quiz-panel-h2">Checkpoint Gate</h2>
      <div class="quiz-pquote">${z.quote}</div>
      <div class="quiz-echo-box">
        <div class="quiz-echo-who">ECHO</div>
        <p>${z.echoIntro}</p>
      </div>
      <div class="quiz-bin-chips">${chips}</div>
      <button class="quiz-btn">Open Checkpoint</button>
    </div>
  `, () => qBeginPlaying(idx));
}

function qShowStoryBeat(idx) {
  const z = QUIZ_DATA[idx], b = z.beat;
  const isLast = idx === QUIZ_DATA.length - 1;
  qShowPanel(`
    <div class="quiz-panel">
      <div class="quiz-panel-line"></div>
      <div class="quiz-ptag">Zone 0${z.zoneId} · <span>${isLast ? "All Zones Cleared" : "Checkpoint Cleared"}</span></div>
      <h2 class="quiz-panel-h2">${isLast ? "NULL Neutralised" : "Gate Open"}</h2>
      <div class="quiz-pquote" style="margin-bottom:14px;">${z.quote}</div>
      <div class="quiz-story-box" style="background:${b.bg};border-color:${b.bdr};">
        <div class="quiz-story-who" style="color:${b.col};">${b.speaker}</div>
        <p style="color:${b.col};">"${b.text}"</p>
      </div>
      <p class="quiz-hint-text">Score: ${qScore} · ${isLast ? "all zones cleared" : "gate open"}</p>
      <button class="quiz-btn">Checkpoint Cleared — Continue</button>
    </div>
  `, () => {
    // Always close after beating a single zone's quiz — the platformer
    // controls zone progression, not the quiz internally.
    qStopPlaying();
    $qOverlay.classList.add("hidden");
    if (qOnComplete) qOnComplete(true);
  });
}

function qShowGameOver() {
  const z = QUIZ_DATA[qZoneIdx];
  qShowPanel(`
    <div class="quiz-panel">
      <div class="quiz-panel-line"></div>
      <div class="quiz-ptag">NULL · <span>Signal Severed</span></div>
      <h2 class="quiz-panel-h2">Connection Dropped</h2>
      <div class="quiz-echo-box">
        <div class="quiz-echo-who">ECHO</div>
        <p>NULL overwhelmed the checkpoint. The knowledge is still there, Kai. The gate responds to repeated signal — try again.</p>
      </div>
      <div class="quiz-big-score">${qPad(qScore)}</div>
      <p class="quiz-hint-text">Zone 0${z.zoneId} · ${qZoneCorrect} classified this attempt</p>
      <button class="quiz-btn">Retry Checkpoint</button>
    </div>
  `, () => qStartZone(qZoneIdx));
}

// ─── GAME FLOW ────────────────────────────────────────────────────────────────
function qStartZone(idx) {
  qZoneIdx     = idx;
  qLives       = 3;
  qZoneCorrect = 0;
  qCards.forEach(c => c.el && c.el.remove());
  qCards = []; qCardId = 0; qSelId = null;
  qPool    = qShuffle(QUIZ_DATA[idx].pool);
  qPoolIdx = 0;
  qSetTheme(idx);
  if ($qZoneSub) $qZoneSub.textContent = QUIZ_DATA[idx].name.toLowerCase();
  qSetEcho(QUIZ_DATA[idx].echoLine);
  qBuildBins(QUIZ_DATA[idx]);
  qUpdateHUD();
  qShowZoneIntro(idx);
}

function qBeginPlaying(idx) {
  qGameActive = true;
  clearInterval(qFallTimer); clearInterval(qSpawnTimer);
  qFallTimer  = setInterval(qTick, Q_TICK_MS);
  const ms    = Math.max(850, Q_SPAWN_MS - idx * 280);
  qSpawnTimer = setInterval(qSpawnCard, ms);
  qSpawnCard();
}

function qStopPlaying() {
  qGameActive = false;
  clearInterval(qFallTimer); clearInterval(qSpawnTimer);
  qCards.forEach(c => c.el && c.el.remove());
  qCards = [];
  qDeselect();
}

// ─── CARDS ────────────────────────────────────────────────────────────────────
function qSpawnCard() {
  if (!qGameActive || qCards.length >= Q_MAX_CARDS) return;
  if (qPoolIdx >= qPool.length) { qPool = qShuffle(QUIZ_DATA[qZoneIdx].pool); qPoolIdx = 0; }
  const data  = qPool[qPoolIdx++];
  const id    = ++qCardId;
  const x     = (qCardId % 4) * 19 + 4 + Math.random() * 4;
  const speed = Q_BASE_SPD + qZoneIdx * Q_SPD_INC;
  const card  = { id, ...data, x, y: -(Q_CARD_H + 10), speed };
  card.el     = qMakeCardEl(card);
  qCards.push(card);
}

function qMakeCardEl(data) {
  const el = document.createElement("div");
  el.className = "quiz-card";
  el.id = `qc${data.id}`;
  el.draggable = true;
  el.style.cssText = `left:${data.x}%;top:${data.y}px`;
  el.innerHTML = `<div class="quiz-card-stripe"></div><div class="quiz-card-term">${data.term}</div><div class="quiz-card-hint"></div>`;
  el.addEventListener("dragstart", e => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", String(data.id));
    el.classList.add("dragging");
    qDeselect();
  });
  el.addEventListener("dragend", () => {
    el.classList.remove("dragging");
    if (!qSelId) document.querySelectorAll(".quiz-bin").forEach(b => b.classList.remove("hi"));
  });
  el.addEventListener("click", e => {
    e.stopPropagation();
    qSelId === data.id ? qDeselect() : qSelect(data.id);
  });
  $qPlay.appendChild(el);
  return el;
}

function qSelect(id) {
  qDeselect(); qSelId = id;
  const el = document.getElementById(`qc${id}`);
  if (!el) return;
  el.classList.add("sel");
  el.querySelector(".quiz-card-hint").textContent = "select bin ↓";
  document.querySelectorAll(".quiz-bin").forEach(b => b.classList.add("hi"));
}

function qDeselect() {
  if (qSelId !== null) {
    const el = document.getElementById(`qc${qSelId}`);
    if (el) { el.classList.remove("sel"); el.querySelector(".quiz-card-hint").textContent = ""; }
    qSelId = null;
    document.querySelectorAll(".quiz-bin").forEach(b => b.classList.remove("hi"));
  }
}

// ─── SORT ─────────────────────────────────────────────────────────────────────
function qHandleSort(cid, bid) {
  const idx = qCards.findIndex(c => c.id === cid);
  if (idx === -1) return;
  const card = qCards[idx], ok = card.cat === bid;
  card.el.remove(); qCards.splice(idx, 1); qDeselect();
  qFlashBin(bid, ok);

  if (ok) {
    qScore        += 10 * (qZoneIdx + 1);
    qZoneCorrect  += 1;
    const left = QUIZ_DATA[qZoneIdx].goal - qZoneCorrect;
    qSetEcho(left > 0
      ? `✓ Correct. ${left} signal${left === 1 ? "" : "s"} left to clear this zone.`
      : "✓ Zone signal restored.");
    qUpdateHUD();
    if (qZoneCorrect >= QUIZ_DATA[qZoneIdx].goal) {
      qStopPlaying();
      setTimeout(() => qShowStoryBeat(qZoneIdx), 350);
    }
  } else {
    qLives = Math.max(0, qLives - 1);
    qTriggerNull(); qShowToast(card.hint);
    qSetEcho(`NULL fragment. ${qLives} ${qLives === 1 ? "life" : "lives"} remaining.`);
    qUpdateHUD();
    if (qLives <= 0) { qStopPlaying(); setTimeout(qShowGameOver, 450); }
  }
}

// ─── TICK ─────────────────────────────────────────────────────────────────────
function qTick() {
  if (!qGameActive || !$qPlay) return;
  const h = $qPlay.clientHeight, missed = [];
  qCards.forEach(card => {
    card.y += card.speed;
    card.el.style.top = card.y + "px";
    if (card.y >= h) missed.push(card);
  });
  if (missed.length) {
    missed.forEach(card => { card.el.remove(); qCards.splice(qCards.indexOf(card), 1); });
    qLives = Math.max(0, qLives - missed.length);
    qTriggerNull();
    qSetEcho(`Signal lost. ${qLives} ${qLives === 1 ? "life" : "lives"} remaining.`);
    qUpdateHUD();
    if (qLives <= 0) { qStopPlaying(); setTimeout(qShowGameOver, 450); }
  }
}
