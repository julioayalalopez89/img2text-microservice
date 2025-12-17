function applyGamma(brightness, gamma = 1) {
  if (gamma === 1) return brightness;

  return 255 * Math.pow(brightness / 255, 1 / gamma);
}

module.exports = { applyGamma };
  