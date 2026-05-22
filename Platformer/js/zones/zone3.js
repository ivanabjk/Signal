// zone3.js
const ZONE_3 = {
  id: "zone3",
  name: "Zone 3 — The Core Collapse",
  tagline: "NULL's final trick.",

  palette: {
    bg: "#050a05",
    floor: "#0a1408",
    platform: "#1a2a18",
    accent: "#ff2222",
    wall: "#1a0a0a",
    billboard: "#ff4444",
  },

  levelWidth: 5800,
  spawn: { x: 100, y: 400 },

  platforms: [
    // === Section A: Glitched Approach (0–700) ===
    [0, 500, 600, 40, "#0a1408"], // 0: floor
    [240, 420, 100, 16], // 1: low jump platform
    [440, 380, 100, 16], // 2: lure sits here
    [580, 340, 100, 16], // 3: leads up to bridge

    // === Bridge A → B (over the pit) ===
    [720, 320, 80, 16], // 4: REQUIRED — bridge
    [820, 300, 80, 16], // 5: REQUIRED — bridge

    // === Section B: Spike Pits + High Path Hammers (850–1900) ===
    [850, 500, 280, 40, "#0a1408"], // 6: floor segment 1
    [1230, 500, 240, 40, "#0a1408"], // 7: floor segment 2
    [1620, 500, 230, 40, "#0a1408"], // 8: floor segment 3
    [1090, 420, 130, 16], // 9: high path option 1
    [1550, 420, 170, 16], // 10: high path option 2
    [1860, 280, 30, 220, "#1a0a0a"], // 11: end wall
    [1820, 280, 140, 16], // 12: escape ledge over wall

    // === Bridge B → C ===
    [1980, 300, 100, 16], // 13: REQUIRED — bridge

    // === Section C: Flicker Climb (2080–2680) ===
    [
      2100,
      420,
      130,
      16,
      "#ff4444",
      { onFrames: 280, offFrames: 180, startVisible: true },
    ], // 14
    [
      2320,
      360,
      130,
      16,
      "#ff4444",
      { onFrames: 240, offFrames: 200, startVisible: false },
    ], // 15
    [
      2160,
      280,
      130,
      16,
      "#ff4444",
      { onFrames: 260, offFrames: 200, startVisible: true },
    ], // 16
    [
      2380,
      200,
      130,
      16,
      "#ff4444",
      { onFrames: 220, offFrames: 240, startVisible: false },
    ], // 17
    [2540, 140, 180, 16], // 18: safe rest at top

    // === Bridge C → D ===
    [2760, 180, 100, 16], // 19: REQUIRED — bridge

    // === Section D: Trap Room (2900–3700) ===
    [2900, 260, 100, 16], // 20: entry
    [3060, 340, 100, 16], // 21: fake
    [3200, 340, 100, 16], // 22: REAL (only safe path)
    [
      3340,
      340,
      100,
      16,
      "#ff4444",
      { onFrames: 180, offFrames: 220, startVisible: false },
    ], // 23: fake
    [3480, 380, 220, 40, "#0a1408"], // 24: safe floor with patrol bot

    // === Bridge D → E (drop into tunnel) ===
    [3760, 380, 110, 16], // 25: bridge — ends at x=3870 (drop point)

    // === Section E: Chaser Tunnel ===
    // === Section E: Chaser Tunnel ===
    [3750, 500, 1400, 40, "#0a1408"], // 26: tunnel floor
    [3750, 350, 120, 16, "#1a0a0a"], // 27: ceiling left piece (drop hole at 3870–3970)
    [3970, 350, 1180, 16, "#1a0a0a"], // 28: ceiling right piece
    [3740, 350, 10, 150, "#1a0a0a"], // 29: tunnel left wall (taller — 150px)
    [3970, 210, 30, 140, "#1a0a0a"], // 31: tall block above ceiling
    // === Bridge E → F ===
    [5160, 420, 80, 16], // 32: ledge up out of tunnel

    // === Section F: Final Climb (5250–5800) ===
    [5250, 500, 350, 40, "#0a1408"], // 33: base floor (chaser 2 spawns here)
    [5300, 420, 130, 16], // 34: climb step 1
    [5480, 360, 130, 16], // 35: climb step 2
    [
      5640,
      300,
      130,
      16,
      null,
      null,
      {
        path: [
          { x: 5640, y: 300 },
          { x: 5640, y: 220 },
        ],
        speed: 0.8,
        pingPong: true,
      },
    ], // 36: vertical mover
    [5460, 180, 130, 16], // 37
    [
      5640,
      100,
      130,
      16,
      "#ff4444",
      { onFrames: 280, offFrames: 180, startVisible: true },
    ], // 38: flicker
    [5460, 20, 130, 16], // 39
    [5580, -60, 280, 24, "#0a1408"], // 40: tower walkway
  ],

  spikes: [
    // Sections B's pits
    [1130, 484, 100], // pit 1
    [1520, 484, 100], // pit 2

    // Death pits under sections
    [1980, 484, 720], // under Section C
    [2980, 484, 480], // under Section D
    [5600, 484, 280], // under Section F climb

    // Spike clusters INSIDE the tunnel
    [4250, 484, 12], // cluster 1
    [4600, 484, 12], // cluster 2
    [4950, 484, 12], // cluster 3
  ],

  hammers: [
    // Section B — two hammers over the high path
    {
      x: 1190,
      y: 320,
      length: 90,
      headSize: 28,
      swingSpeed: 0.004,
      phase: 0,
      arc: Math.PI / 2.5,
    },
    {
      x: 1580,
      y: 320,
      length: 90,
      headSize: 28,
      swingSpeed: 0.004,
      phase: Math.PI,
      arc: Math.PI / 2.5,
    },

    // Section D — one hammer over the trap room
    {
      x: 3200,
      y: 220,
      length: 100,
      headSize: 32,
      swingSpeed: 0.0035,
      phase: 0,
      arc: Math.PI / 3,
    },

  ],

  // bubbleSpawners: [
  //   // Sparse bubbles only in the trap room
  //   { x: 3200, spawnY: 540, interval: 360, options: { speed: 0.7 } },
  // ],

  cameraRegions: [
    {
      // Final climb section — free camera so it follows up
      x: 5200,
      y: -200,
      width: 600,
      height: 2000,
      mode: "free",
      bounds: { minX: 5200, maxX: 5800, minY: -300, maxY: 800 },
    },
  ],

  enemies: [
    // === Section A — slow patrol on floor ===
    {
      behavior: "patrol",
      platformIndex: 0,
      options: { speed: 0.8, color: "#1a1a1a", eyeColor: "#ff2222" },
      offsetX: 400,
    },

    // === Section A — stationary lure on platform 2 (fake reward) ===
    {
      behavior: "stationary",
      x: 470,
      y: 350,
      width: 28,
      height: 28,
      color: "#66ff66",
      eyeColor: "#ff2222",
    },

    // === Section D — patrol bot on the safe floor (platform 24) ===
    {
      behavior: "patrol",
      platformIndex: 24,
      options: { speed: 1.2, color: "#1a1a1a", eyeColor: "#ff2222" },
      offsetX: 30,
    },

    // === Section D — stationary lure floating in middle (fake checkpoint) ===
    {
      behavior: "stationary",
      x: 3210,
      y: 280,
      width: 28,
      height: 28,
      color: "#66ff66",
      eyeColor: "#ff2222",
    },


    // === Section E (TUNNEL) — CHASER 1 ===
    // Sits dormant 100px LEFT of where Kai drops in (drop at x=3870, chaser at x=3770)
    // Activates 1 second after Kai enters the tunnel
    {
      behavior: "chaser",
      x: 3770,
      y: 460,
      width: 40,
      height: 40,
      color: "#0a0a0a",
      options: {
        speed: 2.3,
        activationDelay: 60, // 1-second warning after triggering
        triggerRegion: {
          x: 3850,
          y: 400,
          width: 1300,
          height: 100,
        },
      },
    },

    // === Section F — CHASER 2 at base of final climb ===
    {
      behavior: "chaser",
      x: 5530,
      y: 460,
      width: 40,
      height: 40,
      color: "#0a0a0a",
      options: { speed: 1.8, activationDelay: 60 },
    },
  ],

  quizTopic: "Type of Bias",
  quizPool: [
    "Placeholder 1",
    "Placeholder 2",
    "Placeholder 3",
    "Placeholder 4",
  ],

  storyBeat: [
    'ECHO: "This is the core. NULL\'s heart."',
    "Static crackles violently.",
    'NULL: "you∆should∆not∆be∆here"',
    'Mia: "Kai — the truth was inside the noise the whole time. End it."',
  ],

  tower: {
    x: 5700,
    y: -160,
    width: 100,
    height: 100,
    color: "#ff2222",
    doorColor: "#1a0000",
    door: { offsetX: 10, offsetY: 10, width: 80, height: 90 },
  },

  nextZone: null,
};

if (typeof ZONE_2 !== "undefined") {
  ZONE_2.nextZone = ZONE_3;
}
