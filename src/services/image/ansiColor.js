function colorize(char, r, g, b, enabled = false) {
  if (!enabled) return char;
  return `\x1b[38;2;${r};${g};${b}m${char}\x1b[0m`;
}

module.exports = { colorize };
