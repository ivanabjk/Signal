// Platform factory — keeps platform creation tidy
function createPlatform(x, y, width, height, color = '#8b5a2b') {
  return { x, y, width, height, color, solid: true };
}

// Update logic for platforms that change over time (flickering ones in Zone 1)
// For now, all platforms are static — this is a no-op placeholder
function updatePlatforms(platforms) {
  // Will be expanded in Step 11 for flickering billboards
}