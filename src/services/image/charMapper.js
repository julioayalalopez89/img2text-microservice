function brightnessToChar(brightness, characters) {
  const index = Math.floor(
    (brightness / 255) * (characters.length - 1)
  );
  return characters[index];
}

module.exports = { brightnessToChar };
