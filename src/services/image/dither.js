function applyDither(x, y, brightness, buffer, width) {
  const old = brightness;
  const newVal = old < 128 ? 0 : 255;
  const error = old - newVal;

  buffer[(y * width + x)] = newVal;

  if (x + 1 < width) buffer[y * width + x + 1] += error * 7 / 16;
  if (y + 1 < buffer.length / width) {
    if (x > 0) buffer[(y + 1) * width + x - 1] += error * 3 / 16;
    buffer[(y + 1) * width + x] += error * 5 / 16;
    if (x + 1 < width) buffer[(y + 1) * width + x + 1] += error * 1 / 16;
  }

  return newVal;
}

module.exports = { applyDither };
