function edgeDetect(x, y, buffer, width) {
  const i = y * width + x;

  const gx =
    -buffer[i - width - 1] - 2 * buffer[i - 1] - buffer[i + width - 1] +
     buffer[i - width + 1] + 2 * buffer[i + 1] + buffer[i + width + 1];

  const gy =
    -buffer[i - width - 1] - 2 * buffer[i - width] - buffer[i - width + 1] +
     buffer[i + width - 1] + 2 * buffer[i + width] + buffer[i + width + 1];

  return Math.min(255, Math.sqrt(gx * gx + gy * gy));
}

module.exports = { edgeDetect };
