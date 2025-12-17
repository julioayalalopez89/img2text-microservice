// src/lib/pic2html.ts

export type TextType = "sequence" | "random";

export interface Pic2HtmlOptions {
  width?: number;              // ancho de la salida en caracteres
  characters?: string[];       // caracteres que se usan (por defecto ["0","1"])
  textType?: TextType;         // secuencia o aleatorio
  grayscale?: boolean;         // pasar imagen a escala de grises
  bgColor?: string;            // color de fondo (HTML color)
  fontSize?: number;           // tamaño de fuente
}

let textTypeCount = -1;

/**
 * Devuelve el siguiente carácter según las reglas
 */
function nextCharacter(
  chars: string[],
  textType: TextType,
): string {
  if (chars.length === 1) return chars[0];

  if (textType === "random") {
    const i = Math.floor(Math.random() * chars.length);
    return chars[i];
  }

  // textType === "sequence"
  textTypeCount++;
  if (textTypeCount >= chars.length) {
    textTypeCount = 0;
    return chars[0];
  }
  return chars[textTypeCount];
}

/**
 * Convierte una imagen a HTML en base a caracteres
 */
export async function imageToHTMLText(
  file: File,
  options: Pic2HtmlOptions = {}
): Promise<string> {
  const {
    width = 100,
    characters = ["0", "1"],
    textType = "sequence",
    grayscale = false,
    bgColor = "black",
    fontSize = -3,
  } = options;

  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject("No se pudo obtener el contexto 2D");

        const aspect = img.height / img.width;
        canvas.width = width;
        canvas.height = width * aspect;

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        let html = `<!-- Generated with pic2html.ts -->\n`;
        html += `<div style="background-color:${bgColor}; padding:10px;">\n`;
        html += `<pre style="font-size:${fontSize}px; line-height:7px;">\n`;

        for (let y = 0; y < canvas.height; y++) {
          for (let x = 0; x < canvas.width; x++) {
            const idx = (y * canvas.width + x) * 4;
            let r = data[idx];
            let g = data[idx + 1];
            let b = data[idx + 2];

            if (grayscale) {
              const avg = Math.round((r + g + b) / 3);
              r = g = b = avg;
            }

            const char = nextCharacter(characters, textType);
            html += `<span style="color:rgb(${r},${g},${b})">${char}</span>`;
          }
          html += "\n";
        }

        html += "</pre></div>";
        resolve(html);
      };

      img.onerror = () => reject("No se pudo cargar la imagen");
    };

    reader.onerror = () => reject("Error leyendo el archivo");
    reader.readAsDataURL(file);
  });
}
