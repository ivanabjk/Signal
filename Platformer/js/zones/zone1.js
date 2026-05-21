const ZONE_1 = {
  id: "zone1",
  name: "Zone 1 — The Broadcast District",
  tagline: "Everything looks like news here. Not everything is.",

  palette: {
    bg: "#2a1410",
    floor: "#3d2817",
    platform: "#8b5a2b",
    accent: "#ff9933",
    wall: "#6b4520",
    billboard: "#c47a2b",
  },

  levelWidth: 6000,
  spawn: { x: 120, y: 100 },

  // [x, y, width, height, optionalColor, optionalFlickerConfig]
  platforms: [
    [0, 500, 6000, 40, "#3d2817"], // 0: floor

    // === Section A: Street Level Start (0–1200) ===
    [340, 420, 160, 16], // 1
    [700, 380, 160, 16], // 2
    [1020, 420, 140, 16], // 3

    // === Section B: Antenna Walls (1200–2800) ===
    [1320, 320, 36, 180, "#6b4520"], // 4: antenna wall 1 (shorter so double jump can clear)
    [1260, 320, 160, 16], // 5: ledge over wall 1
    [
      1540,
      400,
      160,
      16,
      null,
      { onFrames: 400, offFrames: 200, startVisible: true },
    ], // 6: billboard (slow)
    [1860, 320, 36, 180, "#6b4520"], // 7: antenna wall 2
    [1800, 320, 170, 16], // 8: ledge over wall 2
    [
      2080,
      360,
      160,
      16,
      null,
      { onFrames: 400, offFrames: 200, startVisible: false },
    ], // 9: billboard (off-cycle)
    [2400, 320, 36, 180, "#6b4520"], // 10: antenna wall 3
    [2340, 320, 170, 16], // 11: ledge over wall 3
    [2580, 400, 200, 16], // 12: mid platform (ad-bot)

    // === Section C: The Climb (2800–4400) ===
    [2960, 440, 140, 16], // 13: climb step 1
    [3200, 380, 140, 16], // 14: climb step 2
    [3440, 320, 140, 16], // 15: climb step 3
    [3680, 260, 220, 16], // 16: top of climb (ad-bot)
    [
      4000,
      320,
      160,
      16,
      null,
      { onFrames: 450, offFrames: 200, startVisible: true },
    ], // 17: billboard shortcut

    // === Section D: Tower Approach (4400–6000) ===
    [4480, 400, 180, 16], // 18: approach 1
    [
      4780,
      340,
      160,
      16,
      null,
      { onFrames: 300, offFrames: 300, startVisible: true },
    ], // 19: billboard 1
    [5100, 280, 160, 16],
    [5400, 240, 540, 24], // 21: tower door ledge
  ],

  spikes: [
    // Section B floor — between the antenna walls
    [1180, 484, 280], // before antenna wall 1
    [1580, 484, 280], // between walls 1 and 2
    [1960, 484, 280], // between walls 2 and 3
    [2440, 484, 120], // after wall 3 (small gap before mid platform)

    // Section C floor — across the climb section
    [2820, 484, 400], // floor below climb steps 1–3
    [3260, 484, 380], // floor below climb steps and top
    [3680, 484, 380], // floor below top of climb
  ],

  enemies: [
    // Section A — slow ad-bot well past spawn
    {
      behavior: "patrol",
      platformIndex: 0,
      options: { speed: 0.6, color: "#ff6b3d" },
      offsetX: 900,
    },
    // Section B — ad-bot on mid platform
    {
      behavior: "patrol",
      platformIndex: 12,
      options: { speed: 0.7, color: "#ff6b3d" },
      offsetX: 30,
    },
    // Section C — ad-bot on top of climb
    {
      behavior: "patrol",
      platformIndex: 16,
      options: { speed: 0.9, color: "#ff6b3d" },
      offsetX: 40,
    },
    // Section D — ad-bot patrolling floor under tower
    {
      behavior: "patrol",
      platformIndex: 0,
      options: { speed: 0.8, color: "#ff6b3d" },
      offsetX: 4900,
    },
  ],

  quizTopic: "Type of Media",
  quizPool: [
    "Instagram Post",
    "Newspaper Article",
    "Podcast Episode",
    "TV Commercial",
    "Billboard Ad",
    "Radio Broadcast",
    "TikTok Video",
    "Blog Post",
  ],

  storyBeat: [
    'ECHO: "NULL scrambled every media signal in this district."',
    "...",
    "Mia's hologram flickers into view.",
    'Mia: "Zone 1 is the surface. NULL\'s roots go deeper. Keep going."',
  ],

  tower: {
    x: 5820, // tower sits at the right end of the walkway
    y: 140,
    width: 100,
    height: 100, // short — sits on top of the walkway at y=240
    color: "#ff9933",
    doorColor: "#5a2d0a",
    // Door hitbox covers most of the tower so Kai easily triggers it
    door: { offsetX: 10, offsetY: 10, width: 80, height: 90 },
  },
};
