function htmlColor(char, r, g, b, enabled = false) {
  if (!enabled) return char;
  return `<span style="color:rgb(${r},${g},${b})">${char}</span>`;
}

module.exports = { htmlColor };
