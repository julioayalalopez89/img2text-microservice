// Tests de humo de la API: arrancan la app en un puerto libre y llaman a los endpoints.
const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const os = require('os');
const path = require('path');
const fs = require('fs');
const { createCanvas } = require('canvas');

// Subidas en una carpeta temporal (debe definirse antes de cargar la app)
const UPLOAD_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'img2text-test-'));
process.env.UPLOAD_DIR = UPLOAD_DIR;
const app = require('../src/app');

let server;
let baseUrl;

// PNG de 20x10: franja negra, gris y blanca
function samplePng() {
  const canvas = createCanvas(20, 10);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 7, 10);
  ctx.fillStyle = '#888'; ctx.fillRect(7, 0, 6, 10);
  ctx.fillStyle = '#fff'; ctx.fillRect(13, 0, 7, 10);
  return canvas.toBuffer('image/png');
}

function postImage(fields = {}, withImage = true) {
  const form = new FormData();
  if (withImage) form.append('image', new Blob([samplePng()], { type: 'image/png' }), 'sample.png');
  for (const [k, v] of Object.entries(fields)) form.append(k, v);
  return fetch(`${baseUrl}/api/ocr`, { method: 'POST', body: form });
}

before(async () => {
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

after(() => {
  server.close();
  fs.rmSync(UPLOAD_DIR, { recursive: true, force: true });
});

test('GET / devuelve el estado del servicio', async () => {
  const res = await fetch(`${baseUrl}/`);
  assert.equal(res.status, 200);
  assert.equal((await res.json()).status, 'running');
});

test('GET /healthz responde 200', async () => {
  const res = await fetch(`${baseUrl}/healthz`);
  assert.equal(res.status, 200);
});

test('POST /api/ocr sin imagen responde 400', async () => {
  const res = await postImage({}, false);
  assert.equal(res.status, 400);
  assert.equal((await res.json()).success, false);
});

test('POST /api/ocr convierte la imagen a ASCII y borra la subida', async () => {
  const res = await postImage({ charWidth: '10' });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.success, true);
  const lines = body.text.trimEnd().split('\n');
  assert.equal(lines[0].length, 10);
  // Izquierda oscura (espacio), derecha clara (@)
  assert.equal(lines[0][0], ' ');
  assert.equal(lines[0][9], '@');
  assert.deepEqual(fs.readdirSync(UPLOAD_DIR), []);
});
