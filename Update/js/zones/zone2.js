// zone2.js
const ZONE_2 = {
  id: "zone2",
  name: "Zone 2 — The Social Quarter",
  tagline: "Everyone is talking. Nobody is listening.",

  palette: {
    bg: "#0a0a2a",
    floor: "#1a1430",
    platform: "#2a2040",
    accent: "#ff3399",
    wall: "#3a2055",
    billboard: "#ff66cc",
  },

  levelWidth: 700, // narrow shaft
  spawn: { x: 120, y: 460 },

  platforms: [
    // === Section A: Intro floor ===
    [0, 500, 700, 40, "#1a1430"], // ground floor
    [300, 420, 160, 16, "#2a2040"], // first ledge
    [500, 340, 160, 16, "#2a2040"], // second ledge
    [250, -140, 40, 200, "#1a1430"], // vertical obstacle
    [200, 260, 160, 16], // third ledge left
    [
      450,
      180,
      160,
      16,
      "#ff66cc",
      { onFrames: 300, offFrames: 200, startVisible: true },
    ], // flickering billboard
    [250, 100, 160, 16], // fifth ledge left
    [400, 20, 300, 16], // sixth ledge right
    [300, -60, 200, 16], // rest spot center
    [250, -140, 160, 16], // eighth ledge left
    [450, -220, 160, 16], // ninth ledge right
    [300, -300, 160, 16], // tenth ledge left
    [400, -380, 160, 16], // eleventh ledge right
    [70, -460, 350, 16], // twelfth ledge left
    [400, -540, 300, 16], // wide rest spot before tower

    // === Top walkway ===
    [100, -620, 300, 24, "#1a1430"], // top floor
  ],

  bubbleSpawners: [
    { x: 350, spawnY: 540, interval: 240, options: { speed: 0.7 }, maxKaiY: 0 },
  ],

  cameraRegions: [
    {
      x: 0,
      y: -900,
      width: 700,
      height: 1500,
      mode: "vertical",
      bounds: { minX: 0, maxX: 700, minY: -900, maxY: 560 },
    },
  ],

  enemies: [
    {
      behavior: "patrol",
      platformIndex: 0,
      options: { speed: 1.2, color: "#ff66cc" },
      offsetX: 200,
    },
    {
      behavior: "patrol",
      platformIndex: 7,
      options: { speed: 1.4, color: "#ff66cc" },
      offsetX: 30,
    },
    {
      behavior: "patrol",
      platformIndex: 13,
      options: { speed: 1.6, color: "#ff66cc" },
      offsetX: 40,
    },
  ],

  storyBeat: [
    'ECHO glitches: "NULL corrupted me too. It broke every communication channel in this quarter."',
    'ECHO stabilises: "I remember what I was built for. I’ll stay with you."',
    'Mia’s distorted voice: "The Quarter is just the noise. The real threat lives in the dark."',
  ],

  tower: {
    x: 200, // moved left from 300 → 200
    y: -720,
    width: 100,
    height: 100,
    color: "#ff3399",
    doorColor: "#3a0a25",
    door: { offsetX: 10, offsetY: 10, width: 80, height: 90 },
  },

  nextZone: null,
};
// Chain Zone 1 → Zone 2, Zone 2 → Zone 3
if (typeof ZONE_1 !== 'undefined') {
  ZONE_1.nextZone = ZONE_2;
}
if (typeof ZONE_3 !== 'undefined') {
  ZONE_2.nextZone = ZONE_3;
}