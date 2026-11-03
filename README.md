# img2text-microservice

Microservicio en Node.js + Express que convierte una imagen en **texto ASCII**.
Opcionalmente puede colorear cada carácter (códigos ANSI para terminal, o HTML con `<span>` de color).

## Requisitos

- Node.js 18.11 o superior (el script `dev` usa `node --watch`).
- `canvas` trae binarios precompilados para Windows, macOS y Linux. Si en tu sistema no hay binario,
  revisa las [dependencias de node-canvas](https://github.com/Automattic/node-canvas#compiling).

## Instalación

```bash
npm install
cp .env.example .env   # opcional: cambiar PORT o UPLOAD_DIR
npm start              # producción
npm run dev            # desarrollo, reinicia al guardar
```

El servicio escucha en `http://localhost:3000` (o el `PORT` que configures).

### Variables de entorno

| Variable | Por defecto | Descripción |
|---|---|---|
| `PORT` | `3000` | Puerto HTTP. |
| `UPLOAD_DIR` | `./uploads` | Carpeta temporal para las imágenes subidas. Se crea sola al arrancar; cada archivo se borra después de procesarlo (también si falla). |

## Uso

`POST /api/ocr` con `multipart/form-data`. El archivo va en el campo `image`.

```bash
curl -F image=@foto.png http://localhost:3000/api/ocr
```

Con opciones:

```bash
curl -F image=@foto.png -F charWidth=120 -F contrast=40 -F dither=true \
  http://localhost:3000/api/ocr
```

Respuesta:

```json
{ "success": true, "text": "      .:-=+*#%@ ...\n..." }
```

Si no se envía imagen responde `400` con `{ "success": false, "error": "No image provided" }`;
si falla el procesado, `500` con el mensaje de error.

`GET /` devuelve el estado del servicio (`{ "service": ..., "status": "running" }`).
`GET /healthz` responde `200` con `{ "status": "ok" }` (health check del contenedor).

### Opciones (campos del formulario)

| Campo | Tipo | Por defecto | Descripción |
|---|---|---|---|
| `charWidth` | entero | `80` | Ancho del resultado en caracteres. |
| `charHeight` | entero | automático | Alto en caracteres. Si no se indica, se calcula a partir de la proporción de la imagen y `charAspect`. |
| `charAspect` | número | `0.5` | Relación alto/ancho de un carácter de la fuente (corrige que los caracteres sean más altos que anchos). |
| `characters` | texto | ` .:-=+*#%@` | Caracteres usados de píxel oscuro a píxel claro (cada carácter es un nivel). |
| `contrast` | número | `0` | Ajuste de contraste, de `-255` a `255`. |
| `gamma` | número | `1` | Corrección gamma. |
| `dither` | `true`/`false` | `false` | Aplica dithering. |
| `edge` | `true`/`false` | `false` | Detección de bordes. |
| `color` | `true`/`false` | `false` | Colorea cada carácter con el color del píxel (ANSI por defecto). |
| `html` | `true`/`false` | `false` | Junto con `color=true`, devuelve el color como HTML en vez de ANSI. |

Ejemplo en HTML con color:

```bash
curl -F image=@foto.png -F color=true -F html=true http://localhost:3000/api/ocr
```

## Tests

```bash
npm test   # node:test, sin dependencias extra
```

## Docker

```bash
docker build -t img2text .
docker run -p 3000:3000 img2text
```

La imagen instala las librerías de sistema que necesita `canvas` (Cairo, Pango, libjpeg, libgif, librsvg).

## CI y despliegue

- **CI** (`.github/workflows/ci.yml`): en cada pull request, `npm ci` + `npm test` (Node 20 y 22) y build + arranque de la imagen Docker.
- **Deploy** (`.github/workflows/deploy.yml`): en cada push a `main`, build en Azure Container Registry y despliegue en Azure Container Apps (mismo Azure que appointments-service). Si faltan los secrets de Azure se salta con un aviso. Configuración: [docs/AZURE_SETUP.md](docs/AZURE_SETUP.md).

## Estructura

```
src/
  server.js                 # arranque (carga .env, crea UPLOAD_DIR, escucha en PORT)
  app.js                    # app Express y rutas
  routes/img2text.routes.js # POST /api/ocr
  controllers/              # lee las opciones y borra el archivo subido
  services/                 # conversión imagen → texto y filtros (contraste, gamma, dither, bordes, color)
  middlewares/              # subida con multer
```
