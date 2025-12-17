function applyContrast(brightness, contrast = 0) {
  if (contrast === 0) return brightness;

  const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
  let value = factor * (brightness - 128) + 128;

  return Math.max(0, Math.min(255, value));
}

module.exports = { applyContrast };
