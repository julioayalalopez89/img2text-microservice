export async function imageTo3LayerHTML(
  file: File,
  options: {
    width?: number;
    characters?: string[];
    textType?: "sequence" | "random";
  } = {}
): Promise<string[]> {
  const { width = 100, characters = ["0", "1"], textType = "sequence" } = options;

  // leer imagen
  const bitmap = await createImageBitmap(file);

  // pintar en canvas para obtener pixels
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear canvas");
  const ratio = bitmap.width / bitmap.height;
  canvas.width = width;
  canvas.height = Math.round(width / ratio);
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

  // inicializar capas como arrays de líneas
  const layerBlack: string[] = [];
  const layerMid: string[] = [];
  const layerWhite: string[] = [];

  // helper para elegir caracter
  let count = -1;
  function nextChar() {
    if (characters.length === 1) return characters[0];
    if (textType === "random") {
      return characters[Math.floor(Math.random() * characters.length)];
    } else {
      count++;
      if (count >= characters.length) count = 0;
      return characters[count];
    }
  }

  // recorrer filas
  for (let y = 0; y < canvas.height; y++) {
    let rowBlack = "";
    let rowMid = "";
    let rowWhite = "";
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const gray = (r + g + b) / 3;

      const ch = nextChar();

      if (gray < 85) {
        // negro
        rowBlack += ch;
        rowMid += " ";
        rowWhite += " ";
      } else if (gray < 170) {
        // intermedio
        rowBlack += " ";
        rowMid += ch;
        rowWhite += " ";
      } else {
        // blanco
        rowBlack += " ";
        rowMid += " ";
        rowWhite += ch;
      }
    }
    layerBlack.push(rowBlack);
    layerMid.push(rowMid);
    layerWhite.push(rowWhite);
  }

  // devolver 3 párrafos HTML distintos
  return [
    `<pre>${layerBlack.join("\n")}</pre>`,
    `<pre>${layerMid.join("\n")}</pre>`,
    `<pre>${layerWhite.join("\n")}</pre>`,
  ];
}
