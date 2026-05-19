const ZONE_1 = {
  id: "zone1",
  name: "Zone 1 — The Broadcast District",
  tagline: "Everything looks like news here. Not everything is.",

  // Palette per the design doc — warm amber and burnt orange
  palette: {
    bg: "#2a1410", // deep amber-brown
    floor: "#3d2817",
    platform: "#8b5a2b", // antenna brown
    accent: "#ff9933", // amber glow
  },

  levelWidth: 2800,
  spawn: { x: 100, y: 100 },

  // Each platform: [x, y, width, height, optionalColor]
  // First entry is the floor
  platforms: [
    [0, 500, 2800, 40, "#3d2817"],
    [220, 420, 120, 16],
    [420, 360, 120, 16],
    [620, 300, 120, 16],
    [820, 380, 160, 16],
    [1100, 320, 120, 16],
    [1320, 260, 120, 16],
    [1560, 340, 160, 16],
    [1820, 400, 120, 16],
    [2080, 340, 120, 16],
    [2300, 280, 200, 16],
    [2600, 420, 120, 16],
  ],

  // Each enemy: { type, platformIndex, options }
  // platformIndex refers to the platforms array above
  enemies: [
    {
      type: "patrol",
      platformIndex: 4,
      options: { speed: 1, color: "#ff6b3d" },
      offsetX: 60,
    },
    {
      type: "patrol",
      platformIndex: 7,
      options: { speed: 1, color: "#ff6b3d" },
      offsetX: 60,
    },
    {
      type: "patrol",
      platformIndex: 10,
      options: { speed: 1.2, color: "#ff6b3d" },
      offsetX: 80,
    },
    {
      type: "patrol",
      platformIndex: 0,
      options: { speed: 0.8, color: "#ff6b3d" },
      offsetX: 600,
    },
  ],

  // Quiz pool — your colleague's code will read this
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

  // Story text shown after the quiz completes
  storyBeat: [
    'ECHO: "NULL scrambled every media signal in this district."',
    "...",
    "Mia's hologram flickers into view.",
    'Mia: "Zone 1 is the surface. NULL\'s roots go deeper. Keep going."',
  ],
};
